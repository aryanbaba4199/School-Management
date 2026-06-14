import { Types } from 'mongoose';
import { 
  AttendanceRecordModel, 
  AttendanceAuditLogModel, 
  AttendanceSettingsModel, 
  RfidCardModel, 
  AttendanceCorrectionRequestModel,
  IAttendanceRecord, 
  AttendanceStatus, 
  AttendanceSource, 
  PersonType 
} from './attendance.model';
import { 
  BulkMarkStudentAttendanceDto, 
  BulkMarkTeacherAttendanceDto, 
  UpdateAttendanceSettingsDto, 
  CreateRfidCardDto, 
  ScanRfidAttendanceDto,
  CreateCorrectionRequestDto,
  ResolveCorrectionRequestDto,
  UpdateStudentAttendanceDto,
  UpdateTeacherAttendanceDto,
  MarkStudentAttendanceDto,
  MarkTeacherAttendanceDto
} from './dto/attendance.dto';
import { UserModel } from '../user/user.model';
import { sendParentNotification } from './utils/notification.util';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export class AttendanceService {
  /**
   * Fetch student attendance with filtering.
   */
  async getStudentAttendance(filters: {
    schoolId?: Types.ObjectId;
    classId?: Types.ObjectId;
    sectionId?: Types.ObjectId;
    date?: Date;
    personId?: Types.ObjectId;
    parentChildrenIds?: Types.ObjectId[];
  }) {
    const query: Record<string, unknown> = { personType: 'STUDENT' };
    
    if (filters.schoolId) query.schoolId = filters.schoolId;
    if (filters.classId) query.classId = filters.classId;
    if (filters.sectionId) query.sectionId = filters.sectionId;
    
    if (filters.personId) {
      query.personId = filters.personId;
    } else if (filters.parentChildrenIds) {
      query.personId = { $in: filters.parentChildrenIds };
    }
    
    if (filters.date) {
      const startOfDay = dayjs(filters.date).startOf('day').toDate();
      const endOfDay = dayjs(filters.date).endOf('day').toDate();
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    return AttendanceRecordModel.find(query)
      .populate('personId', 'name userCode email')
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Fetch teacher attendance with filtering.
   */
  async getTeacherAttendance(filters: {
    schoolId?: Types.ObjectId;
    date?: Date;
    personId?: Types.ObjectId;
  }) {
    const query: Record<string, unknown> = { personType: 'TEACHER' };
    
    if (filters.schoolId) query.schoolId = filters.schoolId;
    if (filters.personId) query.personId = filters.personId;
    
    if (filters.date) {
      const startOfDay = dayjs(filters.date).startOf('day').toDate();
      const endOfDay = dayjs(filters.date).endOf('day').toDate();
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    return AttendanceRecordModel.find(query)
      .populate('personId', 'name userCode email')
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Process a bulk student attendance update/upsert operation safely via bulkWrite.
   * Also writes audit logs for any modifications.
   */
  async bulkMarkStudentAttendance(
    schoolId: Types.ObjectId,
    data: BulkMarkStudentAttendanceDto,
    changedBy: Types.ObjectId
  ) {
    const targetDate = dayjs.utc(data.date).startOf('day').toDate();
    const classId = new Types.ObjectId(data.classId);
    const sectionId = new Types.ObjectId(data.sectionId);

    // Validate that all students belong to the school, class, and section
    const studentIds = data.records.map(r => new Types.ObjectId(r.studentId));
    const validStudentsCount = await UserModel.countDocuments({
      _id: { $in: studentIds },
      schoolId,
      classId,
      sectionId,
      'role.name': 'STUDENT',
      isActive: true
    }).exec();

    if (validStudentsCount !== studentIds.length) {
      throw new Error('Validation Error: One or more students do not belong to the specified school, class, or section.');
    }

    const existingRecords = await AttendanceRecordModel.find({
      schoolId,
      personType: 'STUDENT',
      date: targetDate,
      personId: { $in: studentIds }
    }).exec();

    const existingMap = new Map<string, IAttendanceRecord>();
    for (const record of existingRecords) {
      existingMap.set(record.personId.toString(), record);
    }

    const bulkOps = [];
    const auditLogs = [];

    for (const record of data.records) {
      const studentId = new Types.ObjectId(record.studentId);
      const existing = existingMap.get(record.studentId);

      if (existing && existing.status === record.status && existing.remarks === record.remarks) {
        continue;
      }

      if (existing && existing.isLocked) {
        throw new Error(`Attendance for student ${record.studentId} is locked and cannot be modified.`);
      }

      bulkOps.push({
        updateOne: {
          filter: {
            schoolId,
            personType: 'STUDENT' as PersonType,
            personId: studentId,
            date: targetDate
          },
          update: {
            $set: {
              classId,
              sectionId,
              status: record.status,
              source: 'MANUAL' as AttendanceSource,
              remarks: record.remarks,
              updatedBy: changedBy,
              ...(!existing ? { markedBy: changedBy } : {})
            }
          },
          upsert: true,
        }
      });
    }

    if (bulkOps.length === 0) {
      return { modifiedCount: 0, upsertedCount: 0 };
    }

    const result = await AttendanceRecordModel.bulkWrite(bulkOps);

    const updatedRecords = await AttendanceRecordModel.find({
      schoolId,
      personType: 'STUDENT',
      date: targetDate,
      personId: { $in: data.records.map(r => new Types.ObjectId(r.studentId)) }
    }).exec();

    for (const newRec of updatedRecords) {
      const existing = existingMap.get(newRec.personId.toString());
      if (!existing || existing.status !== newRec.status || existing.remarks !== newRec.remarks) {
        auditLogs.push({
          schoolId,
          attendanceId: newRec._id,
          changedBy,
          previousStatus: existing ? existing.status : undefined,
          newStatus: newRec.status,
          previousData: existing ? existing.toObject() : undefined,
          newData: newRec.toObject(),
          reason: 'Bulk manual update',
        });
      }
    }

    if (auditLogs.length > 0) {
      await AttendanceAuditLogModel.insertMany(auditLogs);
    }

    // Trigger parent notifications
    try {
      const settings = await this.getAttendanceSettings(schoolId);
      if (settings.notifyParentsOnAbsent || settings.notifyParentsOnLate) {
        for (const record of data.records) {
          if (record.status === 'ABSENT' && settings.notifyParentsOnAbsent) {
            await sendParentNotification(schoolId, new Types.ObjectId(record.studentId), 'ABSENT', { date: targetDate });
          } else if (record.status === 'LATE' && settings.notifyParentsOnLate) {
            await sendParentNotification(schoolId, new Types.ObjectId(record.studentId), 'LATE', { date: targetDate });
          }
        }
      }
    } catch (err) {
      console.error('Failed to send notifications during bulk student marking:', err);
    }

    return {
      modifiedCount: result.modifiedCount || 0,
      upsertedCount: result.upsertedCount || 0,
    };
  }

  /**
   * Bulk mark teacher attendance.
   */
  async bulkMarkTeacherAttendance(
    schoolId: Types.ObjectId,
    data: BulkMarkTeacherAttendanceDto,
    changedBy: Types.ObjectId
  ) {
    const targetDate = dayjs.utc(data.date).startOf('day').toDate();

    // Validate that all teachers belong to this school
    const teacherIds = data.records.map(r => new Types.ObjectId(r.teacherId));
    const validTeachersCount = await UserModel.countDocuments({
      _id: { $in: teacherIds },
      schoolId,
      'role.name': 'TEACHER',
      isActive: true
    }).exec();

    if (validTeachersCount !== teacherIds.length) {
      throw new Error('Validation Error: One or more teachers do not belong to this school.');
    }

    const existingRecords = await AttendanceRecordModel.find({
      schoolId,
      personType: 'TEACHER',
      date: targetDate,
      personId: { $in: teacherIds }
    }).exec();

    const existingMap = new Map<string, IAttendanceRecord>();
    for (const record of existingRecords) {
      existingMap.set(record.personId.toString(), record);
    }

    const bulkOps = [];
    const auditLogs = [];

    for (const record of data.records) {
      const teacherId = new Types.ObjectId(record.teacherId);
      const existing = existingMap.get(record.teacherId);

      const checkInDate = record.checkInTime ? new Date(record.checkInTime) : undefined;
      const checkOutDate = record.checkOutTime ? new Date(record.checkOutTime) : undefined;

      if (
        existing && 
        existing.status === record.status && 
        existing.remarks === record.remarks &&
        existing.checkInTime?.getTime() === checkInDate?.getTime() &&
        existing.checkOutTime?.getTime() === checkOutDate?.getTime()
      ) {
        continue;
      }

      if (existing && existing.isLocked) {
        throw new Error(`Attendance for teacher ${record.teacherId} is locked and cannot be modified.`);
      }

      bulkOps.push({
        updateOne: {
          filter: {
            schoolId,
            personType: 'TEACHER' as PersonType,
            personId: teacherId,
            date: targetDate
          },
          update: {
            $set: {
              status: record.status,
              source: 'MANUAL' as AttendanceSource,
              remarks: record.remarks,
              checkInTime: checkInDate,
              checkOutTime: checkOutDate,
              updatedBy: changedBy,
              ...(!existing ? { markedBy: changedBy } : {})
            }
          },
          upsert: true,
        }
      });
    }

    if (bulkOps.length === 0) {
      return { modifiedCount: 0, upsertedCount: 0 };
    }

    const result = await AttendanceRecordModel.bulkWrite(bulkOps);

    const updatedRecords = await AttendanceRecordModel.find({
      schoolId,
      personType: 'TEACHER',
      date: targetDate,
      personId: { $in: data.records.map(r => new Types.ObjectId(r.teacherId)) }
    }).exec();

    for (const newRec of updatedRecords) {
      const existing = existingMap.get(newRec.personId.toString());
      if (
        !existing || 
        existing.status !== newRec.status || 
        existing.remarks !== newRec.remarks ||
        existing.checkInTime?.getTime() !== newRec.checkInTime?.getTime() ||
        existing.checkOutTime?.getTime() !== newRec.checkOutTime?.getTime()
      ) {
        auditLogs.push({
          schoolId,
          attendanceId: newRec._id,
          changedBy,
          previousStatus: existing ? existing.status : undefined,
          newStatus: newRec.status,
          previousData: existing ? existing.toObject() : undefined,
          newData: newRec.toObject(),
          reason: 'Bulk manual update',
        });
      }
    }

    if (auditLogs.length > 0) {
      await AttendanceAuditLogModel.insertMany(auditLogs);
    }

    return {
      modifiedCount: result.modifiedCount || 0,
      upsertedCount: result.upsertedCount || 0,
    };
  }

  /**
   * Get attendance settings for a school, return default settings if not configured yet.
   */
  async getAttendanceSettings(schoolId: Types.ObjectId) {
    const settings = await AttendanceSettingsModel.findOne({ schoolId }).exec();
    if (!settings) {
      return {
        schoolId,
        studentAttendanceMode: 'MANUAL',
        teacherAttendanceMode: 'MANUAL',
        lateAfterTime: '08:30',
        halfDayAfterTime: '12:00',
        autoAbsentAfterTime: '14:00',
        allowTeacherCorrection: true,
        requireAdminApprovalForCorrection: false,
        notifyParentsOnAbsent: false,
        notifyParentsOnLate: false,
      };
    }
    return settings;
  }

  /**
   * Update or create school attendance settings.
   */
  async updateAttendanceSettings(schoolId: Types.ObjectId, data: UpdateAttendanceSettingsDto) {
    return AttendanceSettingsModel.findOneAndUpdate(
      { schoolId },
      { $set: data },
      { new: true, upsert: true }
    ).exec();
  }

  /**
   * RFID card operations
   */
  async getRfidCards(schoolId: Types.ObjectId) {
    return RfidCardModel.find({ schoolId })
      .populate('personId', 'name userCode role')
      .exec();
  }

  async createRfidCard(schoolId: Types.ObjectId, data: CreateRfidCardDto) {
    const existing = await RfidCardModel.findOne({ schoolId, cardUid: data.cardUid }).exec();
    if (existing) {
      throw new Error(`RFID Card with UID ${data.cardUid} is already registered in this school.`);
    }
    const newCard = new RfidCardModel({
      schoolId,
      ...data
    });
    return newCard.save();
  }

  async updateRfidCard(schoolId: Types.ObjectId, cardId: Types.ObjectId, data: { isActive: boolean }) {
    const updated = await RfidCardModel.findOneAndUpdate(
      { _id: cardId, schoolId },
      { $set: { isActive: data.isActive, blockedAt: data.isActive ? undefined : new Date() } },
      { new: true }
    ).exec();
    if (!updated) {
      throw new Error('RFID card not found.');
    }
    return updated;
  }

  async deleteRfidCard(schoolId: Types.ObjectId, cardId: Types.ObjectId) {
    const deleted = await RfidCardModel.findOneAndDelete({ _id: cardId, schoolId }).exec();
    if (!deleted) {
      throw new Error('RFID card not found.');
    }
    return deleted;
  }

  /**
   * Scan RFID Card: Processes a scan event and upserts an attendance record.
   */
  async scanRfidCard(schoolId: Types.ObjectId, data: ScanRfidAttendanceDto) {
    const scanTime = data.timestamp ? dayjs(data.timestamp) : dayjs();
    const targetDate = scanTime.clone().startOf('day').toDate();

    // Find registered, active card
    const card = await RfidCardModel.findOne({ schoolId, cardUid: data.cardUid, isActive: true }).exec();
    if (!card) {
      throw new Error(`Active card with UID ${data.cardUid} not found.`);
    }

    // Fetch school settings
    const settings = await this.getAttendanceSettings(schoolId);

    // Check if record already exists for today
    let record = await AttendanceRecordModel.findOne({
      schoolId,
      personType: card.personType,
      personId: card.personId,
      date: targetDate
    }).exec();

    if (record) {
      // Record exists -> update checkOutTime
      record.checkOutTime = scanTime.toDate();
      record.source = 'RFID';
      await record.save();
    } else {
      // Record does not exist -> calculate status based on lateAfterTime threshold
      let status: AttendanceStatus = 'PRESENT';
      if (settings.lateAfterTime) {
        const [lateH, lateM] = settings.lateAfterTime.split(':').map(Number);
        const localScan = scanTime.tz('Asia/Kolkata'); // default school timezone
        const scanH = localScan.hour();
        const scanM = localScan.minute();
        if (scanH > lateH || (scanH === lateH && scanM > lateM)) {
          status = 'LATE';
        }
      }

      record = new AttendanceRecordModel({
        schoolId,
        personType: card.personType,
        personId: card.personId,
        date: targetDate,
        status,
        source: 'RFID',
        checkInTime: scanTime.toDate(),
        isLocked: false
      });
      await record.save();
    }

    return record.populate('personId', 'name userCode role');
  }

  /**
   * Reports calculation & aggregations
   */
  async getDailyAttendanceReport(schoolId: Types.ObjectId, dateStr?: string, personType: PersonType = 'STUDENT') {
    const date = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();

    const records = await AttendanceRecordModel.find({
      schoolId,
      personType,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('personId', 'name userCode classId sectionId').exec();

    const counts = {
      total: records.length,
      PRESENT: records.filter(r => r.status === 'PRESENT').length,
      ABSENT: records.filter(r => r.status === 'ABSENT').length,
      LATE: records.filter(r => r.status === 'LATE').length,
      HALF_DAY: records.filter(r => r.status === 'HALF_DAY').length,
      EXCUSED: records.filter(r => r.status === 'EXCUSED').length,
      ON_LEAVE: records.filter(r => r.status === 'ON_LEAVE').length,
    };

    return {
      date: dayjs(date).format('YYYY-MM-DD'),
      personType,
      counts,
      records
    };
  }

  async getMonthlyAttendanceReport(
    schoolId: Types.ObjectId, 
    year: number, 
    month: number, 
    classId?: Types.ObjectId, 
    sectionId?: Types.ObjectId,
    personType: PersonType = 'STUDENT'
  ) {
    const startDate = dayjs().year(year).month(month - 1).startOf('month').toDate();
    const endDate = dayjs().year(year).month(month - 1).endOf('month').toDate();

    const query: Record<string, unknown> = {
      schoolId,
      personType,
      date: { $gte: startDate, $lte: endDate }
    };

    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    const records = await AttendanceRecordModel.find(query)
      .populate('personId', 'name userCode classId sectionId')
      .sort({ date: 1 })
      .exec();

    // Fetch all active users matching role, schoolId, classId, sectionId to construct complete stats
    const userQuery: Record<string, unknown> = {
      schoolId,
      'role.name': personType,
      isActive: true
    };
    if (personType === 'STUDENT') {
      if (classId) userQuery.classId = classId;
      if (sectionId) userQuery.sectionId = sectionId;
    }

    const users = await UserModel.find(userQuery).select('name userCode').exec();

    // Calculate stats
    const stats = users.map(user => {
      const userRecords = records.filter(r => {
        const pId = typeof r.personId === 'object' && r.personId ? (r.personId as any)._id : r.personId;
        return pId.toString() === user._id.toString();
      });

      const present = userRecords.filter(r => r.status === 'PRESENT').length;
      const absent = userRecords.filter(r => r.status === 'ABSENT').length;
      const late = userRecords.filter(r => r.status === 'LATE').length;
      const halfDay = userRecords.filter(r => r.status === 'HALF_DAY').length;
      const leave = userRecords.filter(r => r.status === 'ON_LEAVE' || r.status === 'EXCUSED').length;

      const presentDaysTotal = present + late + (halfDay * 0.5) + leave;
      const totalLogged = userRecords.length;
      const attendancePct = totalLogged > 0 ? Math.round((presentDaysTotal / totalLogged) * 100) : 100;

      return {
        userId: user._id.toString(),
        name: user.name,
        userCode: user.userCode,
        present,
        absent,
        late,
        halfDay,
        leave,
        totalLogged,
        attendancePct
      };
    });

    return {
      stats,
      records
    };
  }

  /**
   * Single record mark/create operations
   */
  async createStudentAttendanceRecord(schoolId: Types.ObjectId, data: MarkStudentAttendanceDto, markedBy: Types.ObjectId) {
    const targetDate = dayjs.utc(data.date).startOf('day').toDate();
    const classId = new Types.ObjectId(data.classId);
    const sectionId = new Types.ObjectId(data.sectionId);
    const studentId = new Types.ObjectId(data.studentId);

    // Validate membership
    const studentExists = await UserModel.countDocuments({
      _id: studentId,
      schoolId,
      classId,
      sectionId,
      'role.name': 'STUDENT',
      isActive: true
    }).exec();

    if (!studentExists) {
      throw new Error('Validation Error: Student does not belong to the specified school, class, or section.');
    }

    const record = await AttendanceRecordModel.findOneAndUpdate(
      { schoolId, personType: 'STUDENT', personId: studentId, date: targetDate },
      {
        $set: {
          classId,
          sectionId,
          status: data.status,
          remarks: data.remarks,
          source: 'MANUAL',
          markedBy,
          updatedBy: markedBy
        }
      },
      { new: true, upsert: true }
    ).exec();

    // Trigger parent notification
    try {
      const settings = await this.getAttendanceSettings(schoolId);
      if (data.status === 'ABSENT' && settings.notifyParentsOnAbsent) {
        await sendParentNotification(schoolId, studentId, 'ABSENT', { date: targetDate });
      } else if (data.status === 'LATE' && settings.notifyParentsOnLate) {
        await sendParentNotification(schoolId, studentId, 'LATE', { date: targetDate });
      }
    } catch (err) {
      console.error('Failed to send notification in createStudentAttendanceRecord:', err);
    }

    return record;
  }

  async createTeacherAttendanceRecord(schoolId: Types.ObjectId, data: MarkTeacherAttendanceDto, markedBy: Types.ObjectId) {
    const targetDate = dayjs.utc(data.date).startOf('day').toDate();
    const teacherId = new Types.ObjectId(data.teacherId);

    // Validate membership
    const teacherExists = await UserModel.countDocuments({
      _id: teacherId,
      schoolId,
      'role.name': 'TEACHER',
      isActive: true
    }).exec();

    if (!teacherExists) {
      throw new Error('Validation Error: Teacher does not belong to this school.');
    }

    const checkInDate = data.checkInTime ? new Date(data.checkInTime) : undefined;
    const checkOutDate = data.checkOutTime ? new Date(data.checkOutTime) : undefined;

    return AttendanceRecordModel.findOneAndUpdate(
      { schoolId, personType: 'TEACHER', personId: teacherId, date: targetDate },
      {
        $set: {
          status: data.status,
          remarks: data.remarks,
          checkInTime: checkInDate,
          checkOutTime: checkOutDate,
          source: 'MANUAL',
          markedBy,
          updatedBy: markedBy
        }
      },
      { new: true, upsert: true }
    ).exec();
  }

  /**
   * Submit a correction request (typically for a teacher if admin approval is required).
   */
  async createCorrectionRequest(
    schoolId: Types.ObjectId,
    data: CreateCorrectionRequestDto,
    requestedBy: Types.ObjectId
  ) {
    const attendance = await AttendanceRecordModel.findOne({ _id: data.attendanceId, schoolId }).exec();
    if (!attendance) {
      throw new Error('Attendance record not found.');
    }

    const request = new AttendanceCorrectionRequestModel({
      schoolId,
      attendanceId: attendance._id,
      requestedBy,
      previousStatus: attendance.status,
      requestedStatus: data.requestedStatus,
      reason: data.reason,
      status: 'PENDING',
    });

    return request.save();
  }

  /**
   * List pending correction requests for a school.
   */
  async getPendingCorrectionRequests(schoolId: Types.ObjectId) {
    return AttendanceCorrectionRequestModel.find({ schoolId, status: 'PENDING' })
      .populate('attendanceId')
      .populate('requestedBy', 'name role')
      .exec();
  }

  /**
   * Resolve a pending correction request (approve or reject).
   */
  async resolveCorrectionRequest(
    schoolId: Types.ObjectId,
    requestId: Types.ObjectId,
    data: ResolveCorrectionRequestDto,
    approvedBy: Types.ObjectId
  ) {
    const request = await AttendanceCorrectionRequestModel.findOne({ _id: requestId, schoolId }).exec();
    if (!request) {
      throw new Error('Correction request not found.');
    }
    if (request.status !== 'PENDING') {
      throw new Error('Correction request has already been resolved.');
    }

    if (data.action === 'APPROVE') {
      request.status = 'APPROVED';
      request.approvedBy = approvedBy;
      request.resolvedAt = new Date();
      await request.save();

      // Update the attendance record
      const attendance = await AttendanceRecordModel.findById(request.attendanceId).exec();
      if (attendance) {
        const previousStatus = attendance.status;
        attendance.status = request.requestedStatus;
        attendance.updatedBy = approvedBy;
        await attendance.save();

        // Create audit log
        const auditLog = new AttendanceAuditLogModel({
          schoolId,
          attendanceId: attendance._id,
          changedBy: approvedBy,
          previousStatus,
          newStatus: attendance.status,
          previousData: attendance.toObject(),
          newData: attendance.toObject(),
          reason: `Correction Request Approved: ${request.reason || 'No reason provided'}`,
        });
        await auditLog.save();
      }
    } else {
      request.status = 'REJECTED';
      request.approvedBy = approvedBy;
      request.resolvedAt = new Date();
      await request.save();
    }

    return request;
  }

  /**
   * Update a single student attendance record (respecting settings and approval flags).
   */
  async updateStudentAttendanceRecord(
    schoolId: Types.ObjectId,
    recordId: Types.ObjectId,
    data: UpdateStudentAttendanceDto,
    updatedBy: Types.ObjectId,
    userRole: string
  ) {
    const record = await AttendanceRecordModel.findOne({ _id: recordId, schoolId }).exec();
    if (!record) {
      throw new Error('Attendance record not found.');
    }

    if (record.isLocked) {
      throw new Error('Attendance record is locked and cannot be updated.');
    }

    const settings = await this.getAttendanceSettings(schoolId);

    // If teacher, check if settings allow modification
    if (userRole === 'TEACHER') {
      if (!settings.allowTeacherCorrection) {
        throw new Error('Teacher correction is disabled in settings.');
      }
      if (settings.requireAdminApprovalForCorrection) {
        // Create a correction request instead of updating directly
        return this.createCorrectionRequest(schoolId, {
          attendanceId: record._id.toString(),
          requestedStatus: data.status,
          reason: data.remarks ? `Update student attendance: ${data.remarks}` : 'Manual single student update',
        }, updatedBy);
      }
    }

    const previousStatus = record.status;
    record.status = data.status;
    if (data.remarks !== undefined) record.remarks = data.remarks;
    record.updatedBy = updatedBy;
    await record.save();

    // Audit log
    const auditLog = new AttendanceAuditLogModel({
      schoolId,
      attendanceId: record._id,
      changedBy: updatedBy,
      previousStatus,
      newStatus: record.status,
      previousData: record.toObject(),
      newData: record.toObject(),
      reason: 'Manual single student update',
    });
    await auditLog.save();

    // Trigger parent notification if status changes to ABSENT or LATE
    try {
      if (record.status === 'ABSENT' && settings.notifyParentsOnAbsent && previousStatus !== 'ABSENT') {
        await sendParentNotification(schoolId, record.personId, 'ABSENT', { date: record.date });
      } else if (record.status === 'LATE' && settings.notifyParentsOnLate && previousStatus !== 'LATE') {
        await sendParentNotification(schoolId, record.personId, 'LATE', { date: record.date });
      }
    } catch (err) {
      console.error('Failed to send parent notification during single student update:', err);
    }

    return record;
  }

  /**
   * Update a single teacher attendance record (only admin or superadmin).
   */
  async updateTeacherAttendanceRecord(
    schoolId: Types.ObjectId,
    recordId: Types.ObjectId,
    data: UpdateTeacherAttendanceDto,
    updatedBy: Types.ObjectId
  ) {
    const record = await AttendanceRecordModel.findOne({ _id: recordId, schoolId }).exec();
    if (!record) {
      throw new Error('Attendance record not found.');
    }

    const previousStatus = record.status;
    record.status = data.status;
    if (data.remarks !== undefined) record.remarks = data.remarks;
    if (data.checkInTime) record.checkInTime = new Date(data.checkInTime);
    if (data.checkOutTime) record.checkOutTime = new Date(data.checkOutTime);
    record.updatedBy = updatedBy;
    await record.save();

    // Audit log
    const auditLog = new AttendanceAuditLogModel({
      schoolId,
      attendanceId: record._id,
      changedBy: updatedBy,
      previousStatus,
      newStatus: record.status,
      previousData: record.toObject(),
      newData: record.toObject(),
      reason: 'Manual single teacher update',
    });
    await auditLog.save();

    return record;
  }
}

export const attendanceService = new AttendanceService();

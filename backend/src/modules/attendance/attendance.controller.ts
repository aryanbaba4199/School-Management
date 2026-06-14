import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { sendSuccess, sendError } from '../../common/utils/response.handler';
import { attendanceService } from './attendance.service';
import { validateMutationSchoolContext, resolveSchoolIdContext, checkTeacherClassAssignment } from './utils/attendance-permission.util';
import { 
  BulkMarkStudentAttendanceDto, 
  GetStudentAttendanceQueryDto,
  BulkMarkTeacherAttendanceDto,
  GetTeacherAttendanceQueryDto,
  CreateRfidCardDto,
  UpdateRfidCardDto,
  ScanRfidAttendanceDto,
  UpdateAttendanceSettingsDto,
  MarkStudentAttendanceDto,
  MarkTeacherAttendanceDto,
  CreateCorrectionRequestDto,
  ResolveCorrectionRequestDto,
  UpdateStudentAttendanceDto,
  UpdateTeacherAttendanceDto
} from './dto/attendance.dto';
import { PersonType } from './attendance.model';
import { UserModel } from '../user/user.model';

export class AttendanceController {
  
  /**
   * GET /api/attendance/students
   * Fetch student attendance with filters.
   */
  async getStudentAttendance(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as unknown as GetStudentAttendanceQueryDto;
      const schoolId = resolveSchoolIdContext(req);

      // Enforce teacher assigned classes check
      if (req.user?.role === 'TEACHER') {
        if (!query.classId) {
          throw new Error('Teacher must filter by classId.');
        }
        const hasAssignment = await checkTeacherClassAssignment(
          schoolId!,
          new Types.ObjectId(req.user.userId),
          new Types.ObjectId(query.classId)
        );
        if (!hasAssignment) {
          throw new Error('Forbidden: You are not assigned to this class.');
        }
      }

      // Enforce parent-child access checks
      let parentChildrenIds: Types.ObjectId[] | undefined = undefined;
      if (req.user?.role === 'PARENT') {
        const parent = await UserModel.findById(req.user.userId).select('childrenIds').exec();
        parentChildrenIds = parent?.childrenIds || [];
      }

      // Enforce student self-only access checks
      const personId = req.user?.role === 'STUDENT' ? new Types.ObjectId(req.user.userId) : undefined;

      const records = await attendanceService.getStudentAttendance({
        schoolId: schoolId,
        classId: query.classId ? new Types.ObjectId(query.classId) : undefined,
        sectionId: query.sectionId ? new Types.ObjectId(query.sectionId) : undefined,
        date: query.date ? new Date(query.date) : undefined,
        personId,
        parentChildrenIds,
      });

      sendSuccess(res, 200, records);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to retrieve student attendance: ${errorMessage}`);
    }
  }

  /**
   * POST /api/attendance/students/bulk
   * Bulk mark student attendance.
   */
  async bulkMarkStudentAttendance(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as BulkMarkStudentAttendanceDto;
      const schoolId = validateMutationSchoolContext(req, data.schoolId);
      const changedBy = new Types.ObjectId(req.user?.userId);

      // Enforce teacher assigned classes check for bulk marks
      if (req.user?.role === 'TEACHER') {
        const hasAssignment = await checkTeacherClassAssignment(
          schoolId,
          changedBy,
          new Types.ObjectId(data.classId)
        );
        if (!hasAssignment) {
          throw new Error('Forbidden: You are not assigned to this class.');
        }
      }

      const result = await attendanceService.bulkMarkStudentAttendance(schoolId, data, changedBy);

      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to bulk mark student attendance: ${errorMessage}`);
    }
  }

  /**
   * GET /api/attendance/teachers
   * Fetch teacher attendance records.
   */
  async getTeacherAttendance(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as unknown as GetTeacherAttendanceQueryDto;
      const schoolId = resolveSchoolIdContext(req);

      // Restrict teachers to reading only their own attendance records
      let personId: Types.ObjectId | undefined = undefined;
      if (req.user?.role === 'TEACHER') {
        personId = new Types.ObjectId(req.user.userId);
      }

      const records = await attendanceService.getTeacherAttendance({
        schoolId: schoolId,
        date: query.date ? new Date(query.date) : undefined,
        personId,
      });

      sendSuccess(res, 200, records);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to retrieve teacher attendance: ${errorMessage}`);
    }
  }

  /**
   * POST /api/attendance/teachers/bulk
   * Bulk mark teacher attendance.
   */
  async bulkMarkTeacherAttendance(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as BulkMarkTeacherAttendanceDto;
      const schoolId = validateMutationSchoolContext(req, data.schoolId);
      const changedBy = new Types.ObjectId(req.user?.userId);

      const result = await attendanceService.bulkMarkTeacherAttendance(schoolId, data, changedBy);

      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to bulk mark teacher attendance: ${errorMessage}`);
    }
  }

  /**
   * GET /api/attendance/settings
   * Retrieve school attendance settings.
   */
  async getAttendanceSettings(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = resolveSchoolIdContext(req);
      if (!schoolId) {
        throw new Error('School context is required.');
      }
      const settings = await attendanceService.getAttendanceSettings(schoolId);
      sendSuccess(res, 200, settings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to retrieve settings: ${errorMessage}`);
    }
  }

  /**
   * PUT /api/attendance/settings
   * Update school attendance settings.
   */
  async updateAttendanceSettings(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as UpdateAttendanceSettingsDto;
      const schoolId = validateMutationSchoolContext(req);
      const settings = await attendanceService.updateAttendanceSettings(schoolId, data);
      sendSuccess(res, 200, settings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to update settings: ${errorMessage}`);
    }
  }

  /**
   * GET /api/attendance/rfid/cards
   * Fetch all registered RFID cards.
   */
  async getRfidCards(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = resolveSchoolIdContext(req);
      if (!schoolId) {
        throw new Error('School context is required.');
      }
      const cards = await attendanceService.getRfidCards(schoolId);
      sendSuccess(res, 200, cards);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to fetch RFID cards: ${errorMessage}`);
    }
  }

  /**
   * POST /api/attendance/rfid/cards
   * Register a new RFID card.
   */
  async createRfidCard(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateRfidCardDto;
      const schoolId = validateMutationSchoolContext(req);
      const card = await attendanceService.createRfidCard(schoolId, data);
      sendSuccess(res, 201, card);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to create RFID card: ${errorMessage}`);
    }
  }

  /**
   * PUT /api/attendance/rfid/cards/:id
   * Update RFID card active state.
   */
  async updateRfidCard(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as UpdateRfidCardDto;
      const schoolId = validateMutationSchoolContext(req);
      const cardId = new Types.ObjectId(req.params.id as string);
      const card = await attendanceService.updateRfidCard(schoolId, cardId, data);
      sendSuccess(res, 200, card);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to update RFID card: ${errorMessage}`);
    }
  }

  /**
   * DELETE /api/attendance/rfid/cards/:id
   * Unregister RFID card.
   */
  async deleteRfidCard(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = validateMutationSchoolContext(req);
      const cardId = new Types.ObjectId(req.params.id as string);
      const result = await attendanceService.deleteRfidCard(schoolId, cardId);
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to delete RFID card: ${errorMessage}`);
    }
  }

  /**
   * POST /api/attendance/rfid/scan
   * Process scan of RFID card.
   */
  async scanRfidCard(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as ScanRfidAttendanceDto;
      const schoolId = resolveSchoolIdContext(req);
      if (!schoolId) {
        throw new Error('School context is required.');
      }
      const record = await attendanceService.scanRfidCard(schoolId, data);
      sendSuccess(res, 200, record);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `RFID Scan failed: ${errorMessage}`);
    }
  }

  /**
   * GET /api/attendance/reports/daily
   * Fetch daily report.
   */
  async getDailyAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = resolveSchoolIdContext(req);
      if (!schoolId) {
        throw new Error('School context is required.');
      }
      const dateStr = req.query.date as string | undefined;
      const personType = (req.query.personType as PersonType) || 'STUDENT';
      const report = await attendanceService.getDailyAttendanceReport(schoolId, dateStr, personType);
      sendSuccess(res, 200, report);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to retrieve daily report: ${errorMessage}`);
    }
  }

  /**
   * GET /api/attendance/reports/monthly
   * Fetch monthly report.
   */
  async getMonthlyAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = resolveSchoolIdContext(req);
      if (!schoolId) {
        throw new Error('School context is required.');
      }
      const year = Number(req.query.year);
      const month = Number(req.query.month);
      const classId = req.query.classId ? new Types.ObjectId(req.query.classId as string) : undefined;
      const sectionId = req.query.sectionId ? new Types.ObjectId(req.query.sectionId as string) : undefined;
      const personType = (req.query.personType as PersonType) || 'STUDENT';

      if (isNaN(year) || isNaN(month)) {
        throw new Error('Valid year and month parameters are required.');
      }

      const report = await attendanceService.getMonthlyAttendanceReport(
        schoolId,
        year,
        month,
        classId,
        sectionId,
        personType
      );
      sendSuccess(res, 200, report);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to retrieve monthly report: ${errorMessage}`);
    }
  }

  /**
   * POST /api/attendance/students/mark
   * Mark a single student attendance.
   */
  async markStudentAttendance(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as MarkStudentAttendanceDto;
      const schoolId = validateMutationSchoolContext(req, data.schoolId);
      const markedBy = new Types.ObjectId(req.user?.userId);

      // Check teacher assignment
      if (req.user?.role === 'TEACHER') {
        const hasAssignment = await checkTeacherClassAssignment(
          schoolId,
          markedBy,
          new Types.ObjectId(data.classId)
        );
        if (!hasAssignment) {
          throw new Error('Forbidden: You are not assigned to this class.');
        }
      }

      const record = await attendanceService.createStudentAttendanceRecord(schoolId, data, markedBy);
      sendSuccess(res, 201, record);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to mark student attendance: ${errorMessage}`);
    }
  }

  /**
   * POST /api/attendance/teachers/mark
   * Mark a single teacher attendance.
   */
  async markTeacherAttendance(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as MarkTeacherAttendanceDto;
      const schoolId = validateMutationSchoolContext(req, data.schoolId);
      const markedBy = new Types.ObjectId(req.user?.userId);

      const record = await attendanceService.createTeacherAttendanceRecord(schoolId, data, markedBy);
      sendSuccess(res, 201, record);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to mark teacher attendance: ${errorMessage}`);
    }
  }

  /**
   * PUT /api/attendance/students/:id
   * Update a single student attendance.
   */
  async updateStudentAttendance(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as UpdateStudentAttendanceDto;
      const schoolId = validateMutationSchoolContext(req, data.schoolId);
      const recordId = new Types.ObjectId(req.params.id as string);
      const updatedBy = new Types.ObjectId(req.user?.userId);
      const userRole = req.user?.role || 'TEACHER';

      const result = await attendanceService.updateStudentAttendanceRecord(
        schoolId,
        recordId,
        data,
        updatedBy,
        userRole
      );

      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to update student attendance: ${errorMessage}`);
    }
  }

  /**
   * PUT /api/attendance/teachers/:id
   * Update a single teacher attendance.
   */
  async updateTeacherAttendance(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as UpdateTeacherAttendanceDto;
      const schoolId = validateMutationSchoolContext(req, data.schoolId);
      const recordId = new Types.ObjectId(req.params.id as string);
      const updatedBy = new Types.ObjectId(req.user?.userId);

      const result = await attendanceService.updateTeacherAttendanceRecord(
        schoolId,
        recordId,
        data,
        updatedBy
      );

      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to update teacher attendance: ${errorMessage}`);
    }
  }

  /**
   * POST /api/attendance/corrections
   * Create a correction request.
   */
  async createCorrectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateCorrectionRequestDto;
      const schoolId = validateMutationSchoolContext(req, data.schoolId);
      const requestedBy = new Types.ObjectId(req.user?.userId);

      const request = await attendanceService.createCorrectionRequest(schoolId, data, requestedBy);
      sendSuccess(res, 201, request);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to submit correction request: ${errorMessage}`);
    }
  }

  /**
   * GET /api/attendance/corrections/pending
   * Get all pending correction requests for a school.
   */
  async getPendingCorrectionRequests(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = resolveSchoolIdContext(req);
      if (!schoolId) {
        throw new Error('School context is required.');
      }
      const requests = await attendanceService.getPendingCorrectionRequests(schoolId);
      sendSuccess(res, 200, requests);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to fetch pending correction requests: ${errorMessage}`);
    }
  }

  /**
   * POST /api/attendance/corrections/:id/resolve
   * Approve or reject a correction request.
   */
  async resolveCorrectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as ResolveCorrectionRequestDto;
      const schoolId = validateMutationSchoolContext(req, data.schoolId);
      const requestId = new Types.ObjectId(req.params.id as string);
      const resolvedBy = new Types.ObjectId(req.user?.userId);

      const request = await attendanceService.resolveCorrectionRequest(
        schoolId,
        requestId,
        data,
        resolvedBy
      );

      sendSuccess(res, 200, request);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendError(res, 500, `Failed to resolve correction request: ${errorMessage}`);
    }
  }
}

export const attendanceController = new AttendanceController();

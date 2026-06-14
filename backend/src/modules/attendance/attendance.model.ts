import { Schema, model, Document, Types } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'ON_LEAVE';
export type PersonType = 'STUDENT' | 'TEACHER';
export type AttendanceSource = 'MANUAL' | 'RFID' | 'IMPORT' | 'FACE_RECOGNITION' | 'SYSTEM';

export interface IAttendanceRecord extends Document {
  schoolId: Types.ObjectId;
  personType: PersonType;
  personId: Types.ObjectId;
  classId?: Types.ObjectId;
  sectionId?: Types.ObjectId;
  date: Date;
  academicYear?: string;
  status: AttendanceStatus;
  source: AttendanceSource;
  checkInTime?: Date;
  checkOutTime?: Date;
  markedBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  remarks?: string;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    personType: { type: String, enum: ['STUDENT', 'TEACHER'], required: true },
    personId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
    date: { type: Date, required: true },
    academicYear: { type: String },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'ON_LEAVE'],
      required: true,
    },
    source: {
      type: String,
      enum: ['MANUAL', 'RFID', 'IMPORT', 'FACE_RECOGNITION', 'SYSTEM'],
      required: true,
      default: 'MANUAL',
    },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for query performance and uniqueness
attendanceRecordSchema.index({ schoolId: 1, personType: 1, personId: 1, date: 1 }, { unique: true });
attendanceRecordSchema.index({ schoolId: 1, classId: 1, sectionId: 1, date: 1 });
attendanceRecordSchema.index({ schoolId: 1, date: 1 });
attendanceRecordSchema.index({ schoolId: 1, personType: 1, date: 1 });

export const AttendanceRecordModel = model<IAttendanceRecord>('AttendanceRecord', attendanceRecordSchema);


export interface IAttendanceAuditLog extends Document {
  schoolId: Types.ObjectId;
  attendanceId: Types.ObjectId;
  changedBy: Types.ObjectId;
  previousStatus?: string;
  newStatus: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  reason?: string;
  createdAt: Date;
}

const attendanceAuditLogSchema = new Schema<IAttendanceAuditLog>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    attendanceId: { type: Schema.Types.ObjectId, ref: 'AttendanceRecord', required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    previousStatus: { type: String },
    newStatus: { type: String, required: true },
    previousData: { type: Schema.Types.Mixed },
    newData: { type: Schema.Types.Mixed },
    reason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

attendanceAuditLogSchema.index({ attendanceId: 1 });
attendanceAuditLogSchema.index({ schoolId: 1, attendanceId: 1 });

export const AttendanceAuditLogModel = model<IAttendanceAuditLog>('AttendanceAuditLog', attendanceAuditLogSchema);

export interface IAttendanceSettings extends Document {
  schoolId: Types.ObjectId;
  studentAttendanceMode: 'MANUAL' | 'RFID' | 'HYBRID';
  teacherAttendanceMode: 'MANUAL' | 'RFID' | 'HYBRID';
  lateAfterTime?: string;
  halfDayAfterTime?: string;
  autoAbsentAfterTime?: string;
  allowTeacherCorrection: boolean;
  requireAdminApprovalForCorrection: boolean;
  notifyParentsOnAbsent: boolean;
  notifyParentsOnLate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSettingsSchema = new Schema<IAttendanceSettings>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
    studentAttendanceMode: { type: String, enum: ['MANUAL', 'RFID', 'HYBRID'], default: 'MANUAL' },
    teacherAttendanceMode: { type: String, enum: ['MANUAL', 'RFID', 'HYBRID'], default: 'MANUAL' },
    lateAfterTime: { type: String },
    halfDayAfterTime: { type: String },
    autoAbsentAfterTime: { type: String },
    allowTeacherCorrection: { type: Boolean, default: true },
    requireAdminApprovalForCorrection: { type: Boolean, default: false },
    notifyParentsOnAbsent: { type: Boolean, default: false },
    notifyParentsOnLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AttendanceSettingsModel = model<IAttendanceSettings>('AttendanceSettings', attendanceSettingsSchema);

export interface IRfidCard extends Document {
  schoolId: Types.ObjectId;
  cardUid: string;
  personType: 'STUDENT' | 'TEACHER';
  personId: Types.ObjectId;
  isActive: boolean;
  issuedAt?: Date;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rfidCardSchema = new Schema<IRfidCard>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    cardUid: { type: String, required: true },
    personType: { type: String, enum: ['STUDENT', 'TEACHER'], required: true },
    personId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    issuedAt: { type: Date, default: Date.now },
    blockedAt: { type: Date },
  },
  { timestamps: true }
);

rfidCardSchema.index({ schoolId: 1, cardUid: 1 }, { unique: true });
rfidCardSchema.index({ schoolId: 1, personType: 1, personId: 1 });

export const RfidCardModel = model<IRfidCard>('RfidCard', rfidCardSchema);

export interface IAttendanceCorrectionRequest extends Document {
  schoolId: Types.ObjectId;
  attendanceId: Types.ObjectId;
  requestedBy: Types.ObjectId;
  previousStatus?: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceCorrectionRequestSchema = new Schema<IAttendanceCorrectionRequest>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    attendanceId: { type: Schema.Types.ObjectId, ref: 'AttendanceRecord', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    previousStatus: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'ON_LEAVE'] },
    requestedStatus: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'ON_LEAVE'],
      required: true,
    },
    reason: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      required: true,
      default: 'PENDING',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

attendanceCorrectionRequestSchema.index({ schoolId: 1, status: 1 });
attendanceCorrectionRequestSchema.index({ attendanceId: 1 });

export const AttendanceCorrectionRequestModel = model<IAttendanceCorrectionRequest>(
  'AttendanceCorrectionRequest',
  attendanceCorrectionRequestSchema
);


export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'ON_LEAVE';
export type PersonType = 'STUDENT' | 'TEACHER';

export interface IAttendanceRecord {
  _id: string;
  schoolId: string;
  personType: PersonType;
  personId: {
    _id: string;
    name: string;
    userCode?: string;
  } | string;
  classId?: string;
  sectionId?: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  source?: string;
  remarks?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarkAttendanceRecordDto {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkMarkStudentAttendanceDto {
  schoolId?: string;
  classId: string;
  sectionId: string;
  date: string; // YYYY-MM-DD
  records: MarkAttendanceRecordDto[];
}

export interface GetStudentAttendanceQueryDto {
  classId?: string;
  sectionId?: string;
  date?: string; // YYYY-MM-DD
  schoolId?: string;
}

export interface IAttendanceSettings {
  _id?: string;
  schoolId: string;
  studentAttendanceMode: 'MANUAL' | 'RFID' | 'HYBRID';
  teacherAttendanceMode: 'MANUAL' | 'RFID' | 'HYBRID';
  lateAfterTime?: string;
  halfDayAfterTime?: string;
  autoAbsentAfterTime?: string;
  allowTeacherCorrection: boolean;
  requireAdminApprovalForCorrection: boolean;
  notifyParentsOnAbsent: boolean;
  notifyParentsOnLate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRfidCard {
  _id: string;
  schoolId: string;
  cardUid: string;
  personType: 'STUDENT' | 'TEACHER';
  personId: {
    _id: string;
    name: string;
    userCode?: string;
    role?: { name: string };
  } | string;
  isActive: boolean;
  issuedAt?: string;
  blockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRfidCardDto {
  schoolId?: string;
  cardUid: string;
  personType: 'STUDENT' | 'TEACHER';
  personId: string;
}

export interface UpdateRfidCardDto {
  schoolId?: string;
  isActive: boolean;
}

export interface DailyAttendanceReport {
  date: string;
  personType: 'STUDENT' | 'TEACHER';
  counts: {
    total: number;
    PRESENT: number;
    ABSENT: number;
    LATE: number;
    HALF_DAY: number;
    EXCUSED: number;
    ON_LEAVE: number;
  };
  records: IAttendanceRecord[];
}

export interface BulkMarkTeacherAttendanceDto {
  schoolId?: string;
  date: string; // YYYY-MM-DD
  records: {
    teacherId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
  }[];
}

export interface MonthlyAttendanceStats {
  userId: string;
  name: string;
  userCode: string;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  leave: number;
  totalLogged: number;
  attendancePct: number;
}

export interface MonthlyReportResponse {
  stats: MonthlyAttendanceStats[];
  records: IAttendanceRecord[];
}

export interface IAttendanceCorrectionRequest {
  _id: string;
  schoolId: string;
  attendanceId: IAttendanceRecord | string;
  requestedBy: {
    _id: string;
    name: string;
    role: { name: string };
  } | string;
  previousStatus?: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCorrectionRequestDto {
  schoolId?: string;
  attendanceId: string;
  requestedStatus: AttendanceStatus;
  reason?: string;
}

export interface ResolveCorrectionRequestDto {
  schoolId?: string;
  action: 'APPROVE' | 'REJECT';
}

export interface UpdateStudentAttendanceDto {
  schoolId?: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface UpdateTeacherAttendanceDto {
  schoolId?: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
}


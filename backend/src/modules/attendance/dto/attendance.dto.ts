import { z } from 'zod';

export const MarkStudentAttendanceSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID'),
    sectionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid section ID'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED']),
    remarks: z.string().optional(),
  })
});

export const BulkMarkStudentAttendanceSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID'),
    sectionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid section ID'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    records: z.array(
      z.object({
        studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED']),
        remarks: z.string().optional(),
      })
    ).min(1, 'At least one attendance record is required'),
  })
});

export const GetStudentAttendanceQuerySchema = z.object({
  query: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID').optional(),
    sectionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid section ID').optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  })
});

export type MarkStudentAttendanceDto = z.infer<typeof MarkStudentAttendanceSchema>['body'];
export type BulkMarkStudentAttendanceDto = z.infer<typeof BulkMarkStudentAttendanceSchema>['body'];
export type GetStudentAttendanceQueryDto = z.infer<typeof GetStudentAttendanceQuerySchema>['query'];

export const GetTeacherAttendanceQuerySchema = z.object({
  query: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  })
});

export const MarkTeacherAttendanceSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    teacherId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    remarks: z.string().optional(),
  })
});

export const BulkMarkTeacherAttendanceSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    records: z.array(
      z.object({
        teacherId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID'),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']),
        checkInTime: z.string().optional(),
        checkOutTime: z.string().optional(),
        remarks: z.string().optional(),
      })
    ).min(1, 'At least one attendance record is required'),
  })
});

export const ScanRfidAttendanceSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    cardUid: z.string().min(1, 'Card UID is required'),
    deviceId: z.string().optional(),
    timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid timestamp format').optional(),
  })
});

export const CreateRfidCardSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    cardUid: z.string().min(1, 'Card UID is required'),
    personType: z.enum(['STUDENT', 'TEACHER']),
    personId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid person ID'),
  })
});

export const UpdateRfidCardSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    isActive: z.boolean(),
  })
});

export const UpdateAttendanceSettingsSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    studentAttendanceMode: z.enum(['MANUAL', 'RFID', 'HYBRID']),
    teacherAttendanceMode: z.enum(['MANUAL', 'RFID', 'HYBRID']),
    lateAfterTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional().nullable(),
    halfDayAfterTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional().nullable(),
    autoAbsentAfterTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional().nullable(),
    allowTeacherCorrection: z.boolean(),
    requireAdminApprovalForCorrection: z.boolean(),
    notifyParentsOnAbsent: z.boolean(),
    notifyParentsOnLate: z.boolean(),
  })
});

export const CreateCorrectionRequestSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    attendanceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attendance ID'),
    requestedStatus: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'ON_LEAVE']),
    reason: z.string().optional(),
  })
});

export const ResolveCorrectionRequestSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    action: z.enum(['APPROVE', 'REJECT']),
  })
});

export const UpdateStudentAttendanceSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED']),
    remarks: z.string().optional(),
  })
});

export const UpdateTeacherAttendanceSchema = z.object({
  body: z.object({
    schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    remarks: z.string().optional(),
  })
});

export type MarkTeacherAttendanceDto = z.infer<typeof MarkTeacherAttendanceSchema>['body'];
export type GetTeacherAttendanceQueryDto = z.infer<typeof GetTeacherAttendanceQuerySchema>['query'];
export type BulkMarkTeacherAttendanceDto = z.infer<typeof BulkMarkTeacherAttendanceSchema>['body'];
export type ScanRfidAttendanceDto = z.infer<typeof ScanRfidAttendanceSchema>['body'];
export type CreateRfidCardDto = z.infer<typeof CreateRfidCardSchema>['body'];
export type UpdateRfidCardDto = z.infer<typeof UpdateRfidCardSchema>['body'];
export type UpdateAttendanceSettingsDto = z.infer<typeof UpdateAttendanceSettingsSchema>['body'];
export type CreateCorrectionRequestDto = z.infer<typeof CreateCorrectionRequestSchema>['body'];
export type ResolveCorrectionRequestDto = z.infer<typeof ResolveCorrectionRequestSchema>['body'];
export type UpdateStudentAttendanceDto = z.infer<typeof UpdateStudentAttendanceSchema>['body'];
export type UpdateTeacherAttendanceDto = z.infer<typeof UpdateTeacherAttendanceSchema>['body'];

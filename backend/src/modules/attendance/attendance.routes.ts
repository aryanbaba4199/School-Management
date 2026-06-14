import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate, requireRoles, injectSchoolId } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validation.middleware';
import { 
  GetStudentAttendanceQuerySchema, 
  BulkMarkStudentAttendanceSchema,
  GetTeacherAttendanceQuerySchema,
  BulkMarkTeacherAttendanceSchema,
  CreateRfidCardSchema,
  UpdateRfidCardSchema,
  ScanRfidAttendanceSchema,
  UpdateAttendanceSettingsSchema,
  MarkStudentAttendanceSchema,
  UpdateStudentAttendanceSchema,
  MarkTeacherAttendanceSchema,
  UpdateTeacherAttendanceSchema,
  CreateCorrectionRequestSchema,
  ResolveCorrectionRequestSchema
} from './dto/attendance.dto';

const router = Router();

// Require authentication and inject schoolId context for all attendance routes
router.use(authenticate, injectSchoolId);

/**
 * Student Attendance APIs
 */
router.get(
  '/students',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'),
  validate(GetStudentAttendanceQuerySchema),
  attendanceController.getStudentAttendance.bind(attendanceController)
);

router.post(
  '/students/bulk',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validate(BulkMarkStudentAttendanceSchema),
  attendanceController.bulkMarkStudentAttendance.bind(attendanceController)
);

router.post(
  '/students/mark',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validate(MarkStudentAttendanceSchema),
  attendanceController.markStudentAttendance.bind(attendanceController)
);

router.put(
  '/students/:id',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validate(UpdateStudentAttendanceSchema),
  attendanceController.updateStudentAttendance.bind(attendanceController)
);

/**
 * Teacher Attendance APIs
 */
router.get(
  '/teachers',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validate(GetTeacherAttendanceQuerySchema),
  attendanceController.getTeacherAttendance.bind(attendanceController)
);

router.post(
  '/teachers/bulk',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validate(BulkMarkTeacherAttendanceSchema),
  attendanceController.bulkMarkTeacherAttendance.bind(attendanceController)
);

router.post(
  '/teachers/mark',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validate(MarkTeacherAttendanceSchema),
  attendanceController.markTeacherAttendance.bind(attendanceController)
);

router.put(
  '/teachers/:id',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validate(UpdateTeacherAttendanceSchema),
  attendanceController.updateTeacherAttendance.bind(attendanceController)
);

/**
 * Settings APIs
 */
router.get(
  '/settings',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  attendanceController.getAttendanceSettings.bind(attendanceController)
);

router.put(
  '/settings',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validate(UpdateAttendanceSettingsSchema),
  attendanceController.updateAttendanceSettings.bind(attendanceController)
);

/**
 * RFID Card Operations
 */
router.get(
  '/rfid/cards',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  attendanceController.getRfidCards.bind(attendanceController)
);

router.post(
  '/rfid/cards',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validate(CreateRfidCardSchema),
  attendanceController.createRfidCard.bind(attendanceController)
);

router.put(
  '/rfid/cards/:id',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validate(UpdateRfidCardSchema),
  attendanceController.updateRfidCard.bind(attendanceController)
);

router.delete(
  '/rfid/cards/:id',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  attendanceController.deleteRfidCard.bind(attendanceController)
);

router.post(
  '/rfid/scan',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validate(ScanRfidAttendanceSchema),
  attendanceController.scanRfidCard.bind(attendanceController)
);

/**
 * Reports APIs
 */
router.get(
  '/reports/daily',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'),
  attendanceController.getDailyAttendanceReport.bind(attendanceController)
);

router.get(
  '/reports/monthly',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'),
  attendanceController.getMonthlyAttendanceReport.bind(attendanceController)
);

/**
 * Correction Approval APIs
 */
router.post(
  '/corrections',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validate(CreateCorrectionRequestSchema),
  attendanceController.createCorrectionRequest.bind(attendanceController)
);

router.get(
  '/corrections/pending',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  attendanceController.getPendingCorrectionRequests.bind(attendanceController)
);

router.post(
  '/corrections/:id/resolve',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validate(ResolveCorrectionRequestSchema),
  attendanceController.resolveCorrectionRequest.bind(attendanceController)
);

export const attendanceRoutes = router;

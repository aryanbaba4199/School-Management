import { Router } from 'express';
import { HomeworkController } from './homework.controller';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validation.middleware';
import { createHomeworkSchema } from './dto/create-homework.dto';
import { submitHomeworkSchema, gradeHomeworkSchema } from './dto/submission.dto';

const router = Router();
const homeworkController = new HomeworkController();

// Apply auth to all routes
router.use(authenticate);

// --- Student Endpoints ---
router.get(
  '/student/dashboard',
  requireRoles('STUDENT'),
  homeworkController.getStudentDashboard
);

router.post(
  '/:id/submit',
  requireRoles('STUDENT'),
  validate(submitHomeworkSchema),
  homeworkController.submitHomework
);

// --- Teacher/Admin Endpoints ---
router.post(
  '/',
  requireRoles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'),
  validate(createHomeworkSchema),
  homeworkController.createHomework
);

router.get(
  '/',
  requireRoles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'),
  homeworkController.getAllHomework
);

router.get(
  '/:id',
  requireRoles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'),
  homeworkController.getHomeworkById
);

router.delete(
  '/:id',
  requireRoles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'),
  homeworkController.deleteHomework
);

router.get(
  '/:id/submissions',
  requireRoles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'),
  homeworkController.getSubmissions
);

router.put(
  '/submissions/:submissionId/grade',
  requireRoles('TEACHER', 'SCHOOL_ADMIN'),
  validate(gradeHomeworkSchema),
  homeworkController.gradeSubmission
);

export default router;

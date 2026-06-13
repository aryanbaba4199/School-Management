import { Router } from 'express';
import { createExam, updateExam, getAllExams, createExamSchedule, updateExamSchedule, getExamSchedules, saveStudentMarks, getStudentMarks, generateResults, getReportCards } from './exam.controller';
import { requireRoles, injectSchoolId, authenticate } from '../../common/middleware/auth.middleware';

const router = Router();

// Only SCHOOL_ADMIN and SUPER_ADMIN can create exams
router.post('/', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), injectSchoolId, createExam);
router.put('/:id', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), injectSchoolId, updateExam);

// All roles in the school can view exams
router.get('/', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), injectSchoolId, getAllExams);

// Schedules
router.post('/schedules', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), injectSchoolId, createExamSchedule);
router.put('/schedules/:id', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), injectSchoolId, updateExamSchedule);
router.get('/schedules', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), injectSchoolId, getExamSchedules);

// Marks
router.post('/marks', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), injectSchoolId, saveStudentMarks);
router.get('/marks', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), injectSchoolId, getStudentMarks);

// Results & Report Cards
router.post('/results/generate', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), injectSchoolId, generateResults);
router.get('/results', authenticate, requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), injectSchoolId, getReportCards);

export default router;

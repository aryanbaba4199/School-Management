import express from 'express';
import { getStudentFees, generateStudentFees, payFee, getAllTransactions, markFeeDue, generateGlobalFees } from './fee.controller';
import { authenticate, requireRoles, injectSchoolId } from '../../common/middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/transactions', requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), injectSchoolId, getAllTransactions);
router.get('/student/:studentId', getStudentFees);
router.post('/generate', requireRoles('SCHOOL_ADMIN'), generateStudentFees);
router.post('/generate-bulk', requireRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), injectSchoolId, generateGlobalFees);
router.put('/:id/pay', requireRoles('SCHOOL_ADMIN'), payFee);
router.put('/:id/mark-due', requireRoles('SCHOOL_ADMIN'), markFeeDue);

export default router;

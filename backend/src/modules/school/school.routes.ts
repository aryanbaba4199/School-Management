import { Router } from 'express';
import { SchoolController } from './school.controller';
import { CreateSchoolSchema } from './dto/create-school.dto';
import { validate } from '../../common/middleware/validation.middleware';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';

/*------------- School Routes Definition -------------*/

const router = Router();
const controller = new SchoolController();

// Register a new school (validated via Zod)
router.post('/', authenticate, requireRoles('SUPER_ADMIN'), validate(CreateSchoolSchema), controller.register);

// Fetch all schools (paginated list)
router.get('/', authenticate, requireRoles('SUPER_ADMIN'), controller.list);

// Edit school details
router.put('/:id', authenticate, requireRoles('SUPER_ADMIN'), controller.update);

// Toggle school deactivate status
router.patch('/:id/deactivate', authenticate, requireRoles('SUPER_ADMIN'), controller.toggleDeactivate);

// Delete school (must be deactivated, requires passcode verification)
router.delete('/:id', authenticate, requireRoles('SUPER_ADMIN'), controller.deleteSchool);

// Draft management routes
router.get('/drafts/:email', authenticate, requireRoles('SUPER_ADMIN'), controller.getDraft);
router.post('/drafts', authenticate, requireRoles('SUPER_ADMIN'), controller.saveDraft);

export default router;

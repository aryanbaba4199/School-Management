import { Router } from 'express';
import { SchoolController } from './school.controller';
import { CreateSchoolSchema } from './dto/create-school.dto';
import { validate } from '../../common/middleware/validation.middleware';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';

/*------------- School Routes Definition -------------*/

const router = Router();
const controller = new SchoolController();
router.post('/', authenticate, requireRoles('SUPER_ADMIN'), validate(CreateSchoolSchema), controller.register);
router.get('/', authenticate, requireRoles('SUPER_ADMIN'), controller.list);
router.get('/drafts/:email', authenticate, requireRoles('SUPER_ADMIN'), controller.getDraft);
router.post('/drafts', authenticate, requireRoles('SUPER_ADMIN'), controller.saveDraft);
router.get('/:id', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), controller.getById);
router.put('/:id', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), controller.update);
router.patch('/:id/deactivate', authenticate, requireRoles('SUPER_ADMIN'), controller.toggleDeactivate);
router.delete('/:id', authenticate, requireRoles('SUPER_ADMIN'), controller.deleteSchool);

export default router;

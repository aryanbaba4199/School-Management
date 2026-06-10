import { Router } from 'express';
import { ClassController } from './class.controller';
import { authenticate, requireRoles, injectSchoolId } from '../../common/middleware/auth.middleware';

/*------------- Class Routes Definition -------------*/

const router = Router();
const controller = new ClassController();

router.post('/', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.create);
router.get('/', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.list);
router.get('/sections', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.listSections);
router.get('/:id', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.getById);
router.put('/:id', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.update);
router.delete('/:id', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.deleteClass);

export default router;

import { Router } from 'express';
import { UserController } from './user.controller';
import { CreateUserSchema, LoginSchema, UpdateUserSchema } from './dto/create-user.dto';
import { validate } from '../../common/middleware/validation.middleware';
import { authenticate, requireRoles, injectSchoolId } from '../../common/middleware/auth.middleware';

/*------------- User Routes Definition -------------*/

const router = Router();
const controller = new UserController();

// Public routes
router.post('/login', validate(LoginSchema), controller.login);

// Protected routes
router.get('/profile', authenticate, controller.getProfile);
router.post('/', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, validate(CreateUserSchema), controller.register);
router.get('/', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.listUsers);
router.get('/:id', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.getById);
router.put('/:id', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, validate(UpdateUserSchema), controller.update);
router.patch('/:id/status', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.toggleStatus);
router.delete('/:id', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), injectSchoolId, controller.delete);

export default router;

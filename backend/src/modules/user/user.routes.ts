import { Router } from 'express';
import { UserController } from './user.controller';
import { CreateUserSchema, LoginSchema } from './dto/create-user.dto';
import { validate } from '../../common/middleware/validation.middleware';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';

/*------------- User Routes Definition -------------*/

const router = Router();
const controller = new UserController();

// Public routes
router.post('/login', validate(LoginSchema), controller.login);

// Protected routes
router.get('/profile', authenticate, controller.getProfile);
router.post('/', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), validate(CreateUserSchema), controller.register);
router.get('/', authenticate, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), controller.listUsers);

export default router;

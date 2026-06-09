import { Router } from 'express';
import { SchoolController } from './school.controller';
import { CreateSchoolSchema } from './dto/create-school.dto';
import { validate } from '../../common/middleware/validation.middleware';

/*------------- School Routes Definition -------------*/

const router = Router();
const controller = new SchoolController();

// Register a new school (validated via Zod)
router.post('/', validate(CreateSchoolSchema), controller.register);

// Fetch all schools (paginated list)
router.get('/', controller.list);

export default router;

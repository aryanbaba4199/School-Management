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

// Draft management routes
router.get('/drafts/:email', controller.getDraft);
router.post('/drafts', controller.saveDraft);

export default router;

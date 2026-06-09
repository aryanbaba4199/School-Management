import { Router } from 'express';
import { MasterController } from './master.controller';
import { 
  CreateStateSchema, 
  CreateDistrictSchema, 
  CreateCitySchema, 
  CreateSubscriptionPlanSchema,
  UpdateSubscriptionPlanSchema 
} from './dto/create-master.dto';
import { validate } from '../../common/middleware/validation.middleware';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';

/*------------- Master Routes Definition -------------*/

const router = Router();
const controller = new MasterController();

// State Routes
router.post('/states', validate(CreateStateSchema), controller.createState);
router.get('/states', controller.getStates);

// District Routes
router.post('/districts', validate(CreateDistrictSchema), controller.createDistrict);
router.get('/districts', controller.getDistricts);

// City Routes
router.post('/cities', validate(CreateCitySchema), controller.createCity);
router.get('/cities', controller.getCities);

// Subscription Plan Routes
router.post('/subscription-plans', authenticate, requireRoles('SUPER_ADMIN'), validate(CreateSubscriptionPlanSchema), controller.createSubscriptionPlan);
router.get('/subscription-plans', controller.getSubscriptionPlans);
router.put('/subscription-plans/:id', authenticate, requireRoles('SUPER_ADMIN'), validate(UpdateSubscriptionPlanSchema), controller.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', authenticate, requireRoles('SUPER_ADMIN'), controller.deleteSubscriptionPlan);

export default router;

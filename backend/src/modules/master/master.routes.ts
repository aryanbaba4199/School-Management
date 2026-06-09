import { Router } from 'express';
import { MasterController } from './master.controller';
import { CreateStateSchema, CreateDistrictSchema, CreateCitySchema, CreateSubscriptionPlanSchema } from './dto/create-master.dto';
import { validate } from '../../common/middleware/validation.middleware';

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
router.post('/subscription-plans', validate(CreateSubscriptionPlanSchema), controller.createSubscriptionPlan);
router.get('/subscription-plans', controller.getSubscriptionPlans);

export default router;

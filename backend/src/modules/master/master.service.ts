import { StateModel, IState } from './models/state.model';
import { DistrictModel, IDistrict } from './models/district.model';
import { CityModel, ICity } from './models/city.model';
import { SubscriptionPlanModel, ISubscriptionPlan } from './models/subscription-plan.model';
import { CreateStateInput, CreateDistrictInput, CreateCityInput, CreateSubscriptionPlanInput } from './dto/create-master.dto';
import { Types } from 'mongoose';

/*------------- Master Database Service -------------*/

export class MasterService {
  /**
   * Creates a new State.
   */
  async createState(input: CreateStateInput): Promise<IState> {
    const { name, code } = input;

    const existingName = await StateModel.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingName) {
      throw new Error(`State with name '${name}' already exists.`);
    }

    const existingCode = await StateModel.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new Error(`State code '${code}' is already taken.`);
    }

    const state = new StateModel({
      name,
      code: code.toUpperCase(),
    });

    return await state.save();
  }

  /**
   * Fetches all States.
   */
  async findAllStates(): Promise<IState[]> {
    return await StateModel.find().sort({ name: 1 });
  }

  /**
   * Creates a new District under a State.
   */
  async createDistrict(input: CreateDistrictInput): Promise<IDistrict> {
    const { name, stateId, code } = input;

    const stateExists = await StateModel.findById(stateId);
    if (!stateExists) {
      throw new Error(`Parent State with ID '${stateId}' does not exist.`);
    }

    const existingCode = await DistrictModel.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new Error(`District code '${code}' is already registered.`);
    }

    const existingName = await DistrictModel.findOne({
      name: new RegExp(`^${name}$`, 'i'),
      stateId: new Types.ObjectId(stateId),
    });
    if (existingName) {
      throw new Error(`District '${name}' already exists in this State.`);
    }

    const district = new DistrictModel({
      name,
      stateId: new Types.ObjectId(stateId),
      code: code.toUpperCase(),
    });

    return await district.save();
  }

  /**
   * Fetches districts. Filter by stateId if specified.
   */
  async findDistricts(stateId?: string): Promise<IDistrict[]> {
    const filter: Record<string, unknown> = {};
    if (stateId) {
      filter.stateId = new Types.ObjectId(stateId);
    }
    return await DistrictModel.find(filter).populate('stateId', 'name code').sort({ name: 1 });
  }

  /**
   * Creates a new City under a District.
   */
  async createCity(input: CreateCityInput): Promise<ICity> {
    const { name, districtId, code } = input;

    // Verify parent District exists
    const districtExists = await DistrictModel.findById(districtId);
    if (!districtExists) {
      throw new Error(`Parent District with ID '${districtId}' does not exist.`);
    }

    // Check unique city code
    const existingCode = await CityModel.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new Error(`City code '${code}' is already registered.`);
    }

    // Check unique name in same district
    const existingName = await CityModel.findOne({
      name: new RegExp(`^${name}$`, 'i'),
      districtId: new Types.ObjectId(districtId),
    });
    if (existingName) {
      throw new Error(`City '${name}' already exists in this District.`);
    }

    const city = new CityModel({
      name,
      districtId: new Types.ObjectId(districtId),
      code: code.toUpperCase(),
    });

    return await city.save();
  }

  /**
   * Fetches cities. Filter by districtId if specified.
   */
  async findCities(districtId?: string): Promise<ICity[]> {
    const filter: Record<string, unknown> = {};
    if (districtId) {
      filter.districtId = new Types.ObjectId(districtId);
    }
    return await CityModel.find(filter).populate('districtId', 'name code').sort({ name: 1 });
  }

  /**
   * Creates a new Subscription Plan.
   */
  async createSubscriptionPlan(input: CreateSubscriptionPlanInput): Promise<ISubscriptionPlan> {
    const { name, code } = input;

    const existingName = await SubscriptionPlanModel.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingName) {
      throw new Error(`Subscription plan name '${name}' already exists.`);
    }

    const existingCode = await SubscriptionPlanModel.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new Error(`Subscription plan code '${code}' is already taken.`);
    }

    const plan = new SubscriptionPlanModel({
      ...input,
      code: code.toUpperCase(),
    });

    return await plan.save();
  }

  /**
   * Fetches all Subscription Plans.
   */
  async findAllSubscriptionPlans(): Promise<ISubscriptionPlan[]> {
    return await SubscriptionPlanModel.find().sort({ price: 1 });
  }
}

import { StateModel, IState } from './models/state.model';
import { DistrictModel, IDistrict } from './models/district.model';
import { CityModel, ICity } from './models/city.model';
import { SubscriptionPlanModel, ISubscriptionPlan } from './models/subscription-plan.model';
import { CreateStateInput, CreateDistrictInput, CreateCityInput, CreateSubscriptionPlanInput } from './dto/create-master.dto';
import { Types } from 'mongoose';
import { SchoolModel } from '../school/school.model';

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

  /**
   * Updates an existing Subscription Plan.
   */
  async updateSubscriptionPlan(id: string, input: Partial<CreateSubscriptionPlanInput>): Promise<ISubscriptionPlan> {
    const plan = await SubscriptionPlanModel.findById(id);
    if (!plan) {
      throw new Error('Subscription plan not found.');
    }

    if (input.name && input.name.toLowerCase() !== plan.name.toLowerCase()) {
      const existingName = await SubscriptionPlanModel.findOne({ name: new RegExp(`^${input.name}$`, 'i') });
      if (existingName) {
        throw new Error(`Subscription plan name '${input.name}' already exists.`);
      }
    }

    if (input.code && input.code.toUpperCase() !== plan.code) {
      const existingCode = await SubscriptionPlanModel.findOne({ code: input.code.toUpperCase() });
      if (existingCode) {
        throw new Error(`Subscription plan code '${input.code}' is already taken.`);
      }
    }

    if (input.name) plan.name = input.name;
    if (input.code) plan.code = input.code.toUpperCase();
    if (input.price !== undefined) plan.price = input.price;
    if (input.maxStudents !== undefined) plan.maxStudents = input.maxStudents;
    if (input.isActive !== undefined) plan.isActive = input.isActive;
    if (input.features) {
      plan.features = {
        ...plan.features,
        ...input.features,
      };
    }

    return await plan.save();
  }

  /**
   * Deletes a Subscription Plan after checking that no schools are linked to it.
   */
  async deleteSubscriptionPlan(id: string): Promise<void> {
    const linkedSchoolsCount = await SchoolModel.countDocuments({ subscriptionPlan: new Types.ObjectId(id) });
    if (linkedSchoolsCount > 0) {
      throw new Error(`Cannot delete plan. ${linkedSchoolsCount} school${linkedSchoolsCount === 1 ? ' is' : 's are'} currently using this plan.`);
    }

    const result = await SubscriptionPlanModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Subscription plan not found.');
    }
  }
}

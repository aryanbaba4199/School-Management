import { SchoolModel, ISchool } from './school.model';
import { CreateSchoolInput } from './dto/create-school.dto';
import { Types } from 'mongoose';

/*------------- School Database Service -------------*/

export class SchoolService {

  /**
   * Fetches schools with pagination parameters.
   */
  async findAllSchools(page: number, limit: number, search?: string): Promise<{ schools: ISchool[]; totalCount: number }> {
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { subdomain: { $regex: search, $options: 'i' } },
      ];
    }

    const [schools, totalCount] = await Promise.all([
      SchoolModel.find(query)
        .populate('country', 'name code')
        .populate('state', 'name code')
        .populate('district', 'name code')
        .populate('boardType', 'name acronym')
        .populate('subscriptionPlan', 'name')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      SchoolModel.countDocuments(query),
    ]);

    return {
      schools,
      totalCount,
    };
  }

  /**
   * Fetches a single school by ID with populated references.
   */
  async getSchoolById(id: string): Promise<ISchool> {
    const school = await SchoolModel.findById(id)
      .populate('country', 'name code')
      .populate('state', 'name code')
      .populate('district', 'name code')
      .populate('boardType', 'name acronym')
      .populate('subscriptionPlan', 'name price maxStudents features');

    if (!school) {
      throw new Error('School not found.');
    }
    return school;
  }


  /**
   * Updates an existing school's details.
   */
  async updateSchool(id: string, input: Partial<CreateSchoolInput>): Promise<ISchool> {
    const school = await SchoolModel.findById(id);
    if (!school) {
      throw new Error('School not found.');
    }

    if (input.name) school.name = input.name;
    if (input.email) school.email = input.email.toLowerCase();
    if (input.phone) school.phone = input.phone;
    if (input.countryCode) school.countryCode = input.countryCode;
    if (input.address !== undefined) school.address = input.address;
    if (input.state) school.state = new Types.ObjectId(input.state);
    if (input.district) school.district = new Types.ObjectId(input.district);
    if (input.country) school.country = new Types.ObjectId(input.country);
    if (input.boardType) school.boardType = new Types.ObjectId(input.boardType);
    if (input.maxStudents) school.maxStudents = input.maxStudents;
    if (input.shift !== undefined) school.shift = input.shift;
    if (input.startTime !== undefined) school.startTime = input.startTime;
    if (input.endTime !== undefined) school.endTime = input.endTime;
    if (input.admissionFee !== undefined) school.admissionFee = input.admissionFee;
    
    // Handle Subscription/Billing Cycle updates
    if (input.subscriptionPlan) {
      school.subscriptionPlan = new Types.ObjectId(input.subscriptionPlan);
    }
    if (input.billingCycle) {
      school.billingCycle = input.billingCycle;
      // Recalculate end date if billing cycle changes or a new plan is assigned
      if (input.subscriptionPlan || school.isModified('billingCycle')) {
        const startDate = school.subscriptionStartDate || new Date();
        const endDate = new Date(startDate);
        if (input.billingCycle === 'MONTHLY') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        school.subscriptionStartDate = startDate;
        school.subscriptionEndDate = endDate;
      }
    }

    if (input.settings) {
      school.settings = {
        ...school.settings,
        ...input.settings,
      };
    }

    return await school.save();
  }

  /**
   * Toggles the isDeactive status of a school.
   */
  async toggleSchoolStatus(id: string): Promise<ISchool> {
    const school = await SchoolModel.findById(id);
    if (!school) {
      throw new Error('School not found.');
    }
    school.isDeactive = !school.isDeactive;
    return await school.save();
  }

  /**
   * Deletes a school if it is deactivated and correct passcode is provided.
   */
  async deleteSchool(id: string, passcode: string): Promise<void> {
    if (passcode !== '727798') {
      throw new Error('Invalid master passcode.');
    }
    const school = await SchoolModel.findById(id);
    if (!school) {
      throw new Error('School not found.');
    }
    if (!school.isDeactive) {
      throw new Error('Only deactivated schools can be deleted.');
    }
    await SchoolModel.findByIdAndDelete(id);
  }
}

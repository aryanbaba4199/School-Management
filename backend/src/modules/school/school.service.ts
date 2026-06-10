import { SchoolModel, ISchool } from './school.model';
import { CreateSchoolInput } from './dto/create-school.dto';
import { UserService } from '../user/user.service';
import { RegistrationDraftModel } from './draft.model';
import { Types } from 'mongoose';

/*------------- School Database Service -------------*/

export class SchoolService {
  /**
   * Registers a new school in the system.
   * Throws an error if subdomain or email is already registered.
   */
  async registerSchool(input: CreateSchoolInput): Promise<ISchool> {
    const { code, subdomain, email, adminName, adminEmail, adminPassword, ...schoolData } = input;

    // Check for unique school code
    const existingCode = await SchoolModel.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new Error(`School code '${code}' is already registered.`);
    }

    // Check for unique subdomain
    const existingSubdomain = await SchoolModel.findOne({ subdomain: subdomain.toLowerCase() });
    if (existingSubdomain) {
      throw new Error(`Subdomain '${subdomain}' is already taken.`);
    }

    // Check for unique email
    const existingEmail = await SchoolModel.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new Error(`A school with the email '${email}' is already registered.`);
    }

    // Calculate Subscription Dates
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date(subscriptionStartDate);
    if (schoolData.billingCycle === 'MONTHLY') {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    }

    // Create and save new school
    const school = new SchoolModel({
      ...schoolData,
      code: code.toUpperCase(),
      subdomain: subdomain.toLowerCase(),
      email: email.toLowerCase(),
      country: new Types.ObjectId(schoolData.country),
      boardType: new Types.ObjectId(schoolData.boardType),
      subscriptionPlan: new Types.ObjectId(schoolData.subscriptionPlan),
      subscriptionStartDate,
      subscriptionEndDate,
    });

    const savedSchool = await school.save();

    // Create associated school admin user
    const userService = new UserService();
    await userService.createUser({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      userCode: 'ADMIN',
      role: {
        name: 'SCHOOL_ADMIN',
        access: ['ALL'],
      },
    }, savedSchool._id.toString());

    // Clean up draft registration if it exists
    await RegistrationDraftModel.deleteOne({ adminEmail: adminEmail.toLowerCase() });

    return savedSchool;
  }

  /**
   * Fetches schools with pagination parameters.
   */
  async findAllSchools(page: number, limit: number): Promise<{ schools: ISchool[]; totalCount: number }> {
    const skip = (page - 1) * limit;

    const [schools, totalCount] = await Promise.all([
      SchoolModel.find()
        .populate('country', 'name code')
        .populate('state', 'name code')
        .populate('district', 'name code')
        .populate('boardType', 'name acronym')
        .populate('subscriptionPlan', 'name')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      SchoolModel.countDocuments(),
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
   * Finds a draft registration by admin email.
   */
  async findDraftByEmail(adminEmail: string) {
    return await RegistrationDraftModel.findOne({ adminEmail: adminEmail.toLowerCase() });
  }

  /**
   * Saves or updates a draft registration.
   */
  async saveDraft(draftData: any) {
    const { adminEmail } = draftData;
    if (!adminEmail) {
      throw new Error('adminEmail is required to save a draft.');
    }
    return await RegistrationDraftModel.findOneAndUpdate(
      { adminEmail: adminEmail.toLowerCase() },
      { ...draftData, adminEmail: adminEmail.toLowerCase() },
      { new: true, upsert: true }
    );
  }

  /**
   * Deletes a draft registration by admin email.
   */
  async deleteDraft(adminEmail: string) {
    return await RegistrationDraftModel.deleteOne({ adminEmail: adminEmail.toLowerCase() });
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

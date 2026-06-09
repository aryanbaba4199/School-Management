import { SchoolModel, ISchool } from './school.model';
import { CreateSchoolInput } from './dto/create-school.dto';
import { UserService } from '../user/user.service';
import { RegistrationDraftModel } from './draft.model';

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

    // Create and save new school
    const school = new SchoolModel({
      ...schoolData,
      code: code.toUpperCase(),
      subdomain: subdomain.toLowerCase(),
      email: email.toLowerCase(),
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
      SchoolModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      SchoolModel.countDocuments(),
    ]);

    return {
      schools,
      totalCount,
    };
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
}

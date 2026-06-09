import { SchoolModel, ISchool } from './school.model';
import { CreateSchoolInput } from './dto/create-school.dto';

/*------------- School Database Service -------------*/

export class SchoolService {
  /**
   * Registers a new school in the system.
   * Throws an error if subdomain or email is already registered.
   */
  async registerSchool(input: CreateSchoolInput): Promise<ISchool> {
    const { code, subdomain, email } = input;

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
      ...input,
      code: code.toUpperCase(),
      subdomain: subdomain.toLowerCase(),
      email: email.toLowerCase(),
    });

    return await school.save();
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
}

import { SchoolModel, ISchool } from './school.model';
import { CreateSchoolInput } from './dto/create-school.dto';
import { UserService } from '../user/user.service';
import { RegistrationDraftModel } from './draft.model';
import { Types } from 'mongoose';

export class SchoolRegistrationService {
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
}

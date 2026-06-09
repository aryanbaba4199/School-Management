import { UserModel, IUser } from './user.model';
import { CreateUserInput, LoginInput } from './dto/create-user.dto';
import { hashPassword, verifyPassword } from '../../common/utils/crypto';
import { generateToken } from '../../common/utils/jwt';
import { Types } from 'mongoose';

/*------------- User Service Database Actions -------------*/

export class UserService {
  /**
   * Registers a new user with secure password hashing and relationship validations.
   */
  async createUser(input: CreateUserInput, schoolIdOverride?: string): Promise<IUser> {
    const { email, password, role, userCode } = input;

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error(`Email '${email}' is already registered.`);
    }

    // Resolve school tenancy ID
    let userSchoolId: Types.ObjectId | undefined;
    const finalSchoolId = schoolIdOverride || input.schoolId;
    if (role.name !== 'SUPER_ADMIN') {
      if (!finalSchoolId) {
        throw new Error('A school ID is required for role-based registration.');
      }
      userSchoolId = new Types.ObjectId(finalSchoolId);
    }

    // Check if userCode already exists within the same school
    const existingCode = await UserModel.findOne({
      userCode: userCode.toUpperCase(),
      schoolId: userSchoolId,
    });
    if (existingCode) {
      throw new Error(`User code '${userCode}' is already registered in this school.`);
    }

    // Hash the password using crypto utility
    const hashedPassword = hashPassword(password);

    // Resolve relational address state/district/city references if provided
    let finalAddress = undefined;
    if (input.address) {
      finalAddress = {
        ...input.address,
        city: input.address.city ? new Types.ObjectId(input.address.city) : undefined,
        state: input.address.state ? new Types.ObjectId(input.address.state) : undefined,
        district: input.address.district ? new Types.ObjectId(input.address.district) : undefined,
      };
    }

    const user = new UserModel({
      ...input,
      email: email.toLowerCase(),
      userCode: userCode.toUpperCase(),
      password: hashedPassword,
      schoolId: userSchoolId,
      address: finalAddress,
      parentId: input.parentId ? new Types.ObjectId(input.parentId) : undefined,
      childrenIds: input.childrenIds ? input.childrenIds.map(c => new Types.ObjectId(c)) : undefined,
      classId: input.classId ? new Types.ObjectId(input.classId) : undefined,
      sectionId: input.sectionId ? new Types.ObjectId(input.sectionId) : undefined,
      subjects: input.subjects ? input.subjects.map(s => new Types.ObjectId(s)) : undefined,
    });

    const savedUser = await user.save();
    
    // Convert to object and strip password field for response safety
    const userObj = savedUser.toObject() as IUser;
    delete userObj.password;
    return userObj;
  }

  /**
   * Validates credentials and returns JWT token alongside user details.
   */
  async authenticateUser(input: LoginInput): Promise<{ user: IUser; token: string }> {
    const { email, password } = input;

    // Fetch user including the password field
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password credentials.');
    }

    if (!user.isActive) {
      throw new Error('This user account has been deactivated.');
    }

    // Verify hashed password
    const isPasswordValid = verifyPassword(password, user.password || '');
    if (!isPasswordValid) {
      throw new Error('Invalid email or password credentials.');
    }

    // Generate JWT token containing payload info (passes role.name as string for token compatibility)
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role.name,
      schoolId: user.schoolId?.toString(),
    });

    const userObj = user.toObject() as IUser;
    delete userObj.password;

    return {
      user: userObj,
      token,
    };
  }

  /**
   * Fetches profile of a specific user.
   */
  async findUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id)
      .select('-password')
      .populate('parentId', 'name email userCode role')
      .populate('childrenIds', 'name email userCode role')
      .populate('address.city', 'name code')
      .populate('address.state', 'name code')
      .populate('address.district', 'name code');
  }

  /**
   * Fetches users with pagination, filtered by schoolId if provided.
   */
  async findUsers(
    schoolId?: string,
    page = 1,
    limit = 25
  ): Promise<{ users: IUser[]; totalCount: number }> {
    const filter: Record<string, unknown> = {};
    if (schoolId) {
      filter.schoolId = new Types.ObjectId(schoolId);
    }

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      UserModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('parentId', 'name email userCode role')
        .populate('childrenIds', 'name email userCode role')
        .populate('address.city', 'name code')
        .populate('address.state', 'name code')
        .populate('address.district', 'name code'),
      UserModel.countDocuments(filter),
    ]);

    return {
      users,
      totalCount,
    };
  }
}

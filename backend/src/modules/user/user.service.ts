import { UserModel, IUser } from './user.model';
import { CreateUserInput, LoginInput, UpdateUserInput } from './dto/create-user.dto';
import { hashPassword, verifyPassword } from '../../common/utils/crypto';
import { generateToken } from '../../common/utils/jwt';
import { Types } from 'mongoose';

/*------------- User Service Database Actions -------------*/

export class UserService {
  /**
   * Registers a new user with secure password hashing and tenancy checks.
   */
  async createUser(input: CreateUserInput, schoolIdOverride?: string): Promise<IUser> {
    const { email, password, role, userCode } = input;
    if (await UserModel.findOne({ email: email.toLowerCase() })) {
      throw new Error(`Email '${email}' is already registered.`);
    }

    const finalSchoolId = schoolIdOverride || input.schoolId;
    if (role.name !== 'SUPER_ADMIN' && !finalSchoolId) {
      throw new Error('A school ID is required for role-based registration.');
    }
    const schoolId = finalSchoolId ? new Types.ObjectId(finalSchoolId) : undefined;

    if (await UserModel.findOne({ userCode: userCode.toUpperCase(), schoolId })) {
      throw new Error(`User code '${userCode}' is already registered in this school.`);
    }

    const address = input.address ? {
      ...input.address,
      city: input.address.city ? new Types.ObjectId(input.address.city) : undefined,
      state: input.address.state ? new Types.ObjectId(input.address.state) : undefined,
      district: input.address.district ? new Types.ObjectId(input.address.district) : undefined,
    } : undefined;

    const user = new UserModel({
      ...input,
      email: email.toLowerCase(),
      userCode: userCode.toUpperCase(),
      password: hashPassword(password),
      schoolId,
      address,
      parentId: input.parentId ? new Types.ObjectId(input.parentId) : undefined,
      childrenIds: input.childrenIds?.map(c => new Types.ObjectId(c)),
      classId: input.classId ? new Types.ObjectId(input.classId) : undefined,
      sectionId: input.sectionId ? new Types.ObjectId(input.sectionId) : undefined,
      subjects: input.subjects?.map(s => new Types.ObjectId(s)),
    });

    const savedUser = await user.save();
    const userObj = savedUser.toObject() as IUser;
    delete userObj.password;
    return userObj;
  }

  /**
   * Authenticates user and returns JWT token and details.
   */
  async authenticateUser(input: LoginInput): Promise<{ user: IUser; token: string }> {
    const { email, password } = input;
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !verifyPassword(password, user.password || '')) {
      throw new Error('Invalid email or password credentials.');
    }
    if (!user.isActive) {
      throw new Error('This user account has been deactivated.');
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role.name,
      schoolId: user.schoolId?.toString(),
    });

    const userObj = user.toObject() as IUser;
    delete userObj.password;
    return { user: userObj, token };
  }

  /**
   * Fetches user by ID.
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
   * Fetches users list with optional school and role filters.
   */
  async findUsers(schoolId?: string, role?: string, page = 1, limit = 25): Promise<{ users: IUser[]; totalCount: number }> {
    const filter: Record<string, unknown> = {};
    if (schoolId) filter.schoolId = new Types.ObjectId(schoolId);
    if (role) filter['role.name'] = role;

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

    return { users, totalCount };
  }

  /**
   * Updates an existing user record.
   */
  async updateUser(id: string, input: UpdateUserInput, schoolIdOverride?: string): Promise<IUser> {
    const user = await UserModel.findById(id);
    if (!user) throw new Error('User not found.');
    if (schoolIdOverride && user.schoolId?.toString() !== schoolIdOverride) {
      throw new Error('Unauthorized access.');
    }

    if (input.email && input.email.toLowerCase() !== user.email.toLowerCase()) {
      if (await UserModel.findOne({ email: input.email.toLowerCase() })) {
        throw new Error(`Email '${input.email}' is already registered.`);
      }
      user.email = input.email.toLowerCase();
    }

    if (input.password) user.password = hashPassword(input.password);
    if (input.name) user.name = input.name;
    if (input.phone !== undefined) user.phone = input.phone;

    if (input.address) {
      user.address = {
        ...user.address,
        ...input.address,
        city: input.address.city ? new Types.ObjectId(input.address.city) : undefined,
        state: input.address.state ? new Types.ObjectId(input.address.state) : undefined,
        district: input.address.district ? new Types.ObjectId(input.address.district) : undefined,
      };
    }

    if (input.parentId !== undefined) user.parentId = input.parentId ? new Types.ObjectId(input.parentId) : undefined;
    if (input.childrenIds !== undefined) user.childrenIds = input.childrenIds.map(c => new Types.ObjectId(c));
    if (input.classId !== undefined) user.classId = input.classId ? new Types.ObjectId(input.classId) : undefined;
    if (input.sectionId !== undefined) user.sectionId = input.sectionId ? new Types.ObjectId(input.sectionId) : undefined;
    if (input.subjects !== undefined) user.subjects = input.subjects.map(s => new Types.ObjectId(s));

    const savedUser = await user.save();
    const userObj = savedUser.toObject() as IUser;
    delete userObj.password;
    return userObj;
  }

  /**
   * Toggles active state of a user.
   */
  async toggleUserStatus(id: string, schoolIdOverride?: string): Promise<IUser> {
    const user = await UserModel.findById(id);
    if (!user) throw new Error('User not found.');
    if (schoolIdOverride && user.schoolId?.toString() !== schoolIdOverride) {
      throw new Error('Unauthorized access.');
    }

    user.isActive = !user.isActive;
    const savedUser = await user.save();
    const userObj = savedUser.toObject() as IUser;
    delete userObj.password;
    return userObj;
  }

  /**
   * Deletes a user record.
   */
  async deleteUser(id: string, schoolIdOverride?: string): Promise<void> {
    const user = await UserModel.findById(id);
    if (!user) throw new Error('User not found.');
    if (schoolIdOverride && user.schoolId?.toString() !== schoolIdOverride) {
      throw new Error('Unauthorized access.');
    }
    await UserModel.findByIdAndDelete(id);
  }
}

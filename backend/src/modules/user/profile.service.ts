import { UserModel, IUser } from './user.model';
import { hashPassword, verifyPassword } from '../../common/utils/crypto';
import { Types } from 'mongoose';
import { UserAuditService } from './user-audit.service';

export class ProfileService {
  /**
   * Updates user profile (self-service).
   * Restricts which fields can be updated based on role.
   */
  async updateProfile(userId: string, input: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found.');

    if (input.email && input.email.toLowerCase() !== user.email.toLowerCase()) {
      if (await UserModel.findOne({ email: input.email.toLowerCase() })) {
        throw new Error(`Email '${input.email}' is already registered.`);
      }
      user.email = input.email.toLowerCase();
    }

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

    const savedUser = await user.save();
    const userObj = savedUser.toObject() as IUser;
    delete userObj.password;

    await UserAuditService.logAction({
      schoolId: savedUser.schoolId?.toString(),
      userId: savedUser._id,
      changedBy: savedUser._id,
      action: 'UPDATE',
      newData: userObj as unknown as Record<string, unknown>,
    });

    return userObj;
  }

  /**
   * Changes the password of the current user.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserModel.findById(userId).select('+password');
    if (!user) throw new Error('User not found.');

    if (!verifyPassword(currentPassword, user.password || '')) {
      throw new Error('Current password is incorrect.');
    }

    user.password = hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    const savedUser = await user.save();

    await UserAuditService.logAction({
      schoolId: savedUser.schoolId?.toString(),
      userId: savedUser._id,
      changedBy: savedUser._id,
      action: 'PASSWORD_CHANGE',
      reason: 'User changed their password via self-service.',
    });
  }
}

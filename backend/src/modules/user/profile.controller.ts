import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';

const profileService = new ProfileService();

export class ProfileController {
  /**
   * HTTP PUT /api/users/profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, 'Unauthorized request');
        return;
      }
      const user = await profileService.updateProfile(req.user.userId, req.body);
      sendSuccess(res, 200, user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP PUT /api/users/profile/password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, 'Unauthorized request');
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        sendError(res, 400, 'Both current and new passwords are required.');
        return;
      }
      await profileService.changePassword(req.user.userId, currentPassword, newPassword);
      sendSuccess(res, 200, null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      sendError(res, 400, errorMessage);
    }
  }
}

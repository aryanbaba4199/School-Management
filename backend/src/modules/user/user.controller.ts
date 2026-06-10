import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';

/*------------- User Controller Definition -------------*/

const userService = new UserService();

export class UserController {
  /**
   * HTTP POST /api/users/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.authenticateUser(req.body);
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP POST /api/users
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requester = req.user;
      if (!requester) {
        sendError(res, 401, 'Unauthorized request');
        return;
      }

      let schoolIdOverride: string | undefined;
      if (requester.role !== 'SUPER_ADMIN') {
        schoolIdOverride = requester.schoolId;
      }

      const user = await userService.createUser(req.body, schoolIdOverride);
      sendSuccess(res, 201, user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'User registration failed';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/users/profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, 'Unauthorized request');
        return;
      }

      const user = await userService.findUserById(req.user.userId);
      if (!user) {
        sendError(res, 404, 'User profile not found');
        return;
      }

      sendSuccess(res, 200, user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP GET /api/users
   */
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, 'Unauthorized request');
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 25);
      const role = req.query.role as string | undefined;

      let filterSchoolId: string | undefined;
      if (req.user.role !== 'SUPER_ADMIN') {
        filterSchoolId = req.user.schoolId;
      }

      const { users, totalCount } = await userService.findUsers(filterSchoolId, role, page, limit);
      const totalPages = Math.ceil(totalCount / limit);

      sendSuccess(res, 200, users, {
        totalPages,
        totalCount,
        currentPage: page,
        limit,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP PUT /api/users/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requester = req.user;
      if (!requester) {
        sendError(res, 401, 'Unauthorized request');
        return;
      }

      let schoolIdOverride: string | undefined;
      if (requester.role !== 'SUPER_ADMIN') {
        schoolIdOverride = requester.schoolId;
      }

      const user = await userService.updateUser(req.params.id as string, req.body, schoolIdOverride);
      sendSuccess(res, 200, user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'User update failed';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP PATCH /api/users/:id/status
   */
  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requester = req.user;
      if (!requester) {
        sendError(res, 401, 'Unauthorized request');
        return;
      }

      let schoolIdOverride: string | undefined;
      if (requester.role !== 'SUPER_ADMIN') {
        schoolIdOverride = requester.schoolId;
      }

      const user = await userService.toggleUserStatus(req.params.id as string, schoolIdOverride);
      sendSuccess(res, 200, user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle status';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP DELETE /api/users/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requester = req.user;
      if (!requester) {
        sendError(res, 401, 'Unauthorized request');
        return;
      }

      let schoolIdOverride: string | undefined;
      if (requester.role !== 'SUPER_ADMIN') {
        schoolIdOverride = requester.schoolId;
      }

      await userService.deleteUser(req.params.id as string, schoolIdOverride);
      sendSuccess(res, 200, null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'User deletion failed';
      sendError(res, 400, errorMessage);
    }
  }
}

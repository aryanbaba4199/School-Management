import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';
import { generateUserCode } from './utils/user-code-generator.util';
import { UserAuditService } from './user-audit.service';

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
      if (req.user?.role === 'SCHOOL_ADMIN') {
        const targetRole = req.body.role?.name;
        if (targetRole === 'SUPER_ADMIN' || targetRole === 'SCHOOL_ADMIN') {
          sendError(res, 403, 'School Admins cannot create SUPER_ADMIN or SCHOOL_ADMIN roles.');
          return;
        }
      }

      // req.schoolId is set by injectSchoolId for non-SUPER_ADMIN.
      // SUPER_ADMIN can specify schoolId in the body.
      const user = await userService.createUser(req.body, req.schoolId, req.user?.userId);
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
   * HTTP GET /api/users/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.findUserById(req.params.id as string);
      if (!user) {
        sendError(res, 404, 'User not found');
        return;
      }
      const userSchoolId = user.schoolId ? (typeof user.schoolId === 'object' && '_id' in user.schoolId ? String((user.schoolId as { _id: unknown })._id) : String(user.schoolId)) : undefined;
      
      if (req.schoolId && userSchoolId !== req.schoolId) {
        sendError(res, 403, 'Unauthorized access to user profile');
        return;
      }
      sendSuccess(res, 200, user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP GET /api/users
   */
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 25);
      const role = req.query.role as string | undefined;
      const classId = req.query.classId as string | undefined;
      const sectionId = req.query.sectionId as string | undefined;

      const querySchoolId = req.user?.role === 'SUPER_ADMIN' ? (req.query.schoolId as string) : undefined;
      const effectiveSchoolId = req.schoolId || querySchoolId;

      const { users, totalCount } = await userService.findUsers(effectiveSchoolId, role, page, limit, classId, sectionId);
      const totalPages = Math.ceil(totalCount / limit);

      sendSuccess(res, 200, users, { totalPages, totalCount, currentPage: page, limit });
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
      if (req.user?.role === 'SCHOOL_ADMIN' && req.body.role?.name) {
        const targetRole = req.body.role.name;
        if (targetRole === 'SUPER_ADMIN' || targetRole === 'SCHOOL_ADMIN') {
          sendError(res, 403, 'School Admins cannot assign SUPER_ADMIN or SCHOOL_ADMIN roles.');
          return;
        }
      }

      const user = await userService.updateUser(req.params.id as string, req.body, req.schoolId, req.user?.userId);
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
      const user = await userService.toggleUserStatus(req.params.id as string, req.schoolId, req.user?.userId);
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
      if (req.user?.userId === req.params.id) {
        sendError(res, 403, 'You cannot delete your own account.');
        return;
      }
      await userService.deleteUser(req.params.id as string, req.schoolId, req.user?.userId);
      sendSuccess(res, 200, null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'User deletion failed';
      sendError(res, 400, errorMessage);
    }
  }
  /**
   * HTTP POST /api/users/generate-code
   */
  async generateCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body;
      if (!role) {
        sendError(res, 400, 'Role is required to generate a user code.');
        return;
      }
      
      const querySchoolId = req.user?.role === 'SUPER_ADMIN' ? req.body.schoolId : undefined;
      const effectiveSchoolId = req.schoolId || querySchoolId;
      
      if (role !== 'SUPER_ADMIN' && !effectiveSchoolId) {
        sendError(res, 400, 'School ID is required for generating codes for this role.');
        return;
      }

      const code = await generateUserCode(role, effectiveSchoolId);
      sendSuccess(res, 200, { userCode: code });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate user code';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP GET /api/users/:id/audit-log
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await UserAuditService.getUserLogs(req.params.id as string, req.schoolId);
      sendSuccess(res, 200, logs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs';
      sendError(res, 500, errorMessage);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { UserBulkService } from './user-bulk.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';

const bulkService = new UserBulkService();

export class UserBulkController {
  /**
   * HTTP POST /api/users/bulk-import
   */
  async importUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { csvData, role } = req.body;
      if (!csvData || !role) {
        sendError(res, 400, 'CSV data and role are required.');
        return;
      }

      if (req.user?.role === 'SCHOOL_ADMIN' && (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN')) {
        sendError(res, 403, 'School Admins cannot import SUPER_ADMIN or SCHOOL_ADMIN roles.');
        return;
      }

      const querySchoolId = req.user?.role === 'SUPER_ADMIN' ? req.body.schoolId : undefined;
      const effectiveSchoolId = req.schoolId || querySchoolId;

      if (!effectiveSchoolId) {
        sendError(res, 400, 'School ID is required for bulk import.');
        return;
      }

      const results = await bulkService.importUsers(csvData, effectiveSchoolId, role, req.user?.userId || '');
      sendSuccess(res, 200, results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import users';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/users/export
   */
  async exportUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.query.role as string | undefined;
      const classId = req.query.classId as string | undefined;
      const sectionId = req.query.sectionId as string | undefined;

      const querySchoolId = req.user?.role === 'SUPER_ADMIN' ? (req.query.schoolId as string) : undefined;
      const effectiveSchoolId = req.schoolId || querySchoolId;

      const csvString = await bulkService.exportUsers(effectiveSchoolId, role, classId, sectionId);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users_export_${new Date().getTime()}.csv`);
      res.status(200).send(csvString);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export users';
      sendError(res, 500, errorMessage);
    }
  }
}

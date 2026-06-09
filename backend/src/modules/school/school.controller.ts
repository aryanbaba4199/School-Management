import { Request, Response, NextFunction } from 'express';
import { SchoolService } from './school.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';

/*------------- School Controller Definition -------------*/

const schoolService = new SchoolService();

export class SchoolController {
  /**
   * HTTP POST /api/schools
   * Handles school registration requests.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolService.registerSchool(req.body);
      sendSuccess(res, 201, school);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/schools
   * Handles paginated fetching of schools. Default limit is 25.
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 25);

      const { schools, totalCount } = await schoolService.findAllSchools(page, limit);
      const totalPages = Math.ceil(totalCount / limit);

      sendSuccess(res, 200, schools, {
        totalPages,
        totalCount,
        currentPage: page,
        limit,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching schools';
      sendError(res, 500, errorMessage);
    }
  }
}

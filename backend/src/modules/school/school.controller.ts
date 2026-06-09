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

  /**
   * HTTP GET /api/schools/drafts/:email
   * Retrieves a draft registration by adminEmail.
   */
  async getDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.params.email as string;
      const draft = await schoolService.findDraftByEmail(email);
      sendSuccess(res, 200, draft);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching draft';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP POST /api/schools/drafts
   * Saves/Updates a draft registration.
   */
  async saveDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const draft = await schoolService.saveDraft(req.body);
      sendSuccess(res, 200, draft);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while saving draft';
      sendError(res, 400, errorMessage);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { SubjectService } from './subject.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';

/*------------- Subject Controller Implementation -------------*/

const subjectService = new SubjectService();

export class SubjectController {
  /**
   * HTTP POST /api/subjects
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.schoolId || req.body.schoolId;
      if (!schoolId) {
        sendError(res, 400, 'School ID is required');
        return;
      }

      const result = await subjectService.createSubject({
        name: req.body.name,
        code: req.body.code,
        teacherIds: req.body.teacherIds,
        schoolId,
      });

      sendSuccess(res, 201, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create subject';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/subjects
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const result = await subjectService.findSubjects(req.schoolId, search);
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subjects';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP GET /api/subjects/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subjectService.findSubjectById(req.params.id as string, req.schoolId);
      if (!result) {
        sendError(res, 404, 'Subject not found');
        return;
      }
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subject';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP PUT /api/subjects/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subjectService.updateSubject(
        req.params.id as string,
        {
          name: req.body.name,
          code: req.body.code,
          teacherIds: req.body.teacherIds,
        },
        req.schoolId
      );
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update subject';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP DELETE /api/subjects/:id
   */
  async deleteSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await subjectService.deleteSubject(req.params.id as string, req.schoolId);
      sendSuccess(res, 200, { message: 'Subject deleted successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete subject';
      sendError(res, 400, errorMessage);
    }
  }
}

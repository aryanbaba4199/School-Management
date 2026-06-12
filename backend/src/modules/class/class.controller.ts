import { Request, Response, NextFunction } from 'express';
import { ClassService } from './class.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';

/*------------- Class Controller Implementation -------------*/

const classService = new ClassService();

export class ClassController {
  /**
   * HTTP POST /api/classes
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.schoolId || req.body.schoolId;
      if (!schoolId) {
        sendError(res, 400, 'School ID is required');
        return;
      }

      const result = await classService.createClass({
        name: req.body.name,
        schoolId,
        sections: req.body.sections,
        classTeacherId: req.body.classTeacherId,
        schedule: req.body.schedule,
        monthlyFee: req.body.monthlyFee,
        yearlyFee: req.body.yearlyFee,
      });

      sendSuccess(res, 201, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create class';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/classes
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const result = await classService.findClasses(req.schoolId, search);
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch classes';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP GET /api/classes/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await classService.findClassById(req.params.id as string, req.schoolId);
      if (!result) {
        sendError(res, 404, 'Class not found');
        return;
      }
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch class';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP PUT /api/classes/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await classService.updateClass(
        req.params.id as string,
        {
          name: req.body.name,
          sections: req.body.sections,
          classTeacherId: req.body.classTeacherId,
          schedule: req.body.schedule,
          monthlyFee: req.body.monthlyFee,
          yearlyFee: req.body.yearlyFee,
        },
        req.schoolId
      );
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update class';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP DELETE /api/classes/:id
   */
  async deleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await classService.deleteClass(req.params.id as string, req.schoolId);
      sendSuccess(res, 200, { message: 'Class deleted successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete class';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/classes/sections
   */
  async listSections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.query.classId as string | undefined;
      const result = await classService.findSections(req.schoolId, classId);
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sections';
      sendError(res, 500, errorMessage);
    }
  }
}

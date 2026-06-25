import { Request, Response, NextFunction } from 'express';
import { HomeworkService } from './homework.service';
import { SubmissionService } from './submission.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';

const homeworkService = new HomeworkService();
const submissionService = new SubmissionService();

export class HomeworkController {
  // --- Homework Management ---

  async createHomework(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.schoolId || !req.user.userId) {
        throw new Error('Unauthorized or missing user context');
      }
      const schoolId = typeof req.user.schoolId === 'object' ? (req.user.schoolId as { _id: string })._id : req.user.schoolId;

      const result = await homeworkService.createHomework(schoolId, req.user.userId, req.body);
      sendSuccess(res, 201, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Creation failed';
      sendError(res, 400, errorMessage);
    }
  }

  async getAllHomework(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.schoolId) throw new Error('Unauthorized');
      const schoolId = typeof req.user.schoolId === 'object' ? (req.user.schoolId as { _id: string })._id : req.user.schoolId;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        classId: req.query.classId as string,
        sectionId: req.query.sectionId as string,
        subjectId: req.query.subjectId as string,
        teacherId: req.query.teacherId as string,
      };

      const result = await homeworkService.findAllHomework(schoolId, page, limit, filters);
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
      sendError(res, 400, errorMessage);
    }
  }

  async getHomeworkById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.schoolId) throw new Error('Unauthorized');
      const schoolId = typeof req.user.schoolId === 'object' ? (req.user.schoolId as { _id: string })._id : req.user.schoolId;

      const result = await homeworkService.getHomeworkById(schoolId, req.params.id as string);
      if (!result) throw new Error('Homework not found');

      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
      sendError(res, 404, errorMessage);
    }
  }

  async deleteHomework(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.schoolId) throw new Error('Unauthorized');
      const schoolId = typeof req.user.schoolId === 'object' ? (req.user.schoolId as { _id: string })._id : req.user.schoolId;

      const success = await homeworkService.deleteHomework(schoolId, req.params.id as string);
      if (!success) throw new Error('Homework not found or could not be deleted');

      sendSuccess(res, 200, null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deletion failed';
      sendError(res, 400, errorMessage);
    }
  }

  // --- Submissions and Grading ---

  async submitHomework(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.schoolId || !req.user.userId) throw new Error('Unauthorized');
      const schoolId = typeof req.user.schoolId === 'object' ? (req.user.schoolId as { _id: string })._id : req.user.schoolId;

      const result = await submissionService.submitHomework(
        schoolId,
        req.user.userId,
        req.params.id as string,
        req.body
      );
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      sendError(res, 400, errorMessage);
    }
  }

  async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.schoolId || !req.user.userId) throw new Error('Unauthorized');
      const schoolId = typeof req.user.schoolId === 'object' ? (req.user.schoolId as { _id: string })._id : req.user.schoolId;

      const result = await submissionService.gradeSubmission(
        schoolId,
        req.user.userId,
        req.params.submissionId as string,
        req.body
      );
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Grading failed';
      sendError(res, 400, errorMessage);
    }
  }

  async getSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.schoolId) throw new Error('Unauthorized');
      const schoolId = typeof req.user.schoolId === 'object' ? (req.user.schoolId as { _id: string })._id : req.user.schoolId;

      const result = await submissionService.getSubmissionsByHomework(schoolId, req.params.id as string);
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
      sendError(res, 400, errorMessage);
    }
  }

  async getStudentDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.schoolId || !req.user.userId) throw new Error('Unauthorized');
      const schoolId = typeof req.user.schoolId === 'object' ? (req.user.schoolId as { _id: string })._id : req.user.schoolId;

      const result = await submissionService.getStudentDashboard(schoolId, req.user.userId);
      sendSuccess(res, 200, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
      sendError(res, 400, errorMessage);
    }
  }
}

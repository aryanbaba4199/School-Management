import { Application } from 'express';
import examRoutes from './exam.routes';

export class ExamModule {
  static init(app: Application) {
    app.use('/api/exams', examRoutes);
  }
}

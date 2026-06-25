import { Application } from 'express';
import HomeworkRoutes from './homework.routes';

export class HomeworkModule {
  static init(app: Application): void {
    app.use('/api/homework', HomeworkRoutes);
  }
}

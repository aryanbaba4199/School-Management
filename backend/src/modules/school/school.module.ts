import { Application } from 'express';
import schoolRouter from './school.routes';

/*------------- School Module Loader -------------*/

export class SchoolModule {
  /**
   * Initializes the school module routes on the Express application.
   */
  static init(app: Application): void {
    app.use('/api/schools', schoolRouter);
  }
}

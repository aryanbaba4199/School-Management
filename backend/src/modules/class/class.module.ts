import { Application } from 'express';
import classRouter from './class.routes';

/*------------- Class Module Loader -------------*/

export class ClassModule {
  /**
   * Initializes the class module routes on the Express application.
   */
  static init(app: Application): void {
    app.use('/api/classes', classRouter);
  }
}

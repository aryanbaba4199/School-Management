import { Application } from 'express';
import subjectRouter from './subject.routes';

/*------------- Subject Module Loader -------------*/

export class SubjectModule {
  /**
   * Initializes the subject module routes on the Express application.
   */
  static init(app: Application): void {
    app.use('/api/subjects', subjectRouter);
  }
}

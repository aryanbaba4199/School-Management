import { Application } from 'express';
import masterRouter from './master.routes';

/*------------- Master Module Loader -------------*/

export class MasterModule {
  /**
   * Initializes the master module routes on the Express application.
   */
  static init(app: Application): void {
    app.use('/api/masters', masterRouter);
  }
}

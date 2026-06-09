import { Application } from 'express';
import userRouter from './user.routes';

/*------------- User Module Loader -------------*/

export class UserModule {
  /**
   * Initializes the user module routes on the Express application.
   */
  static init(app: Application): void {
    app.use('/api/users', userRouter);
  }
}

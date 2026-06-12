import { Application } from 'express';
import feeRoutes from './fee.routes';

export class FeeModule {
  static init(app: Application) {
    app.use('/api/fees', feeRoutes);
  }
}

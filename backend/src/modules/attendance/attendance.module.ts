import { Application } from 'express';
import { attendanceRoutes } from './attendance.routes';

export class AttendanceModule {
  static init(app: Application): void {
    app.use('/api/attendance', attendanceRoutes);
  }
}

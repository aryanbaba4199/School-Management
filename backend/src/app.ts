import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { SchoolModule } from './modules/school/school.module';
import { MasterModule } from './modules/master/master.module';
import { UserModule } from './modules/user/user.module';
import { ClassModule } from './modules/class/class.module';
import { SubjectModule } from './modules/subject/subject.module';
import { FeeModule } from './modules/fee/fee.module';
import { ExamModule } from './modules/exam/exam.module';

/*------------- Express Application Configuration -------------*/

const app: Application = express();

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize modules
SchoolModule.init(app);
MasterModule.init(app);
UserModule.init(app);
ClassModule.init(app);
SubjectModule.init(app);
FeeModule.init(app);
ExamModule.init(app);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { AttendanceRecordModel, AttendanceAuditLogModel, AttendanceSettingsModel } from './attendance.model';
import { UserModel } from '../user/user.model';
import { generateToken } from '../../common/utils/jwt';

// Mock models
jest.mock('./attendance.model');
jest.mock('../school/school.model');
jest.mock('../user/user.model');

describe('Attendance API', () => {
  const schoolId = new mongoose.Types.ObjectId();
  const classId = new mongoose.Types.ObjectId();
  const sectionId = new mongoose.Types.ObjectId();
  
  const student1Id = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  let adminToken: string;

  beforeAll(() => {
    adminToken = generateToken({
      userId: adminId.toString(),
      role: 'SCHOOL_ADMIN',
      schoolId: schoolId.toString(),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default settings mock to avoid TypeError on .exec()
    (AttendanceSettingsModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null)
    });
  });

  describe('POST /api/attendance/students/bulk', () => {
    it('should successfully bulk upsert student attendance', async () => {
      const dateStr = '2026-06-13';
      const payload = {
        classId: classId.toString(),
        sectionId: sectionId.toString(),
        date: dateStr,
        records: [
          { studentId: student1Id.toString(), status: 'PRESENT' }
        ]
      };

      // Mock student existence validation
      (UserModel.countDocuments as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(1)
      });

      // Mock finding existing
      (AttendanceRecordModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      });

      // Mock bulkWrite
      (AttendanceRecordModel.bulkWrite as jest.Mock).mockResolvedValue({
        modifiedCount: 0,
        upsertedCount: 1
      });

      // Mock finding updated
      (AttendanceRecordModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            schoolId,
            personType: 'STUDENT',
            personId: student1Id,
            date: new Date(dateStr),
            status: 'PRESENT',
            remarks: '',
            toObject: function() { return this; }
          }
        ])
      });

      (AttendanceAuditLogModel.insertMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .post('/api/attendance/students/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.upsertedCount).toBe(1);
    });
  });

  describe('GET /api/attendance/students', () => {
    it('should fetch attendance filtered by date and class', async () => {
      const dateStr = '2026-06-13';
      
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            schoolId,
            personType: 'STUDENT',
            personId: { _id: student1Id, name: 'Student 1', userCode: 'S1' },
            date: new Date(dateStr),
            status: 'PRESENT',
            source: 'MANUAL',
            isLocked: false,
          }
        ])
      };
      (AttendanceRecordModel.find as jest.Mock).mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/attendance/students?date=${dateStr}&classId=${classId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('PRESENT');
    });
  });

  describe('GET /api/attendance/settings', () => {
    it('should return default settings if none exist', async () => {
      (AttendanceSettingsModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app)
        .get('/api/attendance/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentAttendanceMode).toBe('MANUAL');
    });
  });
});

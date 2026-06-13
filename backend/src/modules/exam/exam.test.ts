import request from 'supertest';
import app from '../../app';
import { generateToken } from '../../common/utils/jwt';
import { Exam, ExamSchedule, StudentExamMark, ReportCard, GradeConfig } from './exam.model';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./exam.model', () => ({
  Exam: { findOne: jest.fn(), create: jest.fn() },
  ExamSchedule: { find: jest.fn() },
  StudentExamMark: { find: jest.fn() },
  GradeConfig: { find: jest.fn() },
  ReportCard: { bulkWrite: jest.fn(), find: jest.fn() },
}));

describe('Exam Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const schoolAdminToken = generateToken({
    userId: 'admin123',
    role: 'SCHOOL_ADMIN',
    schoolId: 'school1',
  });

  describe('POST /api/exams/results/generate', () => {
    it('should generate report cards and calculate grades correctly', async () => {
      // Mock Exam
      (Exam.findOne as jest.Mock).mockResolvedValue({
        _id: 'exam1',
        name: 'Finals',
        schoolId: 'school1',
      });

      // Mock Schedules
      (ExamSchedule.find as jest.Mock).mockResolvedValue([
        { _id: 'sched1', subjectId: 'sub1', maxMarks: 100, passMarks: 40 },
        { _id: 'sched2', subjectId: 'sub2', maxMarks: 50, passMarks: 20 },
      ]);

      // Mock Student Marks
      (StudentExamMark.find as jest.Mock).mockResolvedValue([
        { studentId: 'student1', examScheduleId: 'sched1', obtainedMarks: 85, attendanceStatus: 'PRESENT' },
        { studentId: 'student1', examScheduleId: 'sched2', obtainedMarks: 40, attendanceStatus: 'PRESENT' },
        { studentId: 'student2', examScheduleId: 'sched1', obtainedMarks: 35, attendanceStatus: 'PRESENT' }, // Fail
        { studentId: 'student2', examScheduleId: 'sched2', obtainedMarks: 40, attendanceStatus: 'PRESENT' },
      ]);

      // Mock GradeConfig
      (GradeConfig.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { grade: 'A', minPercentage: 90, maxPercentage: 100 },
          { grade: 'B', minPercentage: 80, maxPercentage: 89.99 },
          { grade: 'F', minPercentage: 0, maxPercentage: 79.99 },
        ])
      });

      // Mock Bulk Write
      (ReportCard.bulkWrite as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/exams/results/generate')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ examId: 'exam1', classId: 'class1', sectionId: 'section1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('generated successfully');

      // Verify bulkWrite was called
      expect(ReportCard.bulkWrite).toHaveBeenCalled();
      const operations = (ReportCard.bulkWrite as jest.Mock).mock.calls[0][0];
      
      expect(operations).toHaveLength(2);
      
      const student1Op = operations.find((op: any) => op.updateOne.filter.studentId === 'student1').updateOne.update.$set;
      expect(student1Op.totalMarks).toBe(150);
      expect(student1Op.obtainedMarks).toBe(125);
      expect(student1Op.percentage).toBeCloseTo(83.33);
      expect(student1Op.result).toBe('PASS');
      expect(student1Op.grade).toBe('B');
      expect(student1Op.rank).toBe(1);

      const student2Op = operations.find((op: any) => op.updateOne.filter.studentId === 'student2').updateOne.update.$set;
      expect(student2Op.result).toBe('FAIL');
      expect(student2Op.grade).toBe('F');
      expect(student2Op.rank).toBe(2);
    });

    it('should return 404 if no marks found', async () => {
      (StudentExamMark.find as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/exams/results/generate')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ examId: 'exam1', classId: 'class1', sectionId: 'section1' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('No marks found');
    });
  });

  describe('GET /api/exams/results/report-cards', () => {
    it('should fetch report cards with populated data', async () => {
      const mockReportCards = [
        { _id: 'rc1', studentId: { name: 'Alice' }, rank: 1, percentage: 90 },
      ];

      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue(mockReportCards);
      
      (ReportCard.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
        sort: mockSort,
      });

      const response = await request(app)
        .get('/api/exams/results?examId=exam1&classId=class1&sectionId=sec1')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].studentId.name).toBe('Alice');

      // Assert populate was called multiple times
      expect(mockPopulate).toHaveBeenCalledWith('studentId', expect.any(String));
    });
  });
});

import request from 'supertest';
import app from '../../app';
import { generateToken } from '../../common/utils/jwt';
import { HomeworkModel, HomeworkSubmissionModel } from './homework.model';
import { UserModel } from '../user/user.model';

jest.mock('./homework.model');
jest.mock('../user/user.model');

describe('Homework Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const teacherToken = generateToken({ userId: '60f7c223405c102c98d6c810', schoolId: '60f7c223405c102c98d6c800', role: 'TEACHER' });
  const studentToken = generateToken({ userId: '60f7c223405c102c98d6c820', schoolId: '60f7c223405c102c98d6c800', role: 'STUDENT' });

  const mockHomeworkDbDoc = {
    _id: '60f7c223405c102c98d6c830',
    schoolId: '60f7c223405c102c98d6c800',
    teacherId: '60f7c223405c102c98d6c810',
    classId: '60f7c223405c102c98d6c801',
    sectionId: '60f7c223405c102c98d6c802',
    subjectId: '60f7c223405c102c98d6c803',
    title: 'Test Homework',
    description: 'Solve the attached worksheet',
    dueDate: new Date(Date.now() + 86400000), // Tomorrow
    attachments: [],
    save: jest.fn().mockResolvedValue(true),
  };

  const mockSubmissionDbDoc = {
    _id: '60f7c223405c102c98d6c840',
    schoolId: '60f7c223405c102c98d6c800',
    homeworkId: mockHomeworkDbDoc._id,
    studentId: '60f7c223405c102c98d6c820',
    status: 'PENDING',
    attachments: [],
  };

  describe('POST /api/homework', () => {
    it('should create homework and initialize submissions for teacher', async () => {
      // Mock saving homework
      (HomeworkModel.prototype.save as jest.Mock).mockResolvedValue(mockHomeworkDbDoc);

      // Mock finding students in class
      const mockQueryChain = {
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ _id: 'student1' }, { _id: 'student2' }]),
        }),
      };
      (UserModel.find as jest.Mock).mockReturnValue(mockQueryChain);
      (HomeworkSubmissionModel.insertMany as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/homework')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          classId: '000000000000000000000001',
          sectionId: '000000000000000000000002',
          subjectId: '000000000000000000000003',
          title: 'Math Equations',
          description: 'Solve problems on pg 15',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Test Homework');
      expect(HomeworkSubmissionModel.insertMany).toHaveBeenCalled();
    });

    it('should return 403 if student tries to create homework', async () => {
      const response = await request(app)
        .post('/api/homework')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          classId: '000000000000000000000001',
          sectionId: '000000000000000000000002',
          subjectId: '000000000000000000000003',
          title: 'Math Equations',
          description: 'Solve problems on pg 15',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/homework/:id/submit', () => {
    it('should allow student to submit homework', async () => {
      // Mock homework lookup
      const mockHomeworkQueryChain = {
        exec: jest.fn().mockResolvedValue(mockHomeworkDbDoc),
      };
      (HomeworkModel.findOne as jest.Mock).mockReturnValue(mockHomeworkQueryChain);

      // Mock upserting submission
      const mockSubmissionQueryChain = {
        exec: jest.fn().mockResolvedValue({ ...mockSubmissionDbDoc, status: 'SUBMITTED' }),
      };
      (HomeworkSubmissionModel.findOneAndUpdate as jest.Mock).mockReturnValue(mockSubmissionQueryChain);

      const response = await request(app)
        .post(`/api/homework/${mockHomeworkDbDoc._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studentNotes: 'Here is my assignment.',
          attachments: [],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('SUBMITTED');
    });

    it('should return 403 if teacher tries to submit homework', async () => {
      const response = await request(app)
        .post(`/api/homework/${mockHomeworkDbDoc._id}/submit`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentNotes: 'Teacher trying to submit' });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/homework/submissions/:submissionId/grade', () => {
    it('should allow teacher to grade a submission', async () => {
      const mockQueryChain = {
        exec: jest.fn().mockResolvedValue({ ...mockSubmissionDbDoc, status: 'GRADED', obtainedMarks: 90 }),
      };
      (HomeworkSubmissionModel.findOneAndUpdate as jest.Mock).mockReturnValue(mockQueryChain);

      const response = await request(app)
        .put(`/api/homework/submissions/${mockSubmissionDbDoc._id}/grade`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          obtainedMarks: 90,
          teacherFeedback: 'Great job!',
          status: 'GRADED',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.obtainedMarks).toBe(90);
    });
  });
});

import request from 'supertest';
import app from '../../app';
import { SubjectModel } from './subject.model';
import { UserModel } from '../user/user.model';
import { generateToken } from '../../common/utils/jwt';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./subject.model');
jest.mock('../user/user.model');

describe('Subject Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const schoolAdminToken = generateToken({
    userId: 'schooladmin123',
    role: 'SCHOOL_ADMIN',
    schoolId: 'school123',
  });

  describe('POST /api/subjects', () => {
    it('should create a new subject', async () => {
      const mockSubjectSave = jest.fn().mockResolvedValue({
        _id: 'sub123',
        name: 'Mathematics',
        code: 'MATH101',
        schoolId: 'school123',
        teacherIds: [],
      });
      (SubjectModel as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSubjectSave,
      }));

      const response = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ name: 'Mathematics', code: 'MATH101', teacherIds: [] });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Mathematics');
    });
  });

  describe('GET /api/subjects', () => {
    it('should list subjects for school admin', async () => {
      (SubjectModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([
            { _id: 'sub123', name: 'Mathematics', code: 'MATH101', schoolId: 'school123', teacherIds: [] },
          ]),
        }),
      });

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toBe('Mathematics');
    });
  });

  describe('PUT /api/subjects/:id', () => {
    it('should update subject details', async () => {
      const mockSubject = {
        _id: 'sub123',
        name: 'Mathematics',
        code: 'MATH101',
        teacherIds: [],
        save: jest.fn().mockResolvedValue({ _id: 'sub123', name: 'Math Advanced', code: 'MATH201', teacherIds: [] }),
      };
      (SubjectModel.findOne as jest.Mock).mockResolvedValue(mockSubject);

      const response = await request(app)
        .put('/api/subjects/sub123')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ name: 'Math Advanced', code: 'MATH201', teacherIds: [] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/subjects/:id', () => {
    it('should delete subject', async () => {
      (SubjectModel.findOne as jest.Mock).mockResolvedValue({
        _id: 'sub123',
        name: 'Mathematics',
        schoolId: 'school123',
      });
      (SubjectModel.deleteOne as jest.Mock).mockResolvedValue({});
      (UserModel.updateMany as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete('/api/subjects/sub123')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

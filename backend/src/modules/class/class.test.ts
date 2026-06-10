import request from 'supertest';
import app from '../../app';
import { ClassModel } from './class.model';
import { SectionModel } from './section.model';
import { generateToken } from '../../common/utils/jwt';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./class.model');
jest.mock('./section.model');

describe('Class Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const schoolAdminToken = generateToken({
    userId: 'schooladmin123',
    role: 'SCHOOL_ADMIN',
    schoolId: 'school123',
  });

  describe('POST /api/classes', () => {
    it('should create a new class and default sections', async () => {
      const mockClassSave = jest.fn().mockResolvedValue({
        _id: 'class123',
        name: 'Class 10',
        schoolId: 'school123',
      });
      (ClassModel as unknown as jest.Mock).mockImplementation(() => ({
        save: mockClassSave,
        toObject: () => ({ _id: 'class123', name: 'Class 10', schoolId: 'school123' }),
      }));

      const mockSectionSave = jest.fn().mockResolvedValue({
        _id: 'sec123',
        name: 'A',
        classId: 'class123',
        schoolId: 'school123',
      });
      (SectionModel as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSectionSave,
      }));

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ name: 'Class 10', sections: ['A', 'B'] });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Class 10');
    });
  });

  describe('GET /api/classes', () => {
    it('should list classes for school admin', async () => {
      (ClassModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: 'class123', name: 'Class 10', schoolId: 'school123', toObject: function() { return this; } },
        ]),
      });
      (SectionModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: 'sec123', name: 'A', classId: 'class123', schoolId: 'school123' },
        ]),
      });

      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toBe('Class 10');
      expect(response.body.data[0].sections[0].name).toBe('A');
    });
  });

  describe('PUT /api/classes/:id', () => {
    it('should update class name and sections', async () => {
      const mockClass = {
        _id: 'class123',
        name: 'Class 10',
        schoolId: 'school123',
        save: jest.fn().mockResolvedValue({}),
        toObject: function() { return this; },
      };
      (ClassModel.findOne as jest.Mock).mockResolvedValue(mockClass);
      const mockSections = [
        { _id: 'sec123', name: 'A', classId: 'class123', schoolId: 'school123' },
      ];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockSections),
        then: (resolve: any) => resolve(mockSections),
      };
      (SectionModel.find as jest.Mock).mockReturnValue(mockQuery);
      (SectionModel.deleteOne as jest.Mock).mockResolvedValue({});
      const mockSectionSave = jest.fn().mockResolvedValue({});
      (SectionModel as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSectionSave,
      }));

      const response = await request(app)
        .put('/api/classes/class123')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ name: 'Class 10 Updated', sections: ['B'] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/classes/:id', () => {
    it('should delete class and its sections', async () => {
      (ClassModel.findOne as jest.Mock).mockResolvedValue({
        _id: 'class123',
        name: 'Class 10',
        schoolId: 'school123',
      });
      (ClassModel.deleteOne as jest.Mock).mockResolvedValue({});
      (SectionModel.deleteMany as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete('/api/classes/class123')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

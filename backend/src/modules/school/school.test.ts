import request from 'supertest';
import app from '../../app';
import { SchoolModel } from './school.model';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./school.model');

describe('School Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/schools', () => {
    const validSchool = {
      name: 'Orchard Academy',
      code: 'ORCHARD-BANGALORE',
      subdomain: 'orchard-bangalore',
      address: '100 Orchard Rd, Bangalore',
      email: 'contact@orchard.edu.in',
      phone: '9876543210',
      state: '507f1f77bcf86cd799439011',
      district: '507f1f77bcf86cd799439012',
      city: '507f1f77bcf86cd799439014',
      subscriptionPlan: '507f1f77bcf86cd799439013',
    };

    it('should register a new school and return 201 with standardized response', async () => {
      // Mock unique checks (none exists)
      (SchoolModel.findOne as jest.Mock).mockResolvedValue(null);

      // Mock save prototype method
      const mockSavedDoc = {
        _id: 'school123',
        ...validSchool,
        maxStudents: 500,
        isActive: true,
        settings: {
          attendanceEnabled: true,
          onlineExamEnabled: false,
          aiAnalyticsEnabled: false,
          parentAppEnabled: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (SchoolModel.prototype.save as jest.Mock).mockResolvedValue(mockSavedDoc);

      const response = await request(app)
        .post('/api/schools')
        .send(validSchool);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', 'school123');
      expect(response.body.data.name).toBe('Orchard Academy');
      expect(response.body.data.city).toBe('507f1f77bcf86cd799439014');
    });

    it('should return 400 Validation Error if input is missing or malformed', async () => {
      const malformedSchool = {
        name: '', // Empty
        code: 'bad_code_lowercase', // must be uppercase
        subdomain: 'UPPERCASE_AND_BAD_CHARS!',
        email: 'invalid-email-address',
        phone: '123', // Too short
        state: 'not-an-object-id', // invalid format
        district: 'not-an-object-id', // invalid format
        city: 'not-an-object-id', // invalid format
        subscriptionPlan: 'not-an-object-id', // invalid format
      };

      const response = await request(app)
        .post('/api/schools')
        .send(malformedSchool);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation Error');
      expect(response.body.message).toContain('name');
      expect(response.body.message).toContain('city');
      expect(response.body.message).toContain('state');
      expect(response.body.message).toContain('district');
      expect(response.body.message).toContain('subscriptionPlan');
    });

    it('should return 400 Error if school code already exists', async () => {
      // Mock existing code check finding a record
      (SchoolModel.findOne as jest.Mock).mockResolvedValue({ _id: 'exists' });

      const response = await request(app)
        .post('/api/schools')
        .send(validSchool);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });
  });

  describe('GET /api/schools', () => {
    it('should return 200 with paginated array of schools', async () => {
      const mockSchools = [
        { name: 'School A', subdomain: 'schoola' },
        { name: 'School B', subdomain: 'schoolb' },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockSchools);
      const mockLimit = jest.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      (SchoolModel.find as jest.Mock).mockReturnValue({ skip: mockSkip });
      (SchoolModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const response = await request(app).get('/api/schools?page=1&limit=25');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });
});

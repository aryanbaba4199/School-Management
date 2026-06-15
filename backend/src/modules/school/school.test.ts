import request from 'supertest';
import app from '../../app';
import { SchoolModel } from './school.model';
import { generateToken } from '../../common/utils/jwt';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./school.model');
jest.mock('../user/user.service');
import { RegistrationDraftModel } from './draft.model';

jest.mock('./draft.model');

describe('School Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const superAdminToken = generateToken({
    userId: 'admin123',
    role: 'SUPER_ADMIN',
  });

  describe('Authentication Guards', () => {
    it('should return 401 if request is unauthenticated', async () => {
      const response = await request(app).get('/api/schools');
      expect(response.status).toBe(401);
    });

    it('should return 200 for non-SUPER_ADMIN on GET /api/schools', async () => {
      const teacherToken = generateToken({ userId: 't1', role: 'TEACHER', schoolId: 'school123' });
      
      // Mock the service call
      const mockPopulate = jest.fn().mockReturnThis();
      (SchoolModel.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
        then: jest.fn((resolve) => resolve({ _id: 'school123', name: 'My School' }))
      });

      const response = await request(app)
        .get('/api/schools')
        .set('Authorization', `Bearer ${teacherToken}`);
        
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/schools', () => {
    const validSchool = {
      adminName: 'Demo Admin',
      adminEmail: 'schooladmin@schoolos.com',
      adminPassword: 'password123',
      name: 'Orchard Academy',
      code: 'ORCHARD-BANGALORE',
      subdomain: 'orchard-bangalore',
      address: '100 Orchard Rd, Bangalore',
      email: 'contact@orchard.edu.in',
      phone: '9876543210',
      state: '507f1f77bcf86cd799439011',
      district: '507f1f77bcf86cd799439012',
      country: '507f1f77bcf86cd799439014',
      boardType: '507f1f77bcf86cd799439015',
      subscriptionPlan: '507f1f77bcf86cd799439013',
      billingCycle: 'MONTHLY' as const,
    };

    it('should register a new school', async () => {
      (SchoolModel.findOne as jest.Mock).mockResolvedValue(null);
      (SchoolModel.prototype.save as jest.Mock).mockResolvedValue({
        _id: 'school123',
        ...validSchool,
        isDeactive: false,
      });

      const response = await request(app)
        .post('/api/schools')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(validSchool);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Orchard Academy');
    });
  });
  describe('GET /api/schools/:id', () => {
    it('should return 403 if non-SUPER_ADMIN tries to fetch a different school ID', async () => {
      const teacherToken = generateToken({ userId: 't1', role: 'TEACHER', schoolId: 'school123' });
      const response = await request(app)
        .get('/api/schools/school999')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });

    it('should return 200 if non-SUPER_ADMIN fetches their own school ID', async () => {
      const teacherToken = generateToken({ userId: 't1', role: 'TEACHER', schoolId: 'school123' });
      const mockPopulate = jest.fn().mockReturnThis();
      (SchoolModel.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
        then: jest.fn((resolve) => resolve({ _id: 'school123', name: 'My School' }))
      });

      const response = await request(app)
        .get('/api/schools/school123')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('My School');
    });
  });

  describe('PUT /api/schools/:id', () => {
    it('should update school details', async () => {
      const mockSchool = {
        _id: 'school123',
        name: 'Old Name',
        save: jest.fn().mockResolvedValue({ _id: 'school123', name: 'New Name' }),
      };
      (SchoolModel.findById as jest.Mock).mockResolvedValue(mockSchool);

      const response = await request(app)
        .put('/api/schools/school123')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('New Name');
    });
  });

  describe('PATCH /api/schools/:id/deactivate', () => {
    it('should toggle deactivated status', async () => {
      const mockSchool = {
        _id: 'school123',
        isDeactive: false,
        save: jest.fn().mockResolvedValue({ _id: 'school123', isDeactive: true }),
      };
      (SchoolModel.findById as jest.Mock).mockResolvedValue(mockSchool);

      const response = await request(app)
        .patch('/api/schools/school123/deactivate')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isDeactive).toBe(true);
    });
  });

  describe('DELETE /api/schools/:id', () => {
    it('should fail if wrong passcode is provided', async () => {
      const response = await request(app)
        .delete('/api/schools/school123')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ passcode: '000000' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid master passcode');
    });

    it('should fail if school is not deactivated', async () => {
      (SchoolModel.findById as jest.Mock).mockResolvedValue({ _id: 'school123', isDeactive: false });

      const response = await request(app)
        .delete('/api/schools/school123')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ passcode: '727798' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Only deactivated schools can be deleted');
    });

    it('should delete school if deactivated and passcode is correct', async () => {
      (SchoolModel.findById as jest.Mock).mockResolvedValue({ _id: 'school123', isDeactive: true });
      (SchoolModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'school123' });

      const response = await request(app)
        .delete('/api/schools/school123')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ passcode: '727798' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Draft Endpoints', () => {
    it('should retrieve a draft by email', async () => {
      const mockDraft = { adminEmail: 'admin@test.com', schoolDetails: { name: 'Draft School' } };
      (RegistrationDraftModel.findOne as jest.Mock).mockResolvedValue(mockDraft);

      const response = await request(app)
        .get('/api/schools/drafts/admin@test.com')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.schoolDetails.name).toBe('Draft School');
    });

    it('should save a draft', async () => {
      const mockDraftData = { adminEmail: 'admin@test.com', currentStep: 2 };
      (RegistrationDraftModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockDraftData);

      const response = await request(app)
        .post('/api/schools/drafts')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(mockDraftData);

      expect(response.status).toBe(200);
      expect(response.body.data.currentStep).toBe(2);
    });
  });
});


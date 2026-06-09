import request from 'supertest';
import app from '../../app';
import { SchoolModel } from './school.model';
import { generateToken } from '../../common/utils/jwt';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./school.model');
jest.mock('../user/user.service');
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

    it('should return 403 if user is not SUPER_ADMIN', async () => {
      const teacherToken = generateToken({ userId: 't1', role: 'TEACHER' });
      const response = await request(app)
        .get('/api/schools')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(response.status).toBe(403);
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
      subscriptionPlan: '507f1f77bcf86cd799439013',
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
});

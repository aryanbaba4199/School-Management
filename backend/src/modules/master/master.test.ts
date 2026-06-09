import request from 'supertest';
import app from '../../app';
import { StateModel } from './models/state.model';
import { DistrictModel } from './models/district.model';
import { CityModel } from './models/city.model';
import { SubscriptionPlanModel } from './models/subscription-plan.model';
import { Types } from 'mongoose';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./models/state.model');
jest.mock('./models/district.model');
jest.mock('./models/city.model');
jest.mock('./models/subscription-plan.model');

describe('Master Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('States Routes', () => {
    it('should create State (POST /states)', async () => {
      (StateModel.findOne as jest.Mock).mockResolvedValue(null);
      (StateModel.prototype.save as jest.Mock).mockResolvedValue({ _id: 'state123', name: 'Karnataka', code: 'KA' });

      const response = await request(app).post('/api/masters/states').send({ name: 'Karnataka', code: 'KA' });
      expect(response.status).toBe(201);
      expect(response.body.data._id).toBe('state123');
    });

    it('should fetch all States (GET /states)', async () => {
      (StateModel.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockResolvedValue([{ name: 'Karnataka' }]) });
      const response = await request(app).get('/api/masters/states');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('Districts Routes', () => {
    it('should create District (POST /districts)', async () => {
      (StateModel.findById as jest.Mock).mockResolvedValue({ _id: 'state123' });
      (DistrictModel.findOne as jest.Mock).mockResolvedValue(null);
      (DistrictModel.prototype.save as jest.Mock).mockResolvedValue({ _id: 'dist123', name: 'Bengaluru' });

      const response = await request(app).post('/api/masters/districts').send({
        name: 'Bengaluru',
        stateId: '507f1f77bcf86cd799439011',
        code: 'BLR',
      });
      expect(response.status).toBe(201);
      expect(response.body.data._id).toBe('dist123');
    });
  });

  describe('Cities Routes', () => {
    it('should create City under District (POST /cities)', async () => {
      (DistrictModel.findById as jest.Mock).mockResolvedValue({ _id: 'dist123' });
      (CityModel.findOne as jest.Mock).mockResolvedValue(null);
      (CityModel.prototype.save as jest.Mock).mockResolvedValue({ _id: 'city123', name: 'Hebbal' });

      const response = await request(app).post('/api/masters/cities').send({
        name: 'Hebbal',
        districtId: '507f1f77bcf86cd799439012',
        code: 'HBL',
      });
      expect(response.status).toBe(201);
      expect(response.body.data._id).toBe('city123');
    });

    it('should get Cities list filtered by district (GET /cities)', async () => {
      (CityModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([{ name: 'Hebbal' }]),
        }),
      });

      const response = await request(app).get('/api/masters/cities?districtId=507f1f77bcf86cd799439012');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('Subscription Plans Routes', () => {
    it('should create Plan (POST /subscription-plans)', async () => {
      (SubscriptionPlanModel.findOne as jest.Mock).mockResolvedValue(null);
      (SubscriptionPlanModel.prototype.save as jest.Mock).mockResolvedValue({ _id: 'plan123', name: 'Basic' });

      const response = await request(app).post('/api/masters/subscription-plans').send({
        name: 'Basic',
        code: 'BASIC',
        price: 999,
      });
      expect(response.status).toBe(201);
    });
  });
});

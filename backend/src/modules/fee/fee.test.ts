import request from 'supertest';
import app from '../../app';
import { FeeInvoice } from './fee.model';
import { UserModel } from '../user/user.model';
import { SchoolModel } from '../school/school.model';
import { ClassModel } from '../class/class.model';
import { generateToken } from '../../common/utils/jwt';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./fee.model');
jest.mock('../user/user.model');
jest.mock('../school/school.model');
jest.mock('../class/class.model');

describe('Fee Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const schoolAdminToken = generateToken({
    userId: 'schooladmin123',
    role: 'SCHOOL_ADMIN',
    schoolId: 'school123',
  });

  const mockFeeDoc = {
    _id: 'fee123',
    studentId: 'student123',
    schoolId: 'school123',
    classId: 'class123',
    amount: 5000,
    type: 'ADMISSION',
    year: 2024,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue({}),
  };

  describe('GET /api/fees/student/:studentId', () => {
    it('should return 400 for invalid student ID', async () => {
      const response = await request(app)
        .get('/api/fees/student/invalid-id')
        .set('Authorization', `Bearer ${schoolAdminToken}`);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fetch fees for a student', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([mockFeeDoc]),
      };
      (FeeInvoice.find as jest.Mock).mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/api/fees/student/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].amount).toBe(5000);
    });
  });

  describe('GET /api/fees/transactions', () => {
    it('should fetch all transactions for the school admin', async () => {
      const mockPopulate2 = {
        sort: jest.fn().mockResolvedValue([mockFeeDoc]),
      };
      const mockPopulate1 = {
        populate: jest.fn().mockReturnValue(mockPopulate2),
      };
      const mockQuery = {
        populate: jest.fn().mockReturnValue(mockPopulate1),
      };
      (FeeInvoice.find as jest.Mock).mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/api/fees/transactions')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].type).toBe('ADMISSION');
    });
  });

  describe('POST /api/fees/generate', () => {
    it('should return 404 if student is not found', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      const response = await request(app)
        .post('/api/fees/generate')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ studentId: '507f1f77bcf86cd799439011' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should generate fees successfully', async () => {
      const mockStudent = {
        _id: '507f1f77bcf86cd799439011',
        role: { name: 'STUDENT' },
        feeCycle: 'MONTHLY',
        schoolId: { _id: 'school123', admissionFee: 1000 },
        classId: { _id: 'class123', monthlyFee: 500 },
      };

      (UserModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockStudent),
        }),
      });

      (FeeInvoice.findOne as jest.Mock).mockResolvedValue(null);
      (FeeInvoice.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/fees/generate')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ studentId: '507f1f77bcf86cd799439011' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(FeeInvoice.create).toHaveBeenCalledTimes(2); // Admission + Monthly
    });
  });

  describe('POST /api/fees/generate-bulk', () => {
    it('should bulk generate fees for all active students', async () => {
      const mockStudent = {
        _id: 'student123',
        role: { name: 'STUDENT' },
        feeCycle: 'MONTHLY',
        schoolId: { _id: 'school123', admissionFee: 1000 },
        classId: { _id: 'class123', monthlyFee: 500 },
      };

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([mockStudent]),
        }),
      };
      (UserModel.find as jest.Mock).mockReturnValue(mockQuery);
      (FeeInvoice.findOne as jest.Mock).mockResolvedValue(null);
      (FeeInvoice.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/fees/generate-bulk')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({ type: 'MONTHLY', month: 6, year: 2024 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(FeeInvoice.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/fees/:id/pay', () => {
    it('should mark fee as PAID', async () => {
      (FeeInvoice.findById as jest.Mock).mockResolvedValue({
        ...mockFeeDoc,
        status: 'PENDING',
        save: jest.fn().mockResolvedValue({}),
      });

      const response = await request(app)
        .put('/api/fees/507f1f77bcf86cd799439011/pay')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 if already paid', async () => {
      (FeeInvoice.findById as jest.Mock).mockResolvedValue({
        ...mockFeeDoc,
        status: 'PAID',
      });

      const response = await request(app)
        .put('/api/fees/507f1f77bcf86cd799439011/pay')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/fees/:id/mark-due', () => {
    it('should mark fee as PENDING', async () => {
      (FeeInvoice.findById as jest.Mock).mockResolvedValue({
        ...mockFeeDoc,
        status: 'PAID',
        save: jest.fn().mockResolvedValue({}),
      });

      const response = await request(app)
        .put('/api/fees/507f1f77bcf86cd799439011/mark-due')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/fees/cycle/:year/:month', () => {
    it('should fetch cycle details for the school admin', async () => {
      const mockPopulate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockFeeDoc]),
      });
      (FeeInvoice.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      const response = await request(app)
        .get('/api/fees/cycle/2024/6')
        .set('Authorization', `Bearer ${schoolAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].amount).toBe(5000);
    });
  });

  describe('POST /api/fees/pay-receipt', () => {
    it('should process money receipt and update wallet balance', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue({
        _id: 'student123',
        walletBal: 0,
        save: jest.fn().mockResolvedValue({}),
      });

      (FeeInvoice.find as jest.Mock).mockResolvedValue([
        { ...mockFeeDoc, _id: 'inv1', amount: 300, save: jest.fn().mockResolvedValue({}) },
        { ...mockFeeDoc, _id: 'inv2', amount: 300, save: jest.fn().mockResolvedValue({}) },
      ]);

      const response = await request(app)
        .post('/api/fees/pay-receipt')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({
          studentId: 'student123',
          invoiceIds: ['inv1', 'inv2'],
          paidAmount: 800,
          paymentMode: 'CASH',
          paymentMessage: 'Test Payment'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.walletAdded).toBe(200); // 800 - 600
      expect(response.body.data.paidInvoices).toBe(2);
    });

    it('should use existing wallet balance to pay for invoices', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue({
        _id: 'student123',
        walletBal: 300,
        save: jest.fn().mockResolvedValue({}),
      });

      (FeeInvoice.find as jest.Mock).mockResolvedValue([
        { ...mockFeeDoc, _id: 'inv1', amount: 500, save: jest.fn().mockResolvedValue({}) },
      ]);

      const response = await request(app)
        .post('/api/fees/pay-receipt')
        .set('Authorization', `Bearer ${schoolAdminToken}`)
        .send({
          studentId: 'student123',
          invoiceIds: ['inv1'],
          paidAmount: 200, // 200 + 300 (wallet) = 500
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.walletUsed).toBe(300); // wallet was 300, now 0
      expect(response.body.data.newWalletBal).toBe(0);
    });
  });
});

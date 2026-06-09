import request from 'supertest';
import app from '../../app';
import { UserModel } from './user.model';
import { hashPassword } from '../../common/utils/crypto';
import { generateToken } from '../../common/utils/jwt';

/*------------- Jest Mongoose Mocks -------------*/

jest.mock('./user.model');

describe('User Module API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const rawPassword = 'password123';
  const hashedPassword = hashPassword(rawPassword);

  const mockUserDbDoc = {
    _id: 'user123',
    name: 'Jane Doe',
    email: 'jane@orchard.edu.in',
    password: hashedPassword,
    userCode: 'SA-101',
    role: {
      name: 'SCHOOL_ADMIN',
      access: ['ALL'],
    },
    schoolId: '507f1f77bcf86cd799439011',
    phone: '9876543210',
    address: {
      street: '100 Orchard St',
      city: '507f1f77bcf86cd799439014',
      state: '507f1f77bcf86cd799439012',
      district: '507f1f77bcf86cd799439013',
      pincode: 560001,
    },
    isActive: true,
    childrenIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('POST /api/users/login', () => {
    it('should login successfully and return 200 with JWT token', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnValue({
          ...mockUserDbDoc,
          toObject: jest.fn().mockReturnValue(mockUserDbDoc),
        }),
      };
      (UserModel.findOne as jest.Mock).mockReturnValue(mockQueryChain);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'jane@orchard.edu.in',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.role.name).toBe('SCHOOL_ADMIN');
    });

    it('should return 400 for incorrect password credentials', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnValue({
          ...mockUserDbDoc,
          toObject: jest.fn().mockReturnValue(mockUserDbDoc),
        }),
      };
      (UserModel.findOne as jest.Mock).mockReturnValue(mockQueryChain);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'jane@orchard.edu.in',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should return 401 if request is unauthenticated', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'New User',
          email: 'new@orchard.edu.in',
          password: 'password123',
          userCode: 'T-202',
          role: { name: 'TEACHER', access: [] },
        });

      expect(response.status).toBe(401);
    });

    it('should allow SCHOOL_ADMIN to register a TEACHER with address details', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const savedTeacher = {
        _id: 'teacher123',
        name: 'John Smith',
        email: 'john@orchard.edu.in',
        userCode: 'T-202',
        role: { name: 'TEACHER', access: [] },
        schoolId: '507f1f77bcf86cd799439011',
        address: {
          street: '102 Orchard St',
          city: '507f1f77bcf86cd799439014',
          pincode: 560001,
        },
        isActive: true,
      };
      (UserModel.prototype.save as jest.Mock).mockResolvedValue({
        toObject: jest.fn().mockReturnValue(savedTeacher),
      });

      const token = generateToken({
        userId: 'user123',
        role: 'SCHOOL_ADMIN',
        schoolId: '507f1f77bcf86cd799439011',
      });

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Smith',
          email: 'john@orchard.edu.in',
          password: 'password123',
          userCode: 'T-202',
          role: { name: 'TEACHER', access: [] },
          schoolId: '507f1f77bcf86cd799439011',
          address: {
            street: '102 Orchard St',
            city: '507f1f77bcf86cd799439014',
            pincode: 560001,
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe('TEACHER');
    });

    it('should return 400 Validation Error if input is missing or malformed', async () => {
      const token = generateToken({
        userId: 'user123',
        role: 'SCHOOL_ADMIN',
        schoolId: '507f1f77bcf86cd799439011',
      });

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
          userCode: 'lowercase_code!',
          role: { name: 'INVALID_ROLE', access: [] },
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation Error');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return profile for authenticated user', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockResolvedValue(mockUserDbDoc),
                }),
              }),
            }),
          }),
        }),
      };
      (UserModel.findById as jest.Mock).mockReturnValue(mockQueryChain);

      const token = generateToken({
        userId: 'user123',
        role: 'SCHOOL_ADMIN',
        schoolId: '507f1f77bcf86cd799439011',
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Jane Doe');
    });
  });

  describe('GET /api/users', () => {
    it('should return paginated list of users filtered by schoolId', async () => {
      const mockUsers = [mockUserDbDoc];
      (UserModel.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                      populate: jest.fn().mockResolvedValue(mockUsers),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      });
      (UserModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const token = generateToken({
        userId: 'user123',
        role: 'SCHOOL_ADMIN',
        schoolId: '507f1f77bcf86cd799439011',
      });

      const response = await request(app)
        .get('/api/users?page=1&limit=25')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});

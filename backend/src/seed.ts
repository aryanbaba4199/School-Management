import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { UserModel } from './modules/user/user.model';
import { SchoolModel } from './modules/school/school.model';
import { SubscriptionPlanModel } from './modules/master/models/subscription-plan.model';
import { hashPassword } from './common/utils/crypto';

/*------------- Load Environment Configuration -------------*/
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database.');

    // 1. Seed Subscription Plan
    let plan = await SubscriptionPlanModel.findOne({ code: 'PRO' });
    if (!plan) {
      console.log('Seeding Pro Subscription Plan...');
      plan = new SubscriptionPlanModel({
        name: 'Pro Plan',
        code: 'PRO',
        price: 2499,
        maxStudents: 1000,
        features: {
          attendanceEnabled: true,
          onlineExamEnabled: true,
          aiAnalyticsEnabled: true,
          parentAppEnabled: true,
        },
        isActive: true,
      });
      await plan.save();
      console.log('Subscription Plan seeded.');
    }

    // 2. Seed Demo School
    let school = await SchoolModel.findOne({ code: 'DIS' });
    if (!school) {
      console.log('Seeding Demo School...');
      school = new SchoolModel({
        name: 'Demo International School',
        code: 'DIS',
        subdomain: 'demo',
        email: 'info@demoschool.com',
        phone: '9876543210',
        boardType: 'CBSE',
        subscriptionPlan: plan._id,
        maxStudents: 1000,
        isActive: true,
        settings: {
          attendanceEnabled: true,
          onlineExamEnabled: true,
          aiAnalyticsEnabled: true,
          parentAppEnabled: true,
        },
      });
      await school.save();
      console.log('Demo School seeded.');
    }

    // Helper to seed users
    const seedUser = async (userObj: {
      name: string;
      email: string;
      passwordPlain: string;
      userCode: string;
      role: { name: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'; access: string[] };
      schoolId?: mongoose.Types.ObjectId;
    }) => {
      const existing = await UserModel.findOne({ email: userObj.email.toLowerCase() });
      if (existing) {
        console.log(`User '${userObj.email}' already exists, skipping.`);
        return;
      }
      
      const user = new UserModel({
        name: userObj.name,
        email: userObj.email.toLowerCase(),
        password: hashPassword(userObj.passwordPlain),
        userCode: userObj.userCode.toUpperCase(),
        role: userObj.role,
        schoolId: userObj.schoolId,
        isActive: true,
      });
      await user.save();
      console.log(`Seeded user: ${userObj.email} (${userObj.role.name})`);
    };

    // 3. Seed Users for each role
    console.log('Seeding user accounts...');
    
    // Super Admin
    await seedUser({
      name: 'Aryan Dubey',
      email: 'aryan@schoolos.com',
      passwordPlain: 'admin123',
      userCode: 'SA-01',
      role: { name: 'SUPER_ADMIN', access: ['ALL'] },
    });

    const schoolObjectId = school._id as mongoose.Types.ObjectId;

    // School Admin
    await seedUser({
      name: 'Demo School Admin',
      email: 'admin@schoolos.com',
      passwordPlain: 'admin123',
      userCode: 'AD-01',
      role: { name: 'SCHOOL_ADMIN', access: ['SCHOOL_MANAGEMENT'] },
      schoolId: schoolObjectId,
    });

    // Teacher
    await seedUser({
      name: 'Demo Teacher',
      email: 'teacher@schoolos.com',
      passwordPlain: 'teacher123',
      userCode: 'T-01',
      role: { name: 'TEACHER', access: ['ATTENDANCE', 'EXAMS', 'HOMEWORKS'] },
      schoolId: schoolObjectId,
    });

    // Student
    await seedUser({
      name: 'Demo Student',
      email: 'student@schoolos.com',
      passwordPlain: 'student123',
      userCode: 'ST-01',
      role: { name: 'STUDENT', access: ['QUIZZES', 'REPORTS'] },
      schoolId: schoolObjectId,
    });

    // Parent
    await seedUser({
      name: 'Demo Parent',
      email: 'parent@schoolos.com',
      passwordPlain: 'parent123',
      userCode: 'PT-01',
      role: { name: 'PARENT', access: ['REPORTS', 'FEES'] },
      schoolId: schoolObjectId,
    });

    console.log('Database seeding process complete successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('An error occurred during database seeding:', error);
    process.exit(1);
  }
}

seedDatabase();

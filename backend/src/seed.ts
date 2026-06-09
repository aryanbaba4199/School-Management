import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { UserModel } from './modules/user/user.model';
import { hashPassword } from './common/utils/crypto';

/*------------- Load Environment Configuration -------------*/

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';

async function seedSuperAdmin() {
  try {
    console.log('Connecting to database...');
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database.');

    const email = 'aryan@schoolos.com';
    const existingAdmin = await UserModel.findOne({ email });

    if (existingAdmin) {
      console.log(`Super Admin with email '${email}' already exists in database.`);
      await mongoose.disconnect();
      return;
    }

    console.log('Super Admin not found. Seeding new Super Admin...');
    
    // Hash password 'admin123'
    const hashedPassword = hashPassword('admin123');

    const superAdmin = new UserModel({
      name: 'Aryan Dubey',
      email,
      password: hashedPassword,
      userCode: 'SA-01',
      role: {
        name: 'SUPER_ADMIN',
        access: ['ALL'],
      },
      isActive: true,
    });

    await superAdmin.save();
    console.log('Super Admin successfully seeded in the database!');
    console.log('Login credentials:');
    console.log(`- Email: ${email}`);
    console.log('- Password: admin123');
    console.log('- Role: SUPER_ADMIN');

    await mongoose.disconnect();
    console.log('Disconnected from database. Seeding process complete.');
  } catch (error) {
    console.error('An error occurred during database seeding:', error);
    process.exit(1);
  }
}

seedSuperAdmin();

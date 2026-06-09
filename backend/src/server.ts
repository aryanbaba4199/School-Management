import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

/*------------- Load Environment Config -------------*/
dotenv.config();

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';

/*------------- Database Connection & Startup -------------*/

async function startServer() {
  try {
    // Connect to MongoDB
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB Database.');

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections or exceptions outside Express
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

startServer();

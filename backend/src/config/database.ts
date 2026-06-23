import mongoose from 'mongoose';
import { config } from '../config';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

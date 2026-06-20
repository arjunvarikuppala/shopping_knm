import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');
    
    // Drop the old non-sparse index
    await mongoose.connection.collection('users').dropIndex('mobile_1');
    console.log('Successfully dropped old mobile_1 index');
    
  } catch(e: any) {
    console.log('Result:', e.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fix();

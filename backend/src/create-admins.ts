import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { UserRole } from './types';
import { hashPassword } from './utils/password';

dotenv.config();

async function createAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // 1. Remove any existing admin accounts to ensure we don't violate the max 2 admins rule
    const deleted = await User.deleteMany({ role: UserRole.ADMIN });
    console.log(`Deleted ${deleted.deletedCount} old admin accounts.`);

    // 2. Load passwords from environment variables
    const sanjanaPasswordStr = process.env.ADMIN_PASSWORD_1;
    const nethaPasswordStr = process.env.ADMIN_PASSWORD_2;
    const sanjanaEmail = process.env.ADMIN_EMAIL_1;
    const nethaEmail = process.env.ADMIN_EMAIL_2;

    if (!sanjanaPasswordStr || !nethaPasswordStr || !sanjanaEmail || !nethaEmail) {
      throw new Error('Admin credentials not fully set in environment variables');
    }

    // 3. Hash passwords
    const sanjanaPassword = await hashPassword(sanjanaPasswordStr);
    const nethaPassword = await hashPassword(nethaPasswordStr);

    // 4. Create new admin accounts
    const sanjana = await User.create({
      name: 'Sanjana',
      email: sanjanaEmail,
      password: sanjanaPassword,
      role: UserRole.ADMIN,
    });
    console.log(`Admin created: ${sanjana.email}`);

    const netha = await User.create({
      name: 'Netha',
      email: nethaEmail,
      password: nethaPassword,
      role: UserRole.ADMIN,
    });
    console.log(`Admin created: ${netha.email}`);

  } catch (error) {
    console.error('Error creating admins:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmins();

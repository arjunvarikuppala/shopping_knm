import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  isBlocked: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true },
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'USA' },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const { password, refreshToken, resetPasswordToken, resetPasswordExpires, __v, ...rest } =
          ret as Record<string, unknown>;
        void password;
        void refreshToken;
        void resetPasswordToken;
        void resetPasswordExpires;
        void __v;
        return rest;
      },
    },
  },
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (this.isModified('role') && this.role === UserRole.ADMIN) {
    const adminCount = await mongoose.model('User').countDocuments({ role: UserRole.ADMIN });
    // If the count is >= 2 and this document is new, or if this is an existing non-admin document becoming an admin
    if (adminCount >= 2) {
      return next(new Error('Cannot create more than 2 admin accounts'));
    }
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);

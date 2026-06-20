import { User, IAddress } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../utils/errors';
import { UserRole } from '../types';

export class UserService {
  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await User.findOne({ email: data.email, _id: { $ne: userId } });
      if (existing) throw new ConflictError('Email already in use');
    }

    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedError('Current password is incorrect');

    user.password = await hashPassword(newPassword);
    user.refreshToken = undefined;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async addAddress(userId: string, address: Omit<IAddress, '_id'>) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (address.isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    if (user.addresses.length === 0) {
      address.isDefault = true;
    }

    user.addresses.push(address);
    await user.save();
    return user;
  }

  async updateAddress(userId: string, addressId: string, address: Partial<IAddress>) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const addr = user.addresses.find((a) => a._id?.toString() === addressId);
    if (!addr) throw new NotFoundError('Address not found');

    if (address.isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    Object.assign(addr, address);
    await user.save();
    return user;
  }

  async deleteAddress(userId: string, addressId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const addrIndex = user.addresses.findIndex((a) => a._id?.toString() === addressId);
    if (addrIndex === -1) throw new NotFoundError('Address not found');

    const wasDefault = user.addresses[addrIndex].isDefault;
    user.addresses.splice(addrIndex, 1);
    await user.save();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
      await user.save();
    }

    return user;
  }

  async getAllCustomers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({ role: UserRole.CUSTOMER })
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: UserRole.CUSTOMER }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleBlockUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestError('Cannot block admin users');
    }

    user.isBlocked = !user.isBlocked;
    if (user.isBlocked) {
      user.refreshToken = undefined;
    }
    await user.save();
    return user;
  }
}

export const userService = new UserService();

import { User, Otp } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAuthTokens,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
} from '../utils/jwt';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors';
import { UserRole, JwtPayload } from '../types';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email';
import { generateOTP } from '../utils/otp';

export class AuthService {
  async register(name: string, email: string, mobile: string | undefined, password: string) {
    const query: any = [{ email }];
    if (mobile) query.push({ mobile });

    const existingUser = await User.findOne({
      $or: query,
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email already registered');
      }
      if (mobile && existingUser.mobile === mobile) {
        throw new ConflictError('Mobile number already registered');
      }
    }

    const otp = generateOTP();
    
    // Upsert the OTP document
    await Otp.findOneAndDelete({ email });
    await Otp.create({ email, otp });

    await sendVerificationEmail(email, otp);

    return { 
      message: 'Verification OTP sent to email',
      requiresOtp: true,
      email
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.isBlocked) {
      throw new UnauthorizedError('Your account has been blocked');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = generateAuthTokens(payload);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    user.password = undefined as unknown as string;
    return { user, tokens };
  }

  async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (user.isBlocked) {
      throw new UnauthorizedError('Your account has been blocked');
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = generateAuthTokens(payload);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await sendPasswordResetEmail(email, resetToken);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!verifyResetToken(token)) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }

  async verifyOtp(name: string, email: string, mobile: string | undefined, password: string, otp: string) {
    const otpRecord = await Otp.findOne({ email });
    
    if (!otpRecord) {
      throw new BadRequestError('OTP expired or not found. Please resend OTP.');
    }

    if (otpRecord.otp !== otp) {
      throw new BadRequestError('Invalid OTP');
    }

    // Double check user doesn't exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // OTP is valid, create the user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      ...(mobile && { mobile }),
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    // Delete the OTP record
    await Otp.findByIdAndDelete(otpRecord._id);

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = generateAuthTokens(payload);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    user.password = undefined as unknown as string;
    return { user, tokens };
  }

  async resendOtp(email: string) {
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return { message: 'Email is already registered. Please login.' };
    }

    const otp = generateOTP();
    
    // Upsert the OTP document
    await Otp.findOneAndDelete({ email });
    await Otp.create({ email, otp });

    await sendVerificationEmail(email, otp);
    
    return { message: 'A new OTP has been sent to your email' };
  }
}

export const authService = new AuthService();

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { sendSuccess, sendCreated } from '../utils/response';
import { config } from '../config';

const setTokenCookies = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearTokenCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

export class AuthController {
  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, mobile, password } = req.body;
      const result = await authService.sendOtp(name, email, mobile, password);
      sendSuccess(res, result, 'Verification OTP sent');
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      setTokenCookies(res, result.tokens);
      sendSuccess(res, { user: result.user }, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { credential } = req.body;
      const result = await authService.googleLogin(credential);
      setTokenCookies(res, result.tokens);
      sendSuccess(res, { user: result.user }, 'Google login successful');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Refresh token not found' });
        return;
      }
      const tokens = await authService.refreshToken(refreshToken);
      setTokenCookies(res, tokens);
      sendSuccess(res, {}, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.logout(req.user!.userId);
      clearTokenCookies(res);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, mobile, password, otp } = req.body;
      const result = await authService.verifyOtp(name, email, mobile, password, otp);
      setTokenCookies(res, result.tokens);
      sendSuccess(res, { user: result.user }, 'Email verified and login successful');
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.resendOtp(req.body.email);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();

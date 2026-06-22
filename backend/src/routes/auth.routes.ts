import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validators';

const router = Router();

router.post('/send-otp', authLimiter, validate(registerValidation), authController.sendOtp);
router.post('/login', authLimiter, validate(loginValidation), authController.login);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/resend-otp', authLimiter, authController.resendOtp);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordValidation),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordValidation),
  authController.resetPassword,
);

export default router;

import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

  if (!config.smtp.user) {
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'Kalanikethan (KNM) - Password Reset',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

export const sendVerificationEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  if (!config.smtp.user) {
    console.log(`Email Verification OTP for ${email}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'Kalanikethan Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #e11d48; text-align: center; margin-bottom: 20px;">Kalanikethan (KNM)</h2>
        <h3 style="color: #374151; text-align: center;">Email Verification</h3>
        <p style="color: #4b5563; font-size: 16px;">Thank you for registering! Please use the following One-Time Password (OTP) to verify your email address and complete your registration:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; font-size: 36px; color: #e11d48; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #dc2626; font-size: 14px; font-weight: bold; text-align: center;">This OTP expires in 5 minutes.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If you didn't request this, please ignore this email or contact support if you have concerns.</p>
      </div>
    `,
  });
};

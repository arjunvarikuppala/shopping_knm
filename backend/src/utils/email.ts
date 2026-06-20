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
    subject: 'Kalanikethan (KNM) - Verify your email',
    html: `
      <h2>Email Verification</h2>
      <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
      <h1 style="letter-spacing: 5px; font-size: 32px; color: #e11d48;">${otp}</h1>
      <p>This OTP expires in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { AuthTokens, JwtPayload } from '../types';

const accessSignOptions: SignOptions = {
  expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'],
};

const refreshSignOptions: SignOptions = {
  expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
};

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, accessSignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, refreshSignOptions);
};

export const generateAuthTokens = (payload: JwtPayload): AuthTokens => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};

export const generateResetToken = (): string => {
  return jwt.sign({ type: 'reset' }, config.jwt.accessSecret, { expiresIn: '1h' });
};

export const verifyResetToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as { type: string };
    return decoded.type === 'reset';
  } catch {
    return false;
  }
};

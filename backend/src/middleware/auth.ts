import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole, JwtPayload } from '../types';
import { User } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token = '';
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId).select('isBlocked role email');
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    if (user.isBlocked) {
      throw new ForbiddenError('Your account has been blocked');
    }

    if (user.role === UserRole.ADMIN) {
      const allowedEmails = [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2];
      if (!allowedEmails.includes(user.email)) {
        throw new ForbiddenError('Unauthorized admin account');
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
      return;
    }
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};

export const customerOnly = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  if (req.user && req.user.role === UserRole.ADMIN) {
    next(new ForbiddenError('Administrator accounts cannot perform customer actions.'));
    return;
  }
  next();
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      req.user = verifyAccessToken(token);
    }
  } catch {
    // Optional auth - ignore invalid tokens
  }
  next();
};

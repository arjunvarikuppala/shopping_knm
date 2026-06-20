import { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import { sendSuccess } from '../utils/response';
import { getParamId } from '../utils/params';

export class UserController {
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.getProfile(req.user!.userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(
        req.user!.userId,
        currentPassword,
        newPassword,
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  addAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.addAddress(req.user!.userId, req.body);
      sendSuccess(res, user, 'Address added');
    } catch (error) {
      next(error);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.updateAddress(req.user!.userId, getParamId(req.params.id), req.body);
      sendSuccess(res, user, 'Address updated');
    } catch (error) {
      next(error);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.deleteAddress(req.user!.userId, getParamId(req.params.id));
      sendSuccess(res, user, 'Address deleted');
    } catch (error) {
      next(error);
    }
  };

  getAllCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await userService.getAllCustomers(page, limit);
      sendSuccess(res, result.users, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleBlockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.toggleBlockUser(getParamId(req.params.id));
      sendSuccess(res, user, user.isBlocked ? 'User blocked' : 'User unblocked');
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();

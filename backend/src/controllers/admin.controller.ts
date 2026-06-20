import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services';
import { sendSuccess } from '../utils/response';

export class AdminController {
  getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();

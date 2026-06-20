import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services';
import { sendSuccess, sendCreated } from '../utils/response';
import { getParamId } from '../utils/params';
import { OrderStatus, UserRole } from '../types';

export class OrderController {
  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await orderService.createOrder({
        userId: req.user!.userId,
        ...req.body,
      });
      sendCreated(res, order, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  };

  getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await orderService.getMyOrders(req.user!.userId, page, limit);
      sendSuccess(res, result.orders, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const order = await orderService.getOrderById(getParamId(req.params.id), req.user!.userId, isAdmin);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  };

  getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as OrderStatus | undefined;
      const result = await orderService.getAllOrders(page, limit, status);
      sendSuccess(res, result.orders, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await orderService.updateOrderStatus(getParamId(req.params.id), req.body);
      sendSuccess(res, order, 'Order updated');
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await orderService.cancelOrder(getParamId(req.params.id), req.user!.userId);
      sendSuccess(res, order, 'Order cancelled');
    } catch (error) {
      next(error);
    }
  };
}

export const orderController = new OrderController();

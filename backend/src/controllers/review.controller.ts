import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services';
import { sendSuccess, sendCreated } from '../utils/response';
import { getParamId } from '../utils/params';
import { UserRole } from '../types';

export class ReviewController {
  getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await reviewService.getProductReviews(getParamId(req.params.productId), page, limit);
      sendSuccess(res, result.reviews, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  };

  createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, rating, comment } = req.body;
      const review = await reviewService.createReview(
        req.user!.userId,
        productId,
        rating,
        comment,
      );
      sendCreated(res, review, 'Review submitted');
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await reviewService.deleteReview(getParamId(req.params.id), req.user!.userId, isAdmin);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const reviewController = new ReviewController();

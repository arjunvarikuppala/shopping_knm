import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services';
import { sendSuccess, sendCreated } from '../utils/response';
import { getParamId } from '../utils/params';
import { AppError } from '../utils/errors';

export class ReviewController {
  getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const result = await reviewService.getReviews(page, limit);
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
      const { name, rating, comment, productId } = req.body;
      const review = await reviewService.createReview(
        req.user!.userId,
        rating,
        comment,
        name,
        productId
      );
      sendCreated(res, review, 'Thank you for your feedback!');
    } catch (error: any) {
      if (!(error instanceof AppError) && error.name !== 'ValidationError' && error.name !== 'CastError' && error.code !== 11000) {
        next(new AppError('Unable to save review. Please try again.', 500));
      } else {
        next(error);
      }
    }
  };

  deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await reviewService.deleteReview(getParamId(req.params.id));
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const reviewController = new ReviewController();

import { Request, Response, NextFunction } from 'express';
import { storeReviewService } from '../services';
import { sendSuccess, sendCreated } from '../utils/response';
import { getParamId } from '../utils/params';

export class StoreReviewController {
  getStoreReviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviews = await storeReviewService.getStoreReviews();
      sendSuccess(res, reviews);
    } catch (error) {
      next(error);
    }
  };

  createStoreReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, rating, message } = req.body;
      const review = await storeReviewService.createStoreReview(
        req.user!.userId,
        name,
        rating,
        message,
      );
      sendCreated(res, review, 'Feedback submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteStoreReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await storeReviewService.deleteStoreReview(getParamId(req.params.id));
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const storeReviewController = new StoreReviewController();

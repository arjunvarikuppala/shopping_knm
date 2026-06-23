import { Router, Request, Response, NextFunction } from 'express';
import { reviewController } from '../controllers/review.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize, customerOnly } from '../middleware/auth';
import { reviewValidation, mongoIdParam } from '../validators';
import { UserRole } from '../types';
import { AppError } from '../utils/errors';

const router = Router();

router.get('/', reviewController.getReviews);
router.get('/product/:productId', validate(mongoIdParam), reviewController.getProductReviews);

router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    authenticate(req, res, (err: any) => {
      if (err && err.statusCode === 401) {
        return next(new AppError('Please login to submit feedback.', 401));
      }
      next(err);
    });
  },
  (req: Request, res: Response, next: NextFunction) => {
    customerOnly(req, res, (err: any) => {
      if (err && err.statusCode === 403) {
        return next(new AppError('Administrators cannot submit reviews.', 403));
      }
      next(err);
    });
  },
  validate(reviewValidation),
  reviewController.createReview,
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(mongoIdParam),
  reviewController.deleteReview,
);

router.use((_req, _res, next) => {
  next(new AppError('Review route not found.', 404));
});

export default router;

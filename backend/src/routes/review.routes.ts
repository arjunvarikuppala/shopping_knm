import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { reviewValidation, mongoIdParam } from '../validators';
import { param } from 'express-validator';

const router = Router();

router.get(
  '/product/:productId',
  validate([param('productId').isMongoId().withMessage('Invalid product ID')]),
  reviewController.getProductReviews,
);

router.post('/', authenticate, validate(reviewValidation), reviewController.createReview);
router.delete('/:id', authenticate, validate(mongoIdParam), reviewController.deleteReview);

export default router;

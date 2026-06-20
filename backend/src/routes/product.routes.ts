import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { productValidation, mongoIdParam, productQueryValidation } from '../validators';
import { UserRole } from '../types';
import { body } from 'express-validator';

const router = Router();

router.get('/featured', productController.getFeatured);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/', validate(productQueryValidation), productController.getProducts);
router.get('/:id', validate(mongoIdParam), productController.getProductById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productValidation),
  productController.createProduct,
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([...mongoIdParam, ...productValidation]),
  productController.updateProduct,
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(mongoIdParam),
  productController.deleteProduct,
);
router.patch(
  '/:id/stock',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    ...mongoIdParam,
    body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  ]),
  productController.updateStock,
);

export default router;

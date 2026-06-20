import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { categoryValidation, mongoIdParam } from '../validators';
import { UserRole } from '../types';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:id', validate(mongoIdParam), categoryController.getCategoryById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(categoryValidation),
  categoryController.createCategory,
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([...mongoIdParam, ...categoryValidation]),
  categoryController.updateCategory,
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(mongoIdParam),
  categoryController.deleteCategory,
);

export default router;

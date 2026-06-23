import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize, customerOnly } from '../middleware/auth';
import { orderValidation, mongoIdParam, updateOrderStatusValidation } from '../validators';
import { UserRole } from '../types';

const router = Router();

router.post(
  '/',
  authenticate,
  customerOnly,
  validate(orderValidation),
  orderController.createOrder
);
router.get('/my', authenticate, customerOnly, orderController.getMyOrders);
router.get('/', authenticate, authorize(UserRole.ADMIN), orderController.getAllOrders);
router.get('/:id', authenticate, validate(mongoIdParam), orderController.getOrderById);
router.patch('/:id/cancel', authenticate, validate(mongoIdParam), orderController.cancelOrder);
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([...mongoIdParam, ...updateOrderStatusValidation]),
  orderController.updateOrderStatus,
);

export default router;

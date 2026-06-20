import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { orderValidation, mongoIdParam, updateOrderStatusValidation } from '../validators';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post('/', validate(orderValidation), orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/', authorize(UserRole.ADMIN), orderController.getAllOrders);
router.get('/:id', validate(mongoIdParam), orderController.getOrderById);
router.patch('/:id/cancel', validate(mongoIdParam), orderController.cancelOrder);
router.patch(
  '/:id/status',
  authorize(UserRole.ADMIN),
  validate([...mongoIdParam, ...updateOrderStatusValidation]),
  orderController.updateOrderStatus,
);

export default router;

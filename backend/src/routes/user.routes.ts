import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  updateProfileValidation,
  changePasswordValidation,
  addressValidation,
  mongoIdParam,
} from '../validators';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileValidation), userController.updateProfile);
router.put(
  '/change-password',
  validate(changePasswordValidation),
  userController.changePassword,
);

router.post('/addresses', validate(addressValidation), userController.addAddress);
router.put(
  '/addresses/:id',
  validate([...mongoIdParam, ...addressValidation]),
  userController.updateAddress,
);
router.delete('/addresses/:id', validate(mongoIdParam), userController.deleteAddress);

router.get('/customers', authorize(UserRole.ADMIN), userController.getAllCustomers);
router.patch(
  '/customers/:id/toggle-block',
  authorize(UserRole.ADMIN),
  validate(mongoIdParam),
  userController.toggleBlockUser,
);

export default router;

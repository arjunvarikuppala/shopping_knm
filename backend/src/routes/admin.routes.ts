import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/dashboard', adminController.getDashboard);

export default router;

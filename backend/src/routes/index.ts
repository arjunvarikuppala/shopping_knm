import { Router } from 'express';
import { authenticate, customerOnly } from '../middleware/auth';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Kalanikethan (KNM) API is running' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

// Catch-all for missing frontend api routes that need admin protection
router.post(['/cart', '/wishlist'], authenticate, customerOnly, (req, res) => {
  res.status(200).json({ success: true, message: 'Success' });
});

export default router;

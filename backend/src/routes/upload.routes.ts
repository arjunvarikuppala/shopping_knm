import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { upload } from '../middleware/upload';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Only authenticated admins can upload images
router.use(authenticate, authorize(UserRole.ADMIN));

router.post('/image', upload.single('image'), uploadController.uploadImage);
router.post('/images', upload.array('images', 10), uploadController.uploadMultipleImages);

export default router;

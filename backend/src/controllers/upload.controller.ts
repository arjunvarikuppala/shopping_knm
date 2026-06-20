import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class UploadController {
  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('No image file provided');
      }

      // Multer-storage-cloudinary automatically uploads the file and attaches the details to req.file
      const imageUrl = req.file.path;
      
      sendSuccess(res, { url: imageUrl }, 'Image uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  uploadMultipleImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new BadRequestError('No image files provided');
      }

      const imageUrls = req.files.map((file) => file.path);
      
      sendSuccess(res, { urls: imageUrls }, 'Images uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();

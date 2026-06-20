import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services';
import { sendSuccess, sendCreated } from '../utils/response';
import { getParamId } from '../utils/params';

export class CategoryController {
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const includeInactive = req.query.all === 'true';
      const categories = await categoryService.getAllCategories(includeInactive);
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await categoryService.getCategoryById(getParamId(req.params.id));
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await categoryService.createCategory(req.body);
      sendCreated(res, category, 'Category created');
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await categoryService.updateCategory(getParamId(req.params.id), req.body);
      sendSuccess(res, category, 'Category updated');
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await categoryService.deleteCategory(getParamId(req.params.id));
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const categoryController = new CategoryController();

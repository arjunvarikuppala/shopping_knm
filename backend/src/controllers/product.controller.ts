import { Request, Response, NextFunction } from 'express';
import { productService } from '../services';
import { sendSuccess, sendCreated } from '../utils/response';
import { getParamId } from '../utils/params';
import { ProductFilters } from '../types';

export class ProductController {
  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ProductFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 12,
        search: req.query.search as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sort: req.query.sort as ProductFilters['sort'],
        featured: req.query.featured === 'true' ? true : undefined,
      };

      const result = await productService.getProducts(filters);
      sendSuccess(res, result.products, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  };

  getFeatured = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await productService.getFeaturedProducts();
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  };

  getNewArrivals = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await productService.getNewArrivals();
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await productService.getProductById(getParamId(req.params.id));
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await productService.createProduct(req.body);
      sendCreated(res, product, 'Product created');
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await productService.updateProduct(getParamId(req.params.id), req.body);
      sendSuccess(res, product, 'Product updated');
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await productService.deleteProduct(getParamId(req.params.id));
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  updateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await productService.updateStock(getParamId(req.params.id), req.body.stock);
      sendSuccess(res, product, 'Stock updated');
    } catch (error) {
      next(error);
    }
  };
}

export const productController = new ProductController();

import { Product, Category } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { ProductFilters } from '../types';
import { FilterQuery } from 'mongoose';
import { IProduct } from '../models/Product';

export class ProductService {
  async getProducts(filters: ProductFilters) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      sort = 'newest',
      featured,
      fabric,
      color,
      occasion,
    } = filters;

    const query: FilterQuery<IProduct> = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      const cat = await Category.findOne({
        $or: [{ slug: category }, { _id: category }],
      });
      if (cat) query.category = cat._id;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (featured !== undefined) {
      query.isFeatured = featured;
    }

    if (fabric) {
      query.fabric = new RegExp(`^${fabric}$`, 'i');
    }

    if (color) {
      query.color = new RegExp(`^${color}$`, 'i');
    }

    if (occasion) {
      query.occasion = new RegExp(`^${occasion}$`, 'i');
    }

    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };

    const skip = (page - 1) * limit;
    const sortKey = sort || 'newest';
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions[sortKey] || sortOptions.newest)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string) {
    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async createProduct(data: Partial<IProduct>) {
    const category = await Category.findById(data.category);
    if (!category) throw new BadRequestError('Invalid category');

    return Product.create(data);
  }

  async updateProduct(id: string, data: Partial<IProduct>) {
    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) throw new BadRequestError('Invalid category');
    }

    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!product) throw new NotFoundError('Product not found');
    return product;
  }

  async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new NotFoundError('Product not found');
    return { message: 'Product deleted successfully' };
  }

  async updateStock(id: string, quantity: number) {
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    product.stock = quantity;
    await product.save();
    return product;
  }

  async getFeaturedProducts(limit = 8) {
    return Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getNewArrivals(limit = 8) {
    return Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export const productService = new ProductService();

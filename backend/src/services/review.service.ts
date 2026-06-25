import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { OrderStatus } from '../types';
import mongoose from 'mongoose';

export class ReviewService {
  async getReviews(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar'),
      Review.countDocuments(),
    ]);

    return {
      reviews,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar'),
      Review.countDocuments({ productId }),
    ]);

    return {
      reviews,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createReview(userId: string, rating: number, comment: string, name?: string, productId?: string) {
    if (productId) {
      const hasPurchased = await Order.findOne({
        userId,
        'products.productId': productId,
        orderStatus: OrderStatus.DELIVERED,
      });

      if (!hasPurchased) {
        throw new BadRequestError('You can only review products you have purchased and received');
      }

      const existing = await Review.findOne({ userId, productId });
      if (existing) {
        throw new BadRequestError('You have already reviewed this product');
      }
    }

    const review = await Review.create({
      userId,
      name,
      productId,
      rating,
      comment,
    });

    return review;
  }

  async deleteReview(reviewId: string) {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    return { message: 'Review deleted successfully' };
  }
}

export const reviewService = new ReviewService();

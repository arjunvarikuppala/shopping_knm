import { Review, Product } from '../models';
import { NotFoundError, ConflictError } from '../utils/errors';

export class ReviewService {
  async getProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ productId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ productId }),
    ]);

    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createReview(userId: string, productId: string, rating: number, comment: string) {
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    const existing = await Review.findOne({ userId, productId });
    if (existing) throw new ConflictError('You have already reviewed this product');

    const review = await Review.create({ userId, productId, rating, comment });

    const stats = await Review.aggregate([
      { $match: { productId: product._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      product.rating = Math.round(stats[0].avgRating * 10) / 10;
      product.reviewCount = stats[0].count;
      await product.save();
    }

    return review.populate('userId', 'name');
  }

  async deleteReview(reviewId: string, userId: string, isAdmin = false) {
    const review = await Review.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    if (!isAdmin && review.userId.toString() !== userId) {
      throw new NotFoundError('Review not found');
    }

    const productId = review.productId;
    await review.deleteOne();

    const stats = await Review.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const product = await Product.findById(productId);
    if (product) {
      product.rating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
      product.reviewCount = stats.length > 0 ? stats[0].count : 0;
      await product.save();
    }

    return { message: 'Review deleted successfully' };
  }
}

export const reviewService = new ReviewService();

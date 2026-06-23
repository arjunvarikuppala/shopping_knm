import { StoreReview } from '../models/StoreReview';
import { NotFoundError } from '../utils/errors';

export class StoreReviewService {
  async getStoreReviews() {
    return await StoreReview.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name avatar');
  }

  async createStoreReview(userId: string, name: string, rating: number, message: string) {
    const review = await StoreReview.create({
      userId,
      name,
      rating,
      message,
    });
    return review;
  }

  async deleteStoreReview(id: string) {
    const review = await StoreReview.findByIdAndDelete(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }
    return { message: 'Review deleted successfully' };
  }
}

export const storeReviewService = new StoreReviewService();

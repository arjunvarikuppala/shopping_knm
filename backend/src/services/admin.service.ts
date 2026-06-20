import { User, Order, Product } from '../models';
import { PaymentStatus, UserRole } from '../types';

export class AdminService {
  async getDashboardStats() {
    const [totalUsers, totalOrders, totalProducts, revenueResult, recentOrders] =
      await Promise.all([
        User.countDocuments({ role: UserRole.CUSTOMER }),
        Order.countDocuments(),
        Product.countDocuments(),
        Order.aggregate([
          { $match: { paymentStatus: PaymentStatus.PAID } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.find()
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    return {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: revenueResult[0]?.total || 0,
      recentOrders,
    };
  }
}

export const adminService = new AdminService();

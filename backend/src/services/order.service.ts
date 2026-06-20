import { Order, Product, User } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { OrderStatus, PaymentStatus } from '../types';
import { IOrder } from '../models/Order';

interface CreateOrderInput {
  userId: string;
  products: { productId: string; quantity: number }[];
  shippingAddress: IOrder['shippingAddress'];
  paymentMethod: string;
  notes?: string;
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const orderProducts = [];
    let totalAmount = 0;

    for (const item of input.products) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        throw new BadRequestError(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for ${product.title}`);
      }

      orderProducts.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || '',
      });

      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

    const order = await Order.create({
      userId: input.userId,
      products: orderProducts,
      totalAmount,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      paymentStatus:
        input.paymentMethod === 'cod' ? PaymentStatus.PENDING : PaymentStatus.PAID,
      orderStatus: OrderStatus.PENDING,
      estimatedDeliveryDate,
    });

    return order.populate('userId', 'name email');
  }

  async getMyOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ userId }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrderById(orderId: string, userId?: string, isAdmin = false) {
    const order = await Order.findById(orderId).populate('userId', 'name email');
    if (!order) throw new NotFoundError('Order not found');

    if (!isAdmin && order.userId._id.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return order;
  }

  async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
    const query = status ? { orderStatus: status } : {};
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(
    orderId: string,
    data: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
      trackingNumber?: string;
    },
  ) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (data.orderStatus === OrderStatus.CANCELLED && order.orderStatus !== OrderStatus.CANCELLED) {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    if (data.orderStatus) order.orderStatus = data.orderStatus;
    if (data.paymentStatus) order.paymentStatus = data.paymentStatus;
    if (data.trackingNumber) order.trackingNumber = data.trackingNumber;

    await order.save();
    return order.populate('userId', 'name email');
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (order.userId.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.orderStatus)) {
      throw new BadRequestError('Cannot cancel shipped or delivered orders');
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestError('Order already cancelled');
    }

    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = OrderStatus.CANCELLED;
    await order.save();
    return order;
  }
}

export const orderService = new OrderService();

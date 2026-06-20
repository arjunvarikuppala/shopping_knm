import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '@/services';
import { Order } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor } from '@/utils';
import Spinner from '@/components/ui/Spinner';
import ProtectedRoute from '@/routes/ProtectedRoute';

function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders().then((res) => {
      setOrders(res.data.data as Order[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div className="container-app py-8">
      <h1 className="mb-8 text-3xl font-bold">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">No orders yet</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card block p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getOrderStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <span className="font-semibold text-accent">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">
                {order.products.length} item{order.products.length > 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersList />
    </ProtectedRoute>
  );
}

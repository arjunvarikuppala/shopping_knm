import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { Order } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor } from '@/utils';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/routes/ProtectedRoute';

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderApi.getById(id).then((res) => {
      setOrder(res.data.data as Order);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!id || !confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await orderApi.cancel(id);
      setOrder(data.data as Order);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;
  if (!order) return <div className="container-app py-16 text-center">Order not found</div>;

  const canCancel = !['shipped', 'delivered', 'cancelled'].includes(order.orderStatus);

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="container-app py-8">
      <Link to="/orders" className="mb-4 inline-block text-sm text-accent hover:underline">
        ← Back to Orders
      </Link>
      <h1 className="mb-2 text-3xl font-bold">
        Order #{order._id.slice(-8).toUpperCase()}
      </h1>
      <p className="text-muted">Placed on {formatDate(order.createdAt)}</p>
      {order.estimatedDeliveryDate && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
        <p className="text-accent font-medium mt-1">
          Estimated Delivery: {formatDate(order.estimatedDeliveryDate)}
        </p>
      )}

      {/* Tracking */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card mt-8 p-6">
          <h2 className="mb-6 font-semibold">Order Tracking</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    i <= currentStep ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i + 1}
                </div>
                <p className={`mt-2 text-xs capitalize ${i <= currentStep ? 'text-accent' : 'text-muted'}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="mt-4 text-sm">
              Tracking: <span className="font-medium">{order.trackingNumber}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Items</h2>
          {order.products.map((item, i) => (
            <div key={i} className="flex gap-4 border-b py-3 last:border-0">
              <img src={item.image} alt={item.title} className="h-16 w-16 rounded object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
            <span>Total</span>
            <span className="text-accent">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold">Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Order Status</span>
                <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${getOrderStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment</span>
                <span className="capitalize">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Method</span>
                <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-semibold">Shipping Address</h2>
            <p>{order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}<br />
              {order.shippingAddress.phone}
            </p>
          </div>

          {canCancel && (
            <Button variant="outline" onClick={handleCancel} loading={cancelling} className="w-full text-red-500 border-red-500 hover:bg-red-50">
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetail />
    </ProtectedRoute>
  );
}

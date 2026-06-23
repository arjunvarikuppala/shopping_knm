import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { Order } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor } from '@/utils';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/routes/ProtectedRoute';

function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchOrders = () => {
    orderApi.getMyOrders().then((res) => {
      const ordersData = Array.isArray(res.data?.data) ? res.data.data : [];
      setOrders(ordersData as Order[]);
      setLoading(false);
    }).catch(() => {
      setOrders([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(id);
    try {
      await orderApi.cancel(id);
      fetchOrders();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="container-app py-8">
        <Skeleton className="mb-8 h-10 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-8 text-3xl font-bold">Order History</h1>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-muted mb-6">Looks like you haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Cards Layout */}
          <div className="block md:hidden space-y-4">
            {orders.map((order) => {
              const canCancel = !['shipped', 'delivered', 'cancelled'].includes(order.orderStatus);
              
              return (
                <div key={order._id} className="card p-4 shadow-sm relative overflow-hidden">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getOrderStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted">Amount</p>
                      <p className="font-semibold text-accent">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Items</p>
                      <p className="font-medium">{order.products?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Payment</p>
                      <p className="font-medium capitalize">{order.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    <Link to={`/orders/${order._id}`} className="btn-primary text-xs py-1.5 px-3 flex-1 text-center">
                      View Details
                    </Link>
                    <Link to={`/orders/${order._id}`} className="btn-outline text-xs py-1.5 px-3 flex-1 text-center">
                      Track Order
                    </Link>
                    {canCancel && (
                      <Button 
                        variant="outline" 
                        className="text-xs py-1.5 px-3 text-red-500 border-red-500 hover:bg-red-50 flex-1"
                        onClick={(e) => handleCancel(order._id, e)}
                        loading={cancelling === order._id}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-muted bg-gray-50/50">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Payment</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const canCancel = !['shipped', 'delivered', 'cancelled'].includes(order.orderStatus);

                  return (
                    <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                      <td className="p-4">{formatDate(order.createdAt)}</td>
                      <td className="p-4">{order.products?.length || 0}</td>
                      <td className="p-4 font-medium text-accent">{formatPrice(order.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getOrderStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 capitalize">{order.paymentStatus}</td>
                      <td className="p-4 text-right space-x-2">
                        <Link to={`/orders/${order._id}`} className="text-xs font-medium text-accent hover:underline">
                          View
                        </Link>
                        {canCancel && (
                          <button 
                            disabled={cancelling === order._id}
                            onClick={(e) => handleCancel(order._id, e)} 
                            className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
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

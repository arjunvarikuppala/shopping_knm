import { useEffect, useState } from 'react';
import { orderApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { Order } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor } from '@/utils';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusForm, setStatusForm] = useState({ orderStatus: '', paymentStatus: '', trackingNumber: '' });
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await orderApi.getAll({ limit: 50 });
      const ordersData = Array.isArray(data?.data) ? data.data : [];
      setOrders(ordersData as Order[]);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setStatusForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || '',
    });
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      await orderApi.updateStatus(selectedOrder._id, statusForm);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Orders</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-lg font-medium">No orders found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4">
                    {order.userId && typeof order.userId === 'object' && 'name' in order.userId ? (order.userId as any).name : 'N/A'}
                  </td>
                  <td className="p-4">{order.products?.length || 0}</td>
                  <td className="p-4 font-medium">{formatPrice(order.totalAmount)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getOrderStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4">{formatDate(order.createdAt)}</td>
                  <td className="p-4">
                    <button onClick={() => openStatusModal(order)} className="text-accent hover:underline font-medium">
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order #${selectedOrder?._id.slice(-8)}`}
      >
        <div className="space-y-4">
          <Select
            label="Order Status"
            value={statusForm.orderStatus}
            onChange={(e) => setStatusForm({ ...statusForm, orderStatus: e.target.value })}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <Select
            label="Payment Status"
            value={statusForm.paymentStatus}
            onChange={(e) => setStatusForm({ ...statusForm, paymentStatus: e.target.value })}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
          <Input
            label="Tracking Number"
            value={statusForm.trackingNumber}
            onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
          />
          <Button onClick={handleUpdateStatus} loading={saving} className="w-full">
            Update Order
          </Button>
        </div>
      </Modal>
    </div>
  );
}

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

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-x-auto">
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {!orders || orders.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-lg font-medium">No orders found.</p>
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-mono text-xs font-bold text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${getOrderStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Customer</p>
                  <p className="font-medium text-[#2C1810]">
                    {order.userId && typeof order.userId === 'object' && 'name' in order.userId ? (order.userId as any).name : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Date</p>
                  <p className="font-medium text-[#2C1810]">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Items</p>
                  <p className="font-medium text-[#2C1810]">{order.products?.length || 0} Items</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Total</p>
                  <p className="font-bold text-[#7A0019]">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
              <div className="pt-3 border-t flex gap-3">
                <button 
                  className="flex-1 py-2.5 px-4 bg-[#F8F4E8] text-[#2C1810] border border-[#E5DCC5] rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-[#EFE9D8] transition-colors"
                >
                  View Details
                </button>
                <button 
                  onClick={() => openStatusModal(order)}
                  className="flex-1 py-2.5 px-4 bg-[#7A0019] text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-[#5A0012] transition-colors shadow-sm"
                >
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
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

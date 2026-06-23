import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { userApi, orderApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { User, Order } from '@/types';
import { useAppDispatch } from '@/app/hooks';
import { setUser } from '@/features/auth/authSlice';
import { formatPrice, formatDate, getOrderStatusColor } from '@/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

import Skeleton from '@/components/ui/Skeleton';
import ProtectedRoute from '@/routes/ProtectedRoute';

function ProfileContent() {
  const dispatch = useAppDispatch();
  const [user, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'orders'>('info');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const { data } = await userApi.getProfile();
      const u = data.data as User;
      setUserData(u);
      setProfileForm({ name: u.name, email: u.email });
      dispatch(setUser(u));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchOrders = () => {
    orderApi.getMyOrders().then((res) => {
      const ordersData = Array.isArray(res.data?.data) ? res.data.data : [];
      setOrders(ordersData as Order[]);
      setOrdersFetched(true);
      setOrdersLoading(false);
    }).catch(() => {
      setOrders([]);
      setOrdersLoading(false);
    });
  };

  useEffect(() => {
    if (activeTab === 'orders' && !ordersFetched) {
      setOrdersLoading(true);
      fetchOrders();
    }
  }, [activeTab, ordersFetched]);

  const handleCancelOrder = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancellingOrderId(id);
    try {
      await orderApi.cancel(id);
      fetchOrders();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await userApi.updateProfile(profileForm);
      setUserData(data.data as User);
      dispatch(setUser(data.data as User));
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container-app py-16 text-center">Loading...</div>;

  const tabs = [
    { id: 'info' as const, label: 'Personal Info' },
    { id: 'password' as const, label: 'Change Password' },
    { id: 'orders' as const, label: 'My Orders' },
  ];

  return (
    <div className="container-app py-8">
      <div className="mb-8 flex items-center gap-4">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover shadow-sm" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-3xl text-white font-bold shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted">{user?.name}</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-4 border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMessage(''); setError(''); }}
            className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleProfileUpdate} className="card max-w-lg space-y-4 p-6">
          <Input
            label="Full Name"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            required
          />
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="card max-w-lg space-y-4 p-6">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
          />
          <Button type="submit" loading={saving}>Change Password</Button>
        </form>
      )}

      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="space-y-4">
              <Skeleton className="mb-4 h-10 w-48" />
              {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
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
                            onClick={(e) => handleCancelOrder(order._id, e)}
                            loading={cancellingOrderId === order._id}
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
                                disabled={cancellingOrderId === order._id}
                                onClick={(e) => handleCancelOrder(order._id, e)} 
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
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

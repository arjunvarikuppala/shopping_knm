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
import Spinner from '@/components/ui/Spinner';
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

  useEffect(() => {
    if (activeTab === 'orders' && !ordersFetched) {
      setOrdersLoading(true);
      orderApi.getMyOrders().then((res) => {
        setOrders(res.data.data as Order[]);
        setOrdersFetched(true);
        setOrdersLoading(false);
      }).catch(() => setOrdersLoading(false));
    }
  }, [activeTab, ordersFetched]);

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
            <Spinner size="md" className="min-h-[200px]" />
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
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

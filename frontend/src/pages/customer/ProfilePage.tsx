import { useEffect, useState, FormEvent } from 'react';
import { userApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { User, Address } from '@/types';
import { useAppDispatch } from '@/app/hooks';
import { setUser } from '@/features/auth/authSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProtectedRoute from '@/routes/ProtectedRoute';

function ProfileContent() {
  const dispatch = useAppDispatch();
  const [user, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'addresses'>('info');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addressModal, setAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

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

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userApi.addAddress(addressForm);
      setUserData(data.data as User);
      setAddressModal(false);
      setMessage('Address added');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      const { data } = await userApi.deleteAddress(id);
      setUserData(data.data as User);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <div className="container-app py-16 text-center">Loading...</div>;

  const tabs = [
    { id: 'info' as const, label: 'Personal Info' },
    { id: 'password' as const, label: 'Change Password' },
    { id: 'addresses' as const, label: 'Saved Addresses' },
  ];

  return (
    <div className="container-app py-8">
      <h1 className="mb-8 text-3xl font-bold">My Profile</h1>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMessage(''); setError(''); }}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
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

      {activeTab === 'addresses' && (
        <div>
          <Button onClick={() => setAddressModal(true)} className="mb-4">
            Add New Address
          </Button>
          <div className="grid gap-4 sm:grid-cols-2">
            {user?.addresses?.map((addr: Address) => (
              <div key={addr._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">Default</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted">
                  {addr.fullName}<br />
                  {addr.street}<br />
                  {addr.city}, {addr.state} {addr.zipCode}<br />
                  {addr.phone}
                </p>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  className="mt-2 text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={addressModal} onClose={() => setAddressModal(false)} title="Add Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <Input label="Label" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} required />
          <Input label="Full Name" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} required />
          <Input label="Street" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required />
            <Input label="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Zip Code" value={addressForm.zipCode} onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })} required />
            <Input label="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
            />
            Set as default address
          </label>
          <Button type="submit" loading={saving} className="w-full">Save Address</Button>
        </form>
      </Modal>
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

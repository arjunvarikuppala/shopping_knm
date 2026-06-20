import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { selectCartItems, selectCartTotal, clearCart } from '@/features/cart/cartSlice';
import { orderApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { formatPrice } from '@/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/routes/ProtectedRoute';

function CheckoutForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    paymentMethod: 'cod',
    notes: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await orderApi.create({
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: form.fullName,
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
          phone: form.phone,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
      });

      dispatch(clearCart());
      navigate(`/orders/${(data.data as { _id: string })._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  required
                />
              </div>
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
              <Input
                label="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
              <Input
                label="Zip Code"
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                required
              />
              <Input
                label="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
            <Select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              options={[
                { value: 'cod', label: 'Cash on Delivery (COD)' },
                { value: 'upi', label: 'Online Payment (PhonePe, GPay, UPI)' },
              ]}
            />
            {form.paymentMethod === 'upi' && (
              <div className="mt-6 flex flex-col items-center rounded-lg border-2 border-dashed border-gray-200 p-6 bg-gray-50">
                <p className="mb-4 text-sm font-medium text-gray-700">Scan QR Code to Pay <span className="font-bold text-accent">{formatPrice(total)}</span></p>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3Dkalanikethan%40upi%26pn%3DKalanikethan%20(KNM)%26am%3D${total}`} 
                  alt="UPI QR Code" 
                  className="rounded-xl shadow-sm w-48 h-48 bg-white p-3"
                />
                <p className="mt-4 text-xs text-muted text-center max-w-xs">
                  Scan using PhonePe, GPay, or any UPI app. After successful payment, click 'Place Order' below.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between py-2 text-sm">
              <span>{item.title} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-accent">{formatPrice(total)}</span>
            </div>
          </div>
          <Button type="submit" loading={loading} className="mt-6 w-full" size="lg">
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutForm />
    </ProtectedRoute>
  );
}

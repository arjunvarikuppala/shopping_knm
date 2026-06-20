import { useEffect, useState } from 'react';
import { adminApi } from '@/services';
import { DashboardStats } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor } from '@/utils';
import Spinner from '@/components/ui/Spinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      setStats(res.data.data as DashboardStats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦' },
    { label: 'Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: '💰' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: '👕' },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{card.label}</p>
                <p className="mt-1 text-2xl font-bold">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const o = order as {
                    _id: string;
                    userId: { name: string };
                    totalAmount: number;
                    orderStatus: string;
                    createdAt: string;
                  };
                  return (
                    <tr key={o._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{o._id.slice(-8)}</td>
                      <td className="py-3 pr-4">{o.userId?.name || 'N/A'}</td>
                      <td className="py-3 pr-4">{formatPrice(o.totalAmount)}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${getOrderStatusColor(o.orderStatus)}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3">{formatDate(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No recent orders</p>
        )}
      </div>
    </div>
  );
}

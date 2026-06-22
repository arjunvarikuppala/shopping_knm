import { useEffect, useState } from 'react';
import { adminApi } from '@/services';
import { DashboardStats } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor } from '@/utils';
import Spinner from '@/components/ui/Spinner';
import { FiUsers, FiBox, FiDollarSign, FiShoppingBag } from 'react-icons/fi';

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
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FiBox },
    { label: 'Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: FiDollarSign },
    { label: 'Products', value: stats?.totalProducts || 0, icon: FiShoppingBag },
  ];

  return (
    <div className="bg-[#FFFFF0] min-h-screen p-8 rounded-xl border border-[#E5DCC5]/50 shadow-sm">
      <h1 className="mb-8 font-display text-4xl font-bold text-[#800000]">Executive Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white border border-[#E5DCC5]/50 p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#800000]/5 transition-transform group-hover:scale-150"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#8C7B75]">{card.label}</p>
                <p className="mt-2 font-display text-3xl font-bold text-[#2C1810]">{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#800000]/10 text-[#800000]">
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E5DCC5]/50 mt-10 p-8 shadow-sm relative">
        <h2 className="mb-6 font-display text-2xl font-bold text-[#2C1810]">Recent Transactions</h2>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FFFFF0] border-y border-[#E5DCC5]">
                <tr className="text-xs font-semibold uppercase tracking-wider text-[#8C7B75]">
                  <th className="py-4 pl-4 font-medium">Order ID</th>
                  <th className="py-4 font-medium">Customer</th>
                  <th className="py-4 font-medium">Amount</th>
                  <th className="py-4 font-medium">Status</th>
                  <th className="py-4 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCC5]/50">
                {stats.recentOrders.map((order) => {
                  const o = order as {
                    _id: string;
                    userId: { name: string };
                    totalAmount: number;
                    orderStatus: string;
                    createdAt: string;
                  };
                  return (
                    <tr key={o._id} className="transition-colors hover:bg-[#FFFFF0]/50">
                      <td className="py-4 pl-4 font-mono text-xs text-[#800000]">{o._id.slice(-8).toUpperCase()}</td>
                      <td className="py-4 text-[#2C1810] font-medium">{o.userId?.name || 'Guest User'}</td>
                      <td className="py-4 font-semibold text-[#2C1810]">{formatPrice(o.totalAmount)}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${getOrderStatusColor(o.orderStatus)} border`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-[#8C7B75]">{formatDate(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-[#8C7B75]">
            <p>No recent transactions available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { userApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { User } from '@/types';
import { formatDate } from '@/utils';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const { data } = await userApi.getCustomers();
      setCustomers(data.data as User[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleToggleBlock = async (id: string) => {
    try {
      await userApi.toggleBlock(id);
      fetchCustomers();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Customers</h1>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!customers || customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-4xl mb-4">👥</div>
                    <p className="text-lg font-medium">No customers found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium flex items-center gap-3">
                    {customer.avatar ? (
                      <img src={customer.avatar} alt={customer.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7A0019] text-[#D4AF37] font-bold">
                        {customer.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    {customer.name}
                  </td>
                  <td className="p-4">{customer.email}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${customer.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {customer.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4">{formatDate(customer.createdAt)}</td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant={customer.isBlocked ? 'primary' : 'outline'}
                      onClick={() => handleToggleBlock(customer._id)}
                    >
                      {customer.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {!customers || customers.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-lg font-medium">No customers found.</p>
            </div>
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer._id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7A0019] text-[#D4AF37] font-bold text-lg border border-[#7A0019]/20 shadow-sm">
                      {customer.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-[#2C1810] leading-tight">{customer.name}</h3>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${customer.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {customer.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm pt-1 pb-1">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Joined</p>
                  <p className="font-medium text-[#2C1810]">{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Orders</p>
                  <p className="font-medium text-[#2C1810]">View details</p>
                </div>
              </div>
              <div className="pt-3 border-t flex gap-3">
                <button 
                  className="flex-1 py-2.5 px-4 bg-[#F8F4E8] text-[#2C1810] border border-[#E5DCC5] rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-[#EFE9D8] transition-colors shadow-sm"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleToggleBlock(customer._id)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors shadow-sm ${
                    customer.isBlocked 
                      ? 'bg-[#7A0019] text-white hover:bg-[#5A0012]' 
                      : 'bg-white border-2 border-[#7A0019] text-[#7A0019] hover:bg-[#7A0019]/5'
                  }`}
                >
                  {customer.isBlocked ? 'Unblock' : 'Block / Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

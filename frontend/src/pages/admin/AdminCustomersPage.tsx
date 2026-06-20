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

      <div className="card overflow-x-auto">
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
            {customers.map((customer) => (
              <tr key={customer._id} className="border-b last:border-0">
                <td className="p-4 font-medium">{customer.name}</td>
                <td className="p-4">{customer.email}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${customer.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

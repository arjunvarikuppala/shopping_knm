import { useEffect, useState } from 'react';
import { reviewApi } from '@/services';
import { getErrorMessage } from '@/services/api';

import Spinner from '@/components/ui/Spinner';
import { FaStar, FaTrash } from 'react-icons/fa';

interface StoreReview {
  _id: string;
  name?: string;
  userId?: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getAll();
      setReviews(res.data.data as StoreReview[]);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewApi.delete(id);
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const filteredReviews = (reviews || []).filter(r => {
    const customerName = r.name || r.userId?.name || 'Anonymous';
    const text = r.comment || '';
    return customerName.toLowerCase().includes(search.toLowerCase()) || 
           text.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7A0019]">Store Reviews</h1>
        <div className="w-72">
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#E5DCC5]/60 bg-white px-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reviews found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5DCC5]/40 text-left text-gray-500">
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Customer</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Rating</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs w-1/2">Message</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Date</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review._id} className="border-b border-[#E5DCC5]/20 last:border-0 hover:bg-[#F8F4E8]/30 transition-colors">
                  <td className="p-4 font-medium text-[#2C1810]">{review.name || review.userId?.name || 'Anonymous'}</td>
                  <td className="p-4">
                    <div className="flex text-[#D4AF37] gap-0.5 text-xs">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 line-clamp-2 mt-2">{review.comment || 'No comment provided.'}</td>
                  <td className="p-4 text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(review._id)} 
                      className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                      title="Delete Review"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

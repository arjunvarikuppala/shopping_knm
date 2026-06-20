import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { productApi, reviewApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { Product, Review } from '@/types';
import { formatPrice, formatDate } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          productApi.getById(id),
          reviewApi.getByProduct(id),
        ]);
        setProduct(prodRes.data.data as Product);
        setReviews(revRes.data.data as Review[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images[0] || '',
        stock: product.stock,
        quantity,
      }),
    );
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !isAuthenticated) return;
    setReviewError('');
    setReviewLoading(true);
    try {
      await reviewApi.create({ productId: id, ...reviewForm });
      const revRes = await reviewApi.getByProduct(id);
      setReviews(revRes.data.data as Review[]);
      const prodRes = await productApi.getById(id);
      setProduct(prodRes.data.data as Product);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(getErrorMessage(err));
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;
  if (!product) return <div className="container-app py-16 text-center">Product not found</div>;

  const categoryName = typeof product.category === 'object' ? product.category.name : '';

  return (
    <div className="container-app py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
            <img
              src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${
                    i === selectedImage ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {categoryName && (
            <p className="text-sm uppercase tracking-wide text-muted">{categoryName}</p>
          )}
          <h1 className="mt-1 text-3xl font-bold">{product.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-yellow-400">★ {product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted">({product.reviewCount} reviews)</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-accent">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xl text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="mt-4 text-muted leading-relaxed">{product.description}</p>
          <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {product.stock > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <Button onClick={handleAddToCart} size="lg">
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>

        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="card mb-8 space-y-4 p-6">
            <h3 className="font-semibold">Write a Review</h3>
            {reviewError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{reviewError}</div>
            )}
            <div>
              <label className="label">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                className="input w-auto"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Stars</option>
                ))}
              </select>
            </div>
            <Textarea
              label="Comment"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience..."
              required
            />
            <Button type="submit" loading={reviewLoading}>
              Submit Review
            </Button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{review.userId.name}</p>
                    <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
                  </div>
                  <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                </div>
                <p className="mt-2 text-muted">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

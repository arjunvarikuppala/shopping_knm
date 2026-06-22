import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi, reviewApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { Product, Review } from '@/types';
import { formatPrice, formatDate } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import Spinner from '@/components/ui/Spinner';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/zoom';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, revRes, featuredRes] = await Promise.all([
          productApi.getById(id),
          reviewApi.getByProduct(id),
          productApi.getFeatured()
        ]);
        setProduct(prodRes.data.data as Product);
        setReviews(revRes.data.data as Review[]);
        // Filter out current product from similar
        const similar = (featuredRes.data.data as Product[]).filter(p => p._id !== id);
        setSimilarProducts(similar);
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
  if (!product) return <div className="container-app py-16 text-center text-[#2C1810]">Product not found</div>;

  const categoryName = typeof product.category === 'object' ? product.category.name : '';
  const images = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="bg-[#FFFFF0] min-h-screen pb-16">
      <div className="container-app pt-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-[#8C7B75]">
          <Link to="/" className="hover:text-[#800000]">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-[#800000]">Collections</Link>
          {categoryName && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/products?category=${categoryName.toLowerCase().replace(' ', '-')}`} className="hover:text-[#800000]">
                {categoryName}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-[#2C1810]">{product.title}</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="product-gallery">
            <Swiper
              style={{
                '--swiper-navigation-color': '#800000',
                '--swiper-pagination-color': '#800000',
              } as any}
              zoom={true}
              navigation={true}
              pagination={{ type: 'fraction' }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              modules={[FreeMode, Navigation, Thumbs, Pagination, Zoom]}
              className="h-[600px] w-full rounded-none bg-[#E5DCC5]/20 mb-4"
            >
              {images.map((img, i) => (
                <SwiperSlide key={i} className="flex items-center justify-center overflow-hidden">
                  <div className="swiper-zoom-container">
                    <img
                      src={img}
                      alt={`${product.title} view ${i + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-150 cursor-zoom-in"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="thumbs-slider h-24"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i} className="cursor-pointer opacity-60 transition-opacity hover:opacity-100 swiper-slide-thumb-active:opacity-100 swiper-slide-thumb-active:border-2 swiper-slide-thumb-active:border-[#800000]">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col py-4">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]">
                Kalanikethan Exclusive
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-[#2C1810]">{product.title}</h1>
            
            <div className="mt-4 flex items-center gap-3 border-b border-[#E5DCC5]/50 pb-6">
              <div className="flex text-[#D4AF37]">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
              </div>
              <span className="text-sm font-medium text-[#2C1810]">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-[#8C7B75]">({product.reviewCount} customer reviews)</span>
            </div>
            
            <div className="mt-6 flex items-end gap-4">
              <span className="text-4xl font-bold text-[#800000]">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="mb-1 text-xl text-[#8C7B75] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            
            <p className="mt-8 text-[#2C1810] leading-relaxed font-light text-lg">{product.description}</p>
            
            <div className="mt-8 bg-[#E5DCC5]/10 p-4 border border-[#E5DCC5]/50">
              <p className="text-sm font-medium flex justify-between">
                <span className="text-[#8C7B75]">Availability:</span>
                <span className={product.stock > 0 ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                  {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                </span>
              </p>
              <p className="text-sm font-medium flex justify-between mt-2">
                <span className="text-[#8C7B75]">SKU:</span>
                <span className="text-[#2C1810]">{product._id.substring(0, 8).toUpperCase()}</span>
              </p>
            </div>

            {product.stock > 0 && (
              <div className="mt-10 flex flex-col sm:flex-row items-stretch gap-4">
                <div className="flex items-center border border-[#2C1810]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 text-[#2C1810] hover:bg-[#E5DCC5]/30 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-5 py-3 font-medium text-[#2C1810] min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-5 py-3 text-[#2C1810] hover:bg-[#E5DCC5]/30 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart} 
                  className="flex-1 bg-[#800000] text-white font-medium tracking-wider uppercase py-4 hover:bg-[#A52A2A] transition-colors shadow-md"
                >
                  Add to Cart
                </button>
              </div>
            )}
            
            {/* Trust Badges */}
            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[#E5DCC5]/50 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#800000]/5 text-[#800000]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-sm font-medium text-[#2C1810]">Authentic Silk</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#800000]/5 text-[#800000]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <span className="text-sm font-medium text-[#2C1810]">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-24 border-t border-[#E5DCC5]/50 pt-16">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-[#800000]">You May Also Like</h2>
              <div className="mx-auto mt-4 h-1 w-16 bg-[#D4AF37]"></div>
            </div>
            
            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="py-4"
            >
              {similarProducts.map((sp) => (
                <SwiperSlide key={sp._id}>
                  <div className="group relative border border-[#E5DCC5]/30 bg-white transition-all hover:shadow-xl">
                    <Link to={`/products/${sp._id}`} className="block overflow-hidden relative">
                      <img 
                        src={sp.images[0] || 'https://via.placeholder.com/300'} 
                        alt={sp.title} 
                        className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {sp.compareAtPrice && (
                        <div className="absolute top-4 left-4 bg-[#800000] text-white text-xs font-bold px-2 py-1 uppercase tracking-widest">
                          Sale
                        </div>
                      )}
                    </Link>
                    <div className="p-4 text-center">
                      <div className="mb-2 flex justify-center text-[#D4AF37] text-xs">
                        {'★'.repeat(Math.round(sp.rating))}
                        {'☆'.repeat(5 - Math.round(sp.rating))}
                      </div>
                      <Link to={`/products/${sp._id}`}>
                        <h3 className="font-display text-lg font-bold text-[#2C1810] hover:text-[#800000] truncate">{sp.title}</h3>
                      </Link>
                      <p className="mt-2 font-semibold text-[#800000]">{formatPrice(sp.price)}</p>
                      <button 
                        onClick={() => dispatch(addToCart({ productId: sp._id, title: sp.title, price: sp.price, image: sp.images[0], stock: sp.stock, quantity: 1 }))}
                        className="mt-4 w-full border border-[#800000] text-[#800000] py-2 text-sm uppercase tracking-widest hover:bg-[#800000] hover:text-white transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-24 border-t border-[#E5DCC5]/50 pt-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-[#800000]">Customer Experiences</h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-[#D4AF37]"></div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="bg-white border border-[#E5DCC5]/50 p-8 shadow-sm">
                  <h3 className="font-display text-2xl font-bold text-[#2C1810] mb-6">Write a Review</h3>
                  {reviewError && (
                    <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">{reviewError}</div>
                  )}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#8C7B75] mb-2 uppercase tracking-widest">Rating</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      className="w-full border border-[#E5DCC5] px-4 py-3 text-[#2C1810] focus:border-[#800000] focus:outline-none"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} Stars - {['Excellent', 'Good', 'Average', 'Fair', 'Poor'][5-r]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#8C7B75] mb-2 uppercase tracking-widest">Your Experience</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Tell us what you loved about this drape..."
                      required
                      className="w-full border border-[#E5DCC5] px-4 py-3 text-[#2C1810] focus:border-[#800000] focus:outline-none min-h-[120px]"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={reviewLoading}
                    className="w-full bg-[#2C1810] text-white font-medium tracking-widest uppercase py-4 hover:bg-[#800000] transition-colors disabled:opacity-50"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="bg-white border border-[#E5DCC5]/50 p-8 text-center shadow-sm">
                  <h3 className="font-display text-xl font-bold text-[#2C1810] mb-4">Share Your Thoughts</h3>
                  <p className="text-[#8C7B75] mb-6">Please log in to share your experience with this beautiful drape.</p>
                  <Link to="/login">
                    <button className="border border-[#2C1810] text-[#2C1810] px-8 py-3 uppercase tracking-widest hover:bg-[#2C1810] hover:text-white transition-colors">
                      Log In
                    </button>
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center bg-white border border-[#E5DCC5]/50 p-12">
                  <span className="text-4xl mb-4">✨</span>
                  <p className="text-[#8C7B75] text-lg">No reviews yet. Be the first to embrace this elegance and share your thoughts!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white border border-[#E5DCC5]/50 p-6 shadow-sm flex gap-4">
                    <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-[#E5DCC5]/30 text-[#800000] font-bold text-xl font-display shrink-0">
                      {review.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-[#2C1810] text-lg">{review.userId.name}</p>
                        <span className="text-[#D4AF37] text-sm">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C7B75] uppercase tracking-wider mb-4">{formatDate(review.createdAt)}</p>
                      <p className="text-[#2C1810] leading-relaxed font-light">{review.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

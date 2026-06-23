import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi, reviewApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { Product, Review } from '@/types';
import { formatPrice, formatDate } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import { toggleWishlist, selectInWishlist } from '@/features/wishlist/wishlistSlice';
import Spinner from '@/components/ui/Spinner';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { FaHeart, FaRegHeart, FaShareAlt, FaShoppingBag, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';

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
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isInWishlist = useAppSelector((state) => selectInWishlist(state, id || ''));
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
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
        const [prodRes, revRes, allProdsRes] = await Promise.all([
          productApi.getById(id),
          reviewApi.getByProduct(id),
          productApi.getAll({ limit: 100 })
        ]);
        
        const currentProduct = prodRes.data.data as Product;
        setProduct(currentProduct);
        setReviews(revRes.data.data as Review[]);
        
        const allProducts = allProdsRes.data.data as Product[];
        
        // Similar products (same fabric or category)
        const similar = allProducts.filter(
          p => p._id !== id && (p.category === currentProduct.category || p.fabric === currentProduct.fabric)
        ).slice(0, 8);
        setSimilarProducts(similar);

        // Viewed products (different recommendations)
        const viewed = allProducts.filter(
          p => p._id !== id && p.fabric !== currentProduct.fabric
        ).slice(0, 8);
        setViewedProducts(viewed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (user?.role === 'admin') {
      toast.error('Administrators cannot purchase products.');
      return;
    }
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
    toast.success('Added to Cart');
  };

  const handleBuyNow = () => {
    if (user?.role === 'admin') {
      toast.error('Admin accounts are restricted from placing orders.');
      return;
    }
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
    navigate('/cart');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
    if (isInWishlist) {
      toast.info('Removed from Wishlist');
    } else {
      toast.success('Added to Wishlist');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title || 'Kalanikethan Saree',
        text: product?.description || '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
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
      toast.success('Review submitted successfully!');
    } catch (err) {
      setReviewError(getErrorMessage(err));
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;
  if (!product) return <div className="container-app py-16 text-center text-[#2C1810]">Saree not found</div>;

  const categoryName = typeof product.category === 'object' ? product.category.name : '';
  const images = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'];

  // Discount percentage calculation
  let discountPercentage = 0;
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    discountPercentage = Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
    );
  }

  // Gallery view tag names mapping for saree detail views
  const viewTags = ['Full View', 'Model View', 'Border Close-up', 'Pallu Design', 'Blouse Piece', 'Folded View'];

  return (
    <div className="bg-[#FFF8E7] min-h-screen pb-20">
      
      {/* Breadcrumbs */}
      <div className="border-b border-[#E5DCC5]/30 bg-white/40 py-4">
        <div className="container-app text-xs sm:text-sm text-[#8C7B75]">
          <Link to="/" className="hover:text-[#800020] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-[#800020] transition-colors">Collections</Link>
          {categoryName && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/products?category=${categoryName.toLowerCase().replace(' ', '-')}`} className="hover:text-[#800020] transition-colors">
                {categoryName}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-[#2C1810] font-semibold">{product.title}</span>
        </div>
      </div>

      <div className="container-app pt-8">
        
        {/* Main Details Grid */}
        <div className="grid gap-12 lg:grid-cols-2 bg-white border border-[#E5DCC5]/40 p-6 md:p-10 rounded-2xl shadow-xs">
          
          {/* Left Column: Image Carousel */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#FFF8E7]/40 rounded-xl border border-[#E5DCC5]/20">
              <Swiper
                style={{
                  '--swiper-navigation-color': '#800020',
                  '--swiper-pagination-color': '#800020',
                } as any}
                zoom={true}
                navigation={true}
                pagination={{ type: 'fraction' }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                modules={[FreeMode, Navigation, Thumbs, Pagination, Zoom]}
                className="h-full w-full"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i} className="flex items-center justify-center">
                    <div className="swiper-zoom-container h-full w-full">
                      <img
                        src={img}
                        alt={`${product.title} - ${viewTags[i] || 'View ' + (i + 1)}`}
                        className="h-full w-full object-cover cursor-zoom-in"
                        loading="lazy"
                      />
                    </div>
                    {/* View tag label overlay */}
                    <span className="absolute bottom-4 left-4 bg-[#800020] border border-[#D4AF37]/40 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                      {viewTags[i] || `View ${i + 1}`}
                    </span>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Discount badge overlay */}
              {discountPercentage > 0 && (
                <span className="absolute left-4 top-4 bg-[#800020] border border-[#D4AF37]/30 text-white font-display text-xs uppercase font-bold tracking-wider px-3 py-1 shadow-md z-10">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
            
            {/* Thumbnails below */}
            {images.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="thumbs-slider h-20 sm:h-24"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i} className="cursor-pointer border border-[#E5DCC5]/40 rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity swiper-slide-thumb-active:opacity-100 swiper-slide-thumb-active:border-[#800020] swiper-slide-thumb-active:border-2">
                    <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            <p className="text-center text-xs text-[#8C7B75] pt-1">
              * Hover/Pinch to zoom image. Swipe left or right for detailed showroom views.
            </p>
          </div>

          {/* Right Column: Saree Info */}
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] border-b border-[#E5DCC5]/30 pb-3 block">
              {categoryName || 'Saree Collection'}
            </span>

            <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold text-[#800020] leading-snug">
              {product.title}
            </h1>

            {/* Ratings Summary */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex text-[#D4AF37]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-[#D4AF37]' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#2C1810]">{product.rating.toFixed(1)}</span>
              <span className="text-[#E5DCC5] font-light">|</span>
              <span className="text-sm text-[#8C7B75] font-light">{product.reviewCount} Showroom Reviews</span>
            </div>

            {/* Prices */}
            <div className="mt-6 bg-[#FFF8E7]/40 p-4 border border-[#E5DCC5]/40 rounded-xl flex items-baseline gap-4">
              <span className="text-3xl font-bold text-[#800020] font-display">{formatPrice(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-[#8C7B75] line-through font-light">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="text-xs font-bold text-[#D4AF37] bg-[#800020]/10 px-2 py-0.5 rounded-sm border border-[#D4AF37]/30">
                    Save {formatPrice(product.compareAtPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="mt-6 text-[#2C1810] leading-relaxed font-light text-base md:text-lg">
              {product.description}
            </p>

            {/* Saree Specifications Block */}
            <div className="mt-8">
              <h3 className="font-display text-sm font-bold text-[#800020] uppercase tracking-wider mb-3">
                Saree Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 border border-[#E5DCC5]/40 rounded-xl p-4 bg-[#FFF8E7]/10 text-sm">
                <div className="flex justify-between py-1 border-b border-[#E5DCC5]/20">
                  <span className="text-[#8C7B75] font-light">Fabric:</span>
                  <span className="font-semibold text-[#2C1810]">{product.fabric || 'Pure Silk'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5DCC5]/20">
                  <span className="text-[#8C7B75] font-light">Color:</span>
                  <span className="font-semibold text-[#2C1810]">{product.color || 'Crimson Red'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5DCC5]/20">
                  <span className="text-[#8C7B75] font-light">Occasion:</span>
                  <span className="font-semibold text-[#2C1810]">{product.occasion || 'Wedding / Festive'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5DCC5]/20">
                  <span className="text-[#8C7B75] font-light">Work Type:</span>
                  <span className="font-semibold text-[#2C1810]">{product.workType || 'Traditional Weave'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5DCC5]/20 sm:border-b-0">
                  <span className="text-[#8C7B75] font-light">Blouse Piece:</span>
                  <span className="font-semibold text-[#2C1810] truncate max-w-[150px]" title={product.blousePiece}>
                    {product.blousePiece || 'Included - 80cm'}
                  </span>
                </div>
                <div className="flex justify-between py-1 sm:border-b-0">
                  <span className="text-[#8C7B75] font-light">Wash Care:</span>
                  <span className="font-semibold text-[#2C1810]">{product.washCare || 'Dry Clean Only'}</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mt-8 flex items-center gap-4">
                <span className="text-sm font-semibold text-[#2C1810]">Quantity:</span>
                <div className="flex items-center border border-[#E5DCC5] bg-white rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-[#2C1810] hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold text-[#2C1810] min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-[#2C1810] hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#8C7B75] font-light">
                  {product.stock} items left in stock
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-[#800020] text-[#800020] hover:bg-[#800020]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-display text-sm uppercase tracking-widest font-bold rounded-lg cursor-pointer"
                >
                  <FaShoppingBag className="h-4 w-4" />
                  <span>Add To Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 py-4 bg-[#800020] text-white hover:bg-[#A52A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-display text-sm uppercase tracking-widest font-bold rounded-lg shadow-md cursor-pointer border border-[#800020]"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border border-[#E5DCC5]/60 hover:bg-[#FFF8E7] rounded-lg transition-colors text-xs font-semibold uppercase tracking-wider text-[#2C1810] cursor-pointer`}
                >
                  {isInWishlist ? (
                    <>
                      <FaHeart className="h-4 w-4 text-[#800020]" />
                      <span>Wishlisted</span>
                    </>
                  ) : (
                    <>
                      <FaRegHeart className="h-4 w-4 text-[#8C7B75]" />
                      <span>Add to Wishlist</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#E5DCC5]/60 hover:bg-[#FFF8E7] rounded-lg transition-colors text-xs font-semibold uppercase tracking-wider text-[#2C1810] cursor-pointer"
                >
                  <FaShareAlt className="h-3.5 w-3.5 text-[#8C7B75]" />
                  <span>Share Product</span>
                </button>
              </div>
            </div>
            
            {/* Quick Policies block */}
            <div className="mt-8 border-t border-[#E5DCC5]/40 pt-6 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs text-[#8C7B75] font-light">
              <div>🛡️ 100% Certified Pure Silk</div>
              <div>🔄 7 Days Easy Returns</div>
              <div>🚚 Free Secure Delivery</div>
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS SECTION 1: You May Also Like */}
        {similarProducts.length > 0 && (
          <section className="mt-20 border-t border-[#E5DCC5]/40 pt-16">
            <div className="flex items-center justify-between mb-8 border-b border-[#E5DCC5]/30 pb-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#800020]">
                You May Also Like
              </h2>
              <div className="flex gap-2">
                <button className="swiper-prev-similar h-9 w-9 flex items-center justify-center border border-[#E5DCC5] rounded-full hover:bg-white text-[#800020] cursor-pointer">
                  <FaChevronLeft className="h-3 w-3" />
                </button>
                <button className="swiper-next-similar h-9 w-9 flex items-center justify-center border border-[#E5DCC5] rounded-full hover:bg-white text-[#800020] cursor-pointer">
                  <FaChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <Swiper
              slidesPerView={2}
              spaceBetween={16}
              navigation={{
                prevEl: '.swiper-prev-similar',
                nextEl: '.swiper-next-similar',
              }}
              breakpoints={{
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              modules={[Navigation]}
              className="py-2"
            >
              {similarProducts.map((sp) => {
                let disc = 0;
                if (sp.compareAtPrice && sp.compareAtPrice > sp.price) {
                  disc = Math.round(((sp.compareAtPrice - sp.price) / sp.compareAtPrice) * 100);
                }
                return (
                  <SwiperSlide key={sp._id}>
                    <div className="group border border-[#E5DCC5]/40 bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col justify-between">
                      <Link to={`/products/${sp._id}`} className="block relative aspect-[3/4] bg-[#FFF8E7]/20">
                        <img 
                          src={sp.images[0] || 'https://via.placeholder.com/300'} 
                          alt={sp.title} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {disc > 0 && (
                          <div className="absolute top-3 left-3 bg-[#800020] border border-[#D4AF37]/30 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest z-10">
                            {disc}% OFF
                          </div>
                        )}
                      </Link>
                      <div className="p-3 text-center">
                        <h3 className="font-display font-bold text-sm text-[#2C1810] hover:text-[#800020] truncate mb-1">
                          <Link to={`/products/${sp._id}`}>{sp.title}</Link>
                        </h3>
                        <p className="font-semibold text-sm text-[#800020] font-display">{formatPrice(sp.price)}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </section>
        )}

        {/* RELATED PRODUCTS SECTION 2: Customers Also Viewed */}
        {viewedProducts.length > 0 && (
          <section className="mt-16 border-t border-[#E5DCC5]/40 pt-16">
            <div className="flex items-center justify-between mb-8 border-b border-[#E5DCC5]/30 pb-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#800020]">
                Customers Also Viewed
              </h2>
              <div className="flex gap-2">
                <button className="swiper-prev-viewed h-9 w-9 flex items-center justify-center border border-[#E5DCC5] rounded-full hover:bg-white text-[#800020] cursor-pointer">
                  <FaChevronLeft className="h-3 w-3" />
                </button>
                <button className="swiper-next-viewed h-9 w-9 flex items-center justify-center border border-[#E5DCC5] rounded-full hover:bg-white text-[#800020] cursor-pointer">
                  <FaChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <Swiper
              slidesPerView={2}
              spaceBetween={16}
              navigation={{
                prevEl: '.swiper-prev-viewed',
                nextEl: '.swiper-next-viewed',
              }}
              breakpoints={{
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              modules={[Navigation]}
              className="py-2"
            >
              {viewedProducts.map((vp) => {
                let disc = 0;
                if (vp.compareAtPrice && vp.compareAtPrice > vp.price) {
                  disc = Math.round(((vp.compareAtPrice - vp.price) / vp.compareAtPrice) * 100);
                }
                return (
                  <SwiperSlide key={vp._id}>
                    <div className="group border border-[#E5DCC5]/40 bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col justify-between">
                      <Link to={`/products/${vp._id}`} className="block relative aspect-[3/4] bg-[#FFF8E7]/20">
                        <img 
                          src={vp.images[0] || 'https://via.placeholder.com/300'} 
                          alt={vp.title} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {disc > 0 && (
                          <div className="absolute top-3 left-3 bg-[#800020] border border-[#D4AF37]/30 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest z-10">
                            {disc}% OFF
                          </div>
                        )}
                      </Link>
                      <div className="p-3 text-center">
                        <h3 className="font-display font-bold text-sm text-[#2C1810] hover:text-[#800020] truncate mb-1">
                          <Link to={`/products/${vp._id}`}>{vp.title}</Link>
                        </h3>
                        <p className="font-semibold text-sm text-[#800020] font-display">{formatPrice(vp.price)}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </section>
        )}

        {/* Reviews Section */}
        <section className="mt-20 border-t border-[#E5DCC5]/40 pt-16">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              Testimonials
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold text-[#800020]">
              Customer Experiences
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            {/* Review Form */}
            <div>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="bg-white border border-[#E5DCC5]/40 p-6 sm:p-8 rounded-2xl shadow-xs">
                  <h3 className="font-display text-xl font-bold text-[#2C1810] mb-5">Share Your Experience</h3>
                  {reviewError && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                      {reviewError}
                    </div>
                  )}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-[#8C7B75] mb-2 uppercase tracking-widest">
                      Rating
                    </label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      className="w-full border border-[#E5DCC5] rounded-lg px-4 py-2.5 text-[#2C1810] focus:border-[#800020] focus:outline-none text-sm bg-transparent"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} Stars - {['Excellent', 'Good', 'Average', 'Fair', 'Poor'][5 - r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-[#8C7B75] mb-2 uppercase tracking-widest">
                      Your Comments
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Tell us what you loved about this weave, color, and border work..."
                      required
                      className="w-full border border-[#E5DCC5] rounded-lg px-4 py-3 text-[#2C1810] focus:border-[#800020] focus:outline-none text-sm min-h-[120px] bg-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full py-3.5 bg-[#800020] text-white text-xs uppercase tracking-widest font-bold hover:bg-[#A52A2A] transition-all rounded-lg disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="bg-white border border-[#E5DCC5]/40 p-8 text-center rounded-2xl shadow-xs">
                  <h3 className="font-display text-lg font-bold text-[#2C1810] mb-3">Share Your Experience</h3>
                  <p className="text-sm text-[#8C7B75] font-light mb-6">
                    Please log in to share your experience with this beautiful drape.
                  </p>
                  <Link to="/login">
                    <button className="border border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white px-8 py-3 uppercase tracking-widest text-xs font-bold rounded-lg transition-colors cursor-pointer">
                      Log In
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center bg-white border border-[#E5DCC5]/40 p-10 rounded-2xl shadow-xs">
                  <span className="text-3xl mb-3">✨</span>
                  <p className="text-[#8C7B75] text-base font-light">
                    No reviews yet. Be the first to embrace this elegance and share your thoughts!
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white border border-[#E5DCC5]/40 p-6 rounded-2xl shadow-xs flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#800020]/10 text-[#800020] font-bold text-sm shrink-0 border border-[#D4AF37]/20">
                      {review.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-[#2C1810] text-base font-display">{review.userId.name}</p>
                        <span className="text-[#D4AF37] text-xs">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8C7B75] uppercase tracking-wider mb-2">
                        {formatDate(review.createdAt)}
                      </p>
                      <p className="text-sm text-[#2C1810] font-light leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>
      <WhatsAppButton />
    </div>
  );
}

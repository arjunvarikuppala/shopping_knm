import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import { toggleWishlist, selectInWishlist } from '@/features/wishlist/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isInWishlist = useAppSelector((state) => selectInWishlist(state, product._id));
  
  const categoryName = typeof product.category === 'object' ? product.category.name : '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.role === 'admin') {
      toast.error('Administrators cannot purchase products.');
      return;
    }
    if (product.stock <= 0) return;
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images[0] || '',
        stock: product.stock,
        quantity: 1,
      }),
    );
    toast.success('Added to Cart');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
    if (isInWishlist) {
      toast.info('Removed from Wishlist');
    } else {
      toast.success('Added to Wishlist');
    }
  };

  // Discount percentage calculation
  let discountPercentage = 0;
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    discountPercentage = Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
    );
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group card overflow-hidden bg-white border border-[#E5DCC5]/40 hover:border-[#D4AF37]/50 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col h-full"
    >
      {/* Image Wrap */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#E5DCC5]/10">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-[#800020] shadow-md border border-[#E5DCC5]/30 hover:scale-110 transition-transform active:scale-95 duration-200 cursor-pointer z-10"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isInWishlist ? (
            <FaHeart className="h-5 w-5 text-[#800020] fill-[#800020]" />
          ) : (
            <FaRegHeart className="h-5 w-5 text-[#800020]" />
          )}
        </button>

        {/* Discount Badge Overlay */}
        {discountPercentage > 0 && (
          <span className="absolute left-3 top-3 bg-[#800020] border border-[#D4AF37]/30 text-white font-display text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm shadow-sm z-10">
            {discountPercentage}% OFF
          </span>
        )}

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-xs z-10">
            Sold Out
          </span>
        )}
      </div>

      {/* Details Wrap */}
      <div className="p-4.5 flex flex-col flex-1">
        {categoryName && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1">
            {categoryName}
          </span>
        )}
        <h3 className="font-display text-base font-bold text-[#2C1810] line-clamp-2 min-h-[2.8rem] leading-snug group-hover:text-[#800020] transition-colors mb-2">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3.5">
          <div className="flex text-[#D4AF37] text-xs">
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
          </div>
          <span className="text-xs font-semibold text-[#2C1810]">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-[#8C7B75] font-light">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-[#E5DCC5]/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[#800020] font-bold text-lg leading-tight font-display">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#8C7B75] line-through font-light mt-0.5">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="px-4 py-3 min-h-[44px] bg-[#800020] border border-[#800020] text-white hover:bg-white hover:text-[#800020] disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-display text-xs uppercase tracking-wider font-bold shadow-xs cursor-pointer"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </Link>
  );
}

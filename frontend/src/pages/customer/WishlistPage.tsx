import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectWishlistItems } from '@/features/wishlist/wishlistSlice';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const wishlistItems = useAppSelector(selectWishlistItems);

  return (
    <div className="bg-[#FFF8E7] min-h-screen py-12">
      <div className="container-app">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            Your Favorites
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold text-[#800020]">
            My Wishlist
          </h1>
          <div className="mx-auto mt-3 h-[2px] w-20 bg-[#D4AF37]"></div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="card max-w-md mx-auto p-8 text-center bg-white border border-[#E5DCC5]/40 shadow-sm rounded-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8E7] text-[#800020] mb-6">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#2C1810] mb-2 font-display">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-[#8C7B75] mb-6">
              Explore our exquisite handloomed sarees and save your favorites here.
            </p>
            <Link to="/products">
              <button className="w-full py-3 bg-[#800020] text-white font-medium tracking-wide hover:bg-[#A52A2A] transition-colors rounded-lg shadow-md">
                Explore Collections
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {wishlistItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

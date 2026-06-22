import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { selectCartCount } from '@/features/cart/cartSlice';
import { logout } from '@/features/auth/authSlice';
import { useState } from 'react';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Collections' },
    { to: '/products?sort=newest', label: 'New Arrivals' },
    { to: '/products?sort=bestselling', label: 'Best Sellers' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5DCC5]/50 bg-[#FFFFF0]/90 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#800000] text-white">
            <span className="font-display text-xl font-bold italic">K</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-wider text-[#800000] leading-none">KALANIKETHAN</span>
            <span className="text-[10px] tracking-[0.2em] text-[#D4AF37]">(KNM)</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium tracking-wide text-[#2C1810] transition-colors hover:text-[#800000]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-[#2C1810] hover:bg-[#E5DCC5]/30 hover:text-[#800000] transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <Link to="/wishlist" className="hidden sm:block rounded-lg p-2 text-[#2C1810] hover:bg-[#E5DCC5]/30 hover:text-[#800000] transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>

          <Link to="/cart" className="relative rounded-lg p-2 text-[#2C1810] hover:bg-[#E5DCC5]/30 hover:text-[#800000] transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#800000] text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden items-center gap-3 md:flex">
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium text-[#800000] hover:underline">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-[#2C1810] hover:text-[#800000]">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-white font-bold shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline">{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm text-[#8C7B75] hover:text-[#800000]">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link to="/login" className="text-sm font-medium text-[#2C1810] hover:text-[#800000]">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm px-6 py-2 bg-[#800000] text-white hover:bg-[#A52A2A] rounded-none border border-[#800000]">
                Sign Up
              </Link>
            </div>
          )}

          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>
                Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="block py-2 text-sm text-accent" onClick={() => setMobileOpen(false)}>
                  Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="block py-2 text-sm text-muted">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block py-2 text-sm text-accent" onClick={() => setMobileOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

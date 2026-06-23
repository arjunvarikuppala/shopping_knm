import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { selectCartCount } from '@/features/cart/cartSlice';
import { logout } from '@/features/auth/authSlice';
import { selectWishlistItems } from '@/features/wishlist/wishlistSlice';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartCount);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const wishlistCount = wishlistItems.length;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { 
      to: '/products', 
      label: 'Collections',
      dropdown: [
        { to: '/products?category=silk-sarees', label: 'Silk Sarees' },
        { to: '/products?category=cotton-sarees', label: 'Cotton Sarees' },
        { to: '/products?category=wedding-collection', label: 'Wedding Collection' },
        { to: '/products?category=new-arrivals', label: 'New Arrivals' },
      ]
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5DCC5]/40 bg-[#F8F4E8]/95 backdrop-blur-md shadow-md transition-all duration-300">
      <div className="mx-auto max-w-[1400px] px-[40px] flex h-[100px] items-center justify-between">
        
        {/* Left Section: Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7A0019] text-[#D4AF37] border border-[#D4AF37]/50 shadow-md transform transition-transform group-hover:rotate-12 duration-300">
            <span className="font-display text-2xl font-bold italic">K</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-[26px] font-bold tracking-wider text-[#7A0019] leading-none group-hover:text-[#D4AF37] transition-colors">
              KALANIKETHAN
            </span>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#D4AF37] mt-0.5">
              KNM SHOWROOM
            </span>
          </div>
        </Link>

        {/* Center Section: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center justify-center gap-[45px] flex-1">
          {navLinks.map((link) => (
            <div key={link.label} className="relative group">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-[13px] font-bold uppercase tracking-[0.15em] transition-all duration-300 border-b-[3px] py-2 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#D4AF37] border-[#D4AF37]'
                      : 'text-[#2C1810] border-transparent group-hover:text-[#7A0019] group-hover:border-[#7A0019]'
                  }`
                }
              >
                {link.label}
                {link.dropdown && (
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </NavLink>

              {/* Dropdown Menu */}
              {link.dropdown && (
                <div className="absolute top-full left-0 pt-[15px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-[#F8F4E8] shadow-lg rounded-[12px] p-[15px] w-[260px] flex flex-col gap-1 border border-[#E5DCC5]/40">
                    {link.dropdown.map((dropLink) => (
                      <NavLink
                        key={dropLink.label}
                        to={dropLink.to}
                        className={({ isActive }) =>
                          `block w-full px-4 py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition-all duration-200 border-l-[3px] rounded-r-md ${
                            isActive ? 'text-[#7A0019] bg-[#EFE9D8] border-[#7A0019]' : 'text-[#D4AF37] border-transparent hover:text-[#7A0019] hover:bg-[#EFE9D8] hover:border-[#7A0019]'
                          }`
                        }
                      >
                        {dropLink.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-4 md:gap-[24px] shrink-0">
          {/* Search */}
          <button
            className="relative text-[#2C1810] hover:text-[#7A0019] transition-colors duration-200 flex items-center"
            aria-label="Search"
          >
            <svg className="h-[24px] w-[24px] md:h-[26px] md:w-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="hidden md:flex relative text-[#2C1810] hover:text-[#7A0019] transition-colors duration-200 items-center"
            aria-label="Wishlist"
          >
            <svg className="h-[26px] w-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#7A0019] text-[10px] font-bold text-white border border-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="hidden md:flex relative text-[#2C1810] hover:text-[#7A0019] transition-colors duration-200 items-center"
            aria-label="Cart"
          >
            <svg className="h-[26px] w-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-white border border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Admin / Login */}
          {isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-[24px] pl-[24px] border-l border-[#E5DCC5]">
              <Link to={user?.role === 'admin' ? '/admin' : '/profile'} className="flex items-center gap-3 group">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-[#D4AF37] transition-all" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7A0019] text-[#D4AF37] font-bold border-2 border-transparent group-hover:border-[#D4AF37] transition-all shadow-sm text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <span className="text-[13px] font-bold text-[#2C1810] group-hover:text-[#7A0019] transition-colors leading-tight uppercase tracking-wider">
                    {user?.name}
                  </span>
                  {user?.role === 'admin' && (
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mt-0.5">
                      Admin
                    </span>
                  )}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-[#7A0019] text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#5A0012] transition-colors duration-300 rounded-full shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-4 pl-[24px] border-l border-[#E5DCC5]">
              <Link to="/login" className="text-[13px] uppercase tracking-widest font-bold text-[#2C1810] hover:text-[#7A0019] transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-6 py-2.5 bg-[#7A0019] text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#5A0012] transition-colors duration-300 rounded-full shadow-md hover:shadow-lg">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburguer */}
          <button
            className="rounded-full p-2 text-[#2C1810] hover:bg-[#7A0019]/5 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay using Framer Motion */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[300px] flex-col bg-[#F8F4E8] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#E5DCC5]/60 pb-5">
                <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7A0019] text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm">
                    <span className="font-display text-xl font-bold italic">K</span>
                  </div>
                  <span className="font-display text-xl font-bold tracking-wider text-[#7A0019]">
                    Kalanikethan
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 text-[#2C1810] hover:bg-[#7A0019]/10 cursor-pointer transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links */}
              <div className="mt-8 flex flex-col gap-2 overflow-y-auto">
                {navLinks.map((link) => (
                  <div key={link.label} className="flex flex-col">
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `text-sm font-bold uppercase tracking-widest transition-colors py-3.5 px-2 border-b border-[#E5DCC5]/30 rounded-lg ${
                          isActive ? 'text-[#7A0019] bg-[#7A0019]/5' : 'text-[#2C1810] hover:text-[#7A0019] hover:bg-[#7A0019]/5'
                        }`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                    {link.dropdown && (
                      <div className="flex flex-col pl-4 mt-2 mb-1 space-y-1">
                        {link.dropdown.map((dropLink) => (
                          <NavLink
                            key={dropLink.label}
                            to={dropLink.to}
                            className={({ isActive }) =>
                              `text-[11px] font-bold uppercase tracking-widest transition-colors py-2.5 px-3 rounded-lg border-l-2 ${
                                isActive ? 'text-[#D4AF37] border-[#D4AF37] bg-[#7A0019]/5' : 'text-[#8C7B75] border-[#E5DCC5]/60 hover:text-[#7A0019] hover:border-[#7A0019] hover:bg-[#7A0019]/5'
                              }`
                            }
                            onClick={() => setMobileOpen(false)}
                          >
                            {dropLink.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Mobile Extra Links */}
                <Link
                  to="/wishlist"
                  className="text-sm font-bold uppercase tracking-widest text-[#2C1810] hover:text-[#7A0019] hover:bg-[#7A0019]/5 transition-colors py-3.5 px-2 border-b border-[#E5DCC5]/30 rounded-lg flex items-center justify-between"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-[#7A0019] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="text-sm font-bold uppercase tracking-widest text-[#2C1810] hover:text-[#7A0019] hover:bg-[#7A0019]/5 transition-colors py-3.5 px-2 border-b border-[#E5DCC5]/30 rounded-lg flex items-center justify-between"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-[#D4AF37] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* User authentication section at the bottom */}
              <div className="mt-auto border-t border-[#E5DCC5]/60 pt-6">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-5">
                    <Link
                      to={user?.role === 'admin' ? '/admin' : '/profile'}
                      className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-[#E5DCC5]/40 hover:border-[#D4AF37] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7A0019] text-[#D4AF37] font-bold text-xl shadow-inner">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[15px] text-[#2C1810] uppercase tracking-wide leading-tight">{user?.name}</p>
                        <span className="text-[11px] font-semibold text-[#8C7B75] uppercase tracking-widest mt-1 block">{user?.role}</span>
                      </div>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="text-center py-3 bg-[#D4AF37] text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#C5A017] transition-all rounded-full shadow-md"
                        onClick={() => setMobileOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                         handleLogout();
                         setMobileOpen(false);
                      }}
                      className="w-full text-center py-3 bg-[#7A0019] text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#5A0012] transition-all rounded-full shadow-md cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link
                      to="/login"
                      className="w-full text-center py-3 border-2 border-[#7A0019] text-[#7A0019] text-[11px] uppercase tracking-widest font-bold hover:bg-[#7A0019]/5 transition-all rounded-full"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="w-full text-center py-3 bg-[#7A0019] text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#5A0012] transition-all rounded-full shadow-md"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

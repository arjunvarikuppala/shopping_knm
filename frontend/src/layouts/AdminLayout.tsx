import { NavLink, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products', end: true },
  { to: '/admin/products/new', label: 'Add Product' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/reviews', label: 'Reviews' },
];

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4E8]">
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-[#7A0019] text-white flex flex-col shadow-2xl">
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-[#900020]/50 relative">
          <span className="absolute top-2 right-2 bg-[#D4AF37] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
            Administrator
          </span>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFE9D8] text-[#7A0019] border-2 border-[#D4AF37] shadow-md mb-3">
            <span className="font-display text-3xl font-bold italic">K</span>
          </div>
          <span className="font-display text-lg font-bold tracking-widest uppercase mb-1">
            Kalanikethan
          </span>
        </div>

        <div className="flex flex-col items-center py-6 px-4 bg-[#5A0012]/30">
          {user?.avatar ? (
             <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full object-cover border-2 border-[#D4AF37] shadow-md mb-2" />
          ) : (
             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-white font-bold text-xl border-2 border-[#EFE9D8] shadow-md mb-2">
               {user?.name?.charAt(0).toUpperCase() || 'A'}
             </div>
          )}
          <span className="text-sm font-bold uppercase tracking-wide text-white text-center">{user?.name}</span>
          <span className="text-[10px] text-gray-300 tracking-wider text-center">{user?.email}</span>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive ? 'bg-[#D4AF37] text-white shadow-md' : 'text-gray-300 hover:bg-[#900020] hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="border-t border-[#900020]/50 p-4 space-y-2">
          <button onClick={() => navigate('/')} className="w-full text-center py-3 bg-[#D4AF37] text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#C5A017] transition-all rounded-lg shadow-sm border border-[#D4AF37] cursor-pointer mb-2">
            🏠 Store Home
          </button>
          <button onClick={handleLogout} className="w-full text-center py-3 bg-[#900020] text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#5A0012] transition-all rounded-lg shadow-sm border border-[#D4AF37]/30 cursor-pointer">
            Logout
          </button>
        </div>
      </aside>
      <main className="ml-64 flex-1 flex flex-col relative">
        <div className="absolute top-6 right-8 z-10">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 bg-[#7A0019] text-white px-5 py-2.5 rounded-[12px] text-xs font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors shadow-sm"
          >
            🏠 Back to Store
          </button>
        </div>
        <div className="p-8 pt-16 mt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

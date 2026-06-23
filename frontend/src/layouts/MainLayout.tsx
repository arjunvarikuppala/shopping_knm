import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}

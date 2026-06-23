import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import Spinner from '@/components/ui/Spinner';

import HomePage from '@/pages/customer/HomePage';
import ProductsPage from '@/pages/customer/ProductsPage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import ProfilePage from '@/pages/customer/ProfilePage';
import WishlistPage from '@/pages/customer/WishlistPage';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AddProductPage from '@/pages/admin/AddProductPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminCustomersPage from '@/pages/admin/AdminCustomersPage';
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage';

const OrdersPage = lazy(() => import('@/pages/customer/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/customer/OrderDetailPage'));

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<Spinner size="lg" className="min-h-screen" />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
              </Route>

              <Route
                path="admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AddProductPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      </ErrorBoundary>
    </Provider>
  );
}

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-primary text-white">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-display text-xl font-bold">
              Kalanikethan <span className="text-accent text-lg">(KNM)</span>
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              Premium saree collection for every occasion. Discover the latest designs in authentic ethnic wear.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-white">All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-white">Featured</Link></li>
              <li><Link to="/products?sort=newest" className="hover:text-white">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
              <li><Link to="/orders" className="hover:text-white">Order History</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@kalanikethan.com</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Kalanikethan (KNM). All rights reserved.
        </div>
      </div>
    </footer>
  );
}

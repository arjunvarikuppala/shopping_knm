import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const whatsappUrl = 'https://wa.me/919999999999?text=Hello%20Kalanikethan%20KNM%2C%20I%20would%20like%20to%20know%20more%20about%20your%20saree%20collections.';

  return (
    <footer className="bg-[#800020] text-[#FFF8E7] border-t border-[#D4AF37]/30">
      <div className="container-app py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold tracking-wider text-white">
              KALANIKETHAN <span className="text-[#D4AF37] text-sm font-semibold tracking-widest block mt-1">(KNM)</span>
            </h3>
            <p className="text-sm leading-relaxed text-[#FFF8E7]/70 font-light">
              Experience the absolute height of Indian handloom heritage. We bring you handwoven sarees that reflect timelessness, purity, and absolute royalty.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold text-white mb-5 border-b border-[#D4AF37]/20 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm text-[#FFF8E7]/70 font-light">
              <li>
                <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#D4AF37] transition-colors">Collections</Link>
              </li>
              <li>
                <a href="#about" className="hover:text-[#D4AF37] transition-colors">About Us</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#D4AF37] transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Customer Policies */}
          <div>
            <h4 className="font-display text-lg font-bold text-white mb-5 border-b border-[#D4AF37]/20 pb-2">
              Customer Policies
            </h4>
            <ul className="space-y-3 text-sm font-light">
              <li>
                <a href="#shipping" className="text-[#D4AF37] hover:text-white transition-colors">Shipping Policy</a>
              </li>
              <li>
                <a href="#returns" className="text-[#FFF8E7]/70 hover:text-[#D4AF37] transition-colors">Return Policy</a>
              </li>
              <li>
                <a href="#privacy" className="text-[#FFF8E7]/70 hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Social Media & Contact */}
          <div>
            <h4 className="font-display text-lg font-bold text-white mb-5 border-b border-[#D4AF37]/20 pb-2">
              Social Media
            </h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#800020] text-white transition-all shadow-sm"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#800020] text-white transition-all shadow-sm"
                aria-label="Facebook"
              >
                <FaFacebookF className="h-4.5 w-4.5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#800020] text-white transition-all shadow-sm"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-[#FFF8E7]/60 font-light leading-relaxed">
              Showroom Support: 10:00 AM - 8:00 PM IST<br />
              Email: support@kalanikethanknm.com
            </p>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-16 border-t border-[#D4AF37]/20 pt-8 text-center">
          <p className="text-xs text-[#FFF8E7]/50 font-light tracking-widest">
            © 2026 Kalanikethan KNM. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

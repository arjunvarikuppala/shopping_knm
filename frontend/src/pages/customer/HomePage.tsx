import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '@/services';
import { Product } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import TrustSection from '@/components/ui/TrustSection';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes] = await Promise.all([
          productApi.getFeatured(),
          productApi.getNewArrivals(),
        ]);
        setFeatured(featuredRes.data.data as Product[]);
        setNewArrivals(newRes.data.data as Product[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#2C1810] text-white">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-transparent to-transparent z-0" />
        <div className="container-app relative z-10 flex min-h-[600px] flex-col items-center justify-center py-24 text-center md:min-h-[700px]">
          <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl text-[#D4AF37] drop-shadow-lg">
            Kalanikethan <span className="text-3xl">(KNM)</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-[#FFFFF0] font-light tracking-wide drop-shadow-md">
            Timeless Elegance in Every Drape
          </p>
          <div className="mt-10">
            <Link to="/products">
              <button className="px-8 py-4 bg-[#800000] text-white font-medium tracking-wider hover:bg-[#A52A2A] transition-colors border border-[#800000] shadow-lg">
                Explore Collection
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-[#800000]">Curated Collections</h2>
          <div className="mx-auto mt-4 h-1 w-24 bg-[#D4AF37]"></div>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { name: 'Kanjivaram Sarees', img: 'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=400&q=80' },
            { name: 'Banarasi Sarees', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Silk Sarees', img: 'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=400&q=80' },
            { name: 'Cotton Sarees', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Organza Sarees', img: 'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=400&q=80' },
            { name: 'Party Wear Sarees', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Bridal Collection', img: 'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=400&q=80' },
            { name: 'Festival Collection', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${cat.name.toLowerCase().replace(' ', '-')}`}
              className="group relative h-80 overflow-hidden bg-[#2C1810] shadow-sm transition-all hover:shadow-xl"
            >
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/90 to-transparent" />
              <div className="absolute bottom-0 w-full p-6 text-center">
                <h3 className="font-display text-xl font-bold text-[#FFFFF0] group-hover:text-[#D4AF37] transition-colors">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#FFFFF0] py-20">
        <div className="container-app">
          <div className="mb-10 flex items-center justify-between border-b border-[#E5DCC5] pb-4">
            <h2 className="font-display text-3xl font-bold text-[#800000]">Signature Collection</h2>
            <Link to="/products?featured=true" className="text-sm font-medium tracking-wide text-[#800000] hover:text-[#D4AF37]">
              View All Collection →
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </div>
      </section>

      {/* Promotions Banner */}
      <section className="container-app py-16">
        <div className="overflow-hidden rounded-none border border-[#D4AF37] bg-[#FFFFF0] p-8 text-center md:p-16 relative">
          <div className="absolute inset-0 bg-[#800000]/5" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#800000]">Exclusive Offer</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl text-[#2C1810]">Festive Elegance Sale</h2>
            <p className="mt-4 text-[#8C7B75] text-lg">Embrace the season with up to 40% off on our handwoven masterpieces.</p>
            <Link to="/products" className="mt-8 inline-block">
              <button className="px-8 py-3 bg-transparent border-2 border-[#800000] text-[#800000] font-medium tracking-wider hover:bg-[#800000] hover:text-white transition-colors">
                Discover the Collection
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-app py-16">
        <div className="mb-10 flex items-center justify-between border-b border-[#E5DCC5] pb-4">
          <h2 className="font-display text-3xl font-bold text-[#800000]">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-sm font-medium tracking-wide text-[#800000] hover:text-[#D4AF37]">
            View All Collection →
          </Link>
        </div>
        <ProductGrid products={newArrivals} loading={loading} />
      </section>

      <TrustSection />
      <WhatsAppButton />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '@/services';
import { Product } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import TrustSection from '@/components/ui/TrustSection';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaStar, FaRegStar } from 'react-icons/fa';
import { useAppSelector } from '@/app/hooks';
import { reviewApi } from '@/services';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/services/api';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const res = await productApi.getAll({ limit: 100 });
        setProducts(res.data.data as Product[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Filter products locally for home sections
  const newArrivals = products.slice(0, 4);
  const trendingCollections = products.filter((p) => p.isFeatured).slice(0, 4);
  const silkSarees = products.filter((p) => p.fabric === 'Silk').slice(0, 4);
  const cottonSarees = products.filter((p) => p.fabric === 'Cotton' || p.fabric === 'Linen').slice(0, 4);
  const weddingCollections = products.filter((p) => p.occasion === 'Wedding').slice(0, 4);
  const partyWearCollections = products.filter((p) => p.occasion === 'Party Wear').slice(0, 4);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchStoreReviews = async () => {
    try {
      const res = await reviewApi.getAll();
      setStoreReviews(res.data.data as any[]);
    } catch (err) {
      console.error(getErrorMessage(err));
    }
  };

  useEffect(() => {
    fetchStoreReviews();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!reviewForm.comment.trim()) {
      setReviewError('Feedback message cannot be empty');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      await reviewApi.create({
        name: user.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success('Thank you for your feedback!');
      setReviewForm({ rating: 5, comment: '' });
      fetchStoreReviews(); // Refresh the carousel
    } catch (err) {
      setReviewError(getErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  const hardcodedReviews = [
    {
      name: 'Ananya Sharma',
      role: 'Bride',
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      text: 'The crimson Kanjivaram was absolutely breathtaking! The gold zari work is pure and heavy, just like heirloom collections. Exceeded all my expectations for my wedding day.',
    },
    {
      name: 'Priya Nair',
      role: 'Fashion Blogger',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      text: 'Beautiful linen saree from Kalanikethan! Incredibly breathable for summers yet looks extremely formal with the zari borders. Love the craftsmanship.',
    },
    {
      name: 'Meenakshi Iyer',
      role: 'Regular Customer',
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      text: 'I bought the Patola Silk saree for a family festival. The quality of the silk is rich, colors are vibrant, and the look is completely regal. Highly recommended!',
    },
    {
      name: 'Deepa Reddy',
      role: 'Software Engineer',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
      rating: 4.9,
      text: 'Extremely prompt delivery and secure packaging. The georgette mirror work saree has a perfect fall. Will definitely purchase more sarees from here.',
      date: 'Recent'
    },
  ];

  const displayReviews = [
    ...storeReviews.map(r => ({
      id: r._id,
      name: r.name,
      role: 'Verified Customer',
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=7A0019&color=D4AF37`,
      rating: r.rating,
      text: r.comment,
      date: new Date(r.createdAt).toLocaleDateString()
    })),
    ...hardcodedReviews.map((r, i) => ({ ...r, id: `hardcoded-${i}` }))
  ];

  return (
    <div className="bg-[#FFF8E7] overflow-hidden min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] min-h-[550px] bg-[#2C1810] text-white flex items-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-overlay"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C1810]/90 via-[#2C1810]/50 to-transparent z-0" />
        
        <div className="container-app relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-2xl text-left space-y-6"
          >
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-[#D4AF37] block">
              Luxury Handloom Showroom
            </span>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-white">
              Kalanikethan <span className="text-[#D4AF37]">(KNM)</span>
            </h1>
            <p className="font-display text-2xl md:text-3xl text-[#FFF8E7]/90 font-light tracking-wide italic">
              Premium Saree Collections
            </p>
            <div className="h-[2px] w-24 bg-[#D4AF37] my-4" />
            <p className="text-base md:text-lg text-[#FFF8E7]/70 font-light max-w-lg leading-relaxed">
              Elegance in Every Drape. Discover pure handloomed silks, lightweight linens, and majestic bridal wear directly from traditional weavers.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/products">
                <button className="px-8 py-4 bg-[#800020] hover:bg-[#A52A2A] text-white text-xs uppercase tracking-widest font-bold border border-[#800020] hover:border-[#D4AF37] transition-all shadow-lg cursor-pointer">
                  Shop Now
                </button>
              </Link>
              <Link to="/products?featured=true">
                <button className="px-8 py-4 bg-transparent hover:bg-white/10 text-white text-xs uppercase tracking-widest font-bold border border-white hover:border-[#D4AF37] transition-all shadow-lg cursor-pointer">
                  Explore Collections
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. New Arrivals */}
      <section className="py-20 bg-white">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Just Off The Loom
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-[#800020]">
              New Arrivals
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>
          <ProductGrid products={newArrivals} loading={loading} />
          <div className="text-center mt-12">
            <Link to="/products?sort=newest">
              <button className="px-7 py-3 bg-transparent border-2 border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white transition-all font-display text-xs uppercase tracking-widest font-bold cursor-pointer">
                View All New Arrivals
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Trending Collections */}
      <section className="py-20 bg-[#FFF8E7] border-t border-[#E5DCC5]/30">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Customer Favorites
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-[#800020]">
              Trending Collections
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>
          <ProductGrid products={trendingCollections} loading={loading} />
        </div>
      </section>

      {/* Promo Middle Banner */}
      <section className="py-24 relative bg-[#2C1810] text-center text-white">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            Festive Special
          </span>
          <h3 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
            The Royal Weave Collection
          </h3>
          <p className="text-base text-[#FFF8E7]/70 font-light max-w-xl mx-auto leading-relaxed">
            Embrace the cultural grandeur of pure silk. Handcrafted by master weavers with generational expertise.
          </p>
          <div className="pt-4">
            <Link to="/products?category=silk-sarees">
              <button className="px-8 py-3.5 bg-[#800020] text-white hover:bg-[#A52A2A] text-xs uppercase tracking-widest font-bold border border-[#800020] hover:border-[#D4AF37] transition-all cursor-pointer shadow-lg">
                Explore Silks
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Silk Sarees */}
      <section className="py-20 bg-white">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Lustrous & Imperial
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-[#800020]">
              Signature Silk Sarees
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>
          <ProductGrid products={silkSarees} loading={loading} />
          <div className="text-center mt-12">
            <Link to="/products?fabric=silk">
              <button className="px-7 py-3 bg-[#800020] text-white hover:bg-[#A52A2A] transition-all font-display text-xs uppercase tracking-widest font-bold cursor-pointer">
                View Silk Collection
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Cotton & Linen Sarees */}
      <section className="py-20 bg-[#FFF8E7] border-t border-[#E5DCC5]/30">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Elegant & Breathable
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-[#800020]">
              Cotton & Linen Sarees
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>
          <ProductGrid products={cottonSarees} loading={loading} />
          <div className="text-center mt-12">
            <Link to="/products?fabric=cotton">
              <button className="px-7 py-3 bg-transparent border-2 border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white transition-all font-display text-xs uppercase tracking-widest font-bold cursor-pointer">
                View Cottons & Linens
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Wedding Collections */}
      <section className="py-20 bg-white">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              The Bridal Edit
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-[#800020]">
              Wedding Collections
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>
          <ProductGrid products={weddingCollections} loading={loading} />
          <div className="text-center mt-12">
            <Link to="/products?occasion=wedding">
              <button className="px-7 py-3 bg-[#800020] text-white hover:bg-[#A52A2A] transition-all font-display text-xs uppercase tracking-widest font-bold cursor-pointer">
                Explore Bridal Showroom
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Party Wear Collections */}
      <section className="py-20 bg-[#FFF8E7] border-t border-[#E5DCC5]/30">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Cocktail & Festivity
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-[#800020]">
              Party Wear Collections
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>
          <ProductGrid products={partyWearCollections} loading={loading} />
          <div className="text-center mt-12">
            <Link to="/products?occasion=party-wear">
              <button className="px-7 py-3 bg-transparent border-2 border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white transition-all font-display text-xs uppercase tracking-widest font-bold cursor-pointer">
                View Party Wear
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Why Choose Kalanikethan KNM */}
      <section className="py-20 bg-white border-t border-[#E5DCC5]/30" id="about">
        <div className="container-app">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Our Heritage
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-[#800020]">
              Why Choose Kalanikethan KNM
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FFF8E7]/40 border border-[#E5DCC5]/40 rounded-2xl text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#800020]/5 text-[#800020] border border-[#D4AF37]/20 font-display text-2xl font-bold">
                1
              </div>
              <h3 className="font-display text-xl font-bold text-[#800020]">Handloom Heritage</h3>
              <p className="text-sm text-[#8C7B75] leading-relaxed font-light">
                We work directly with master weaver cooperatives in Kanchipuram, Banaras, and Bengal. Every saree helps preserve century-old Indian weaving arts.
              </p>
            </div>

            <div className="p-8 bg-[#FFF8E7]/40 border border-[#E5DCC5]/40 rounded-2xl text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#800020]/5 text-[#800020] border border-[#D4AF37]/20 font-display text-2xl font-bold">
                2
              </div>
              <h3 className="font-display text-xl font-bold text-[#800020]">Certified Fabric Purity</h3>
              <p className="text-sm text-[#8C7B75] leading-relaxed font-light">
                No compromises on authenticity. Our silk sarees carry official silk purity certifications, guaranteeing authentic silk threads and real metallic zari.
              </p>
            </div>

            <div className="p-8 bg-[#FFF8E7]/40 border border-[#E5DCC5]/40 rounded-2xl text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#800020]/5 text-[#800020] border border-[#D4AF37]/20 font-display text-2xl font-bold">
                3
              </div>
              <h3 className="font-display text-xl font-bold text-[#800020]">Generational Quality</h3>
              <p className="text-sm text-[#8C7B75] leading-relaxed font-light">
                Our sarees are designed to be heirloom masterpieces. Detailed borders, heavily-detailed pallus, and tight thread densities mean they will last for generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Customer Reviews */}
      <section className="py-20 bg-[#FFF8E7] border-t border-[#E5DCC5]/30">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Testimonials
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-[#800020]">
              Customer Reviews
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37]"></div>
          </div>

          {/* Horizontal Scrolling Reviews Wrapper */}
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-[#D4AF37] scrollbar-track-[#FFF8E7]">
            {displayReviews.map((rev) => (
              <div
                key={rev.id}
                className="flex-shrink-0 w-80 bg-white border border-[#E5DCC5]/40 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#D4AF37] gap-0.5 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        i < Math.floor(rev.rating) ? <FaStar key={i} /> : <FaRegStar key={i} />
                      ))}
                    </div>
                    {rev.date && <span className="text-[10px] text-gray-400 font-semibold">{rev.date}</span>}
                  </div>
                  <FaQuoteLeft className="text-[#800020]/10 text-3xl" />
                  <p className="text-sm text-[#2C1810] font-light leading-relaxed italic line-clamp-4">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#E5DCC5]/20 mt-4">
                  <img
                    src={rev.img}
                    alt={rev.name}
                    className="h-10 w-10 rounded-full object-cover border border-[#D4AF37]/50"
                  />
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#800020]">{rev.name}</h4>
                    <span className="text-[10px] text-[#8C7B75] uppercase tracking-wider">{rev.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 10. Share Your Experience Form */}
          {user?.role !== 'admin' && (
            <div className="max-w-2xl mx-auto mt-12 p-8 bg-white border border-[#E5DCC5]/60 rounded-[16px] shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-8">
                <h3 className="font-display text-2xl font-bold text-[#7A0019]">Share Your Experience</h3>
                <p className="text-[#8C7B75] mt-2">We would love to hear your feedback.</p>
              </div>
              {!isAuthenticated ? (
                <div className="text-center p-8 bg-[#F8F4E8] rounded-xl border border-[#E5DCC5]/40">
                  <p className="text-[#800020] font-bold">Please login to share your feedback.</p>
                  <Link to="/login" className="mt-4 inline-block px-8 py-3 bg-[#7A0019] text-white text-xs uppercase tracking-widest font-bold rounded-full hover:bg-[#5A0012] transition-colors shadow-md">
                    Login to Review
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  {reviewError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                      {reviewError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-2 uppercase tracking-widest">Name</label>
                    <input 
                      type="text" 
                      value={user?.name || ''} 
                      disabled
                      className="w-full border border-[#E5DCC5]/60 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed font-medium text-sm"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-2 uppercase tracking-widest">Rating</label>
                    <div className="flex gap-2 text-[#D4AF37] text-3xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="focus:outline-none transform hover:scale-110 transition-transform cursor-pointer"
                        >
                          {star <= reviewForm.rating ? <FaStar /> : <FaRegStar />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-2 uppercase tracking-widest">Feedback</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Write your experience with Kalanikethan KNM..."
                      maxLength={250}
                      className="w-full border border-[#E5DCC5]/60 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] min-h-[120px] resize-y text-sm font-medium text-[#2C1810] bg-[#F8F4E8]/30"
                      required
                    ></textarea>
                    <div className="text-right text-[10px] text-gray-400 mt-1 font-bold tracking-widest">
                      {reviewForm.comment.length}/250
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-[#7A0019] text-white py-4 rounded-[16px] text-xs font-bold uppercase tracking-widest hover:bg-[#5A0012] transition-colors shadow-md disabled:opacity-70 cursor-pointer"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust badges and WhatsApp Support */}
      <TrustSection />
      <WhatsAppButton />
    </div>
  );
}

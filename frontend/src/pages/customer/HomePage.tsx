import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi } from '@/services';
import { Product, Category } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, catRes] = await Promise.all([
          productApi.getFeatured(),
          productApi.getNewArrivals(),
          categoryApi.getAll(),
        ]);
        setFeatured(featuredRes.data.data as Product[]);
        setNewArrivals(newRes.data.data as Product[]);
        setCategories(catRes.data.data as Category[]);
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
      <section className="relative bg-primary text-white">
        <div className="container-app flex min-h-[500px] flex-col items-center justify-center py-20 text-center md:min-h-[600px]">
          <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
            Elevate Your <span className="text-accent">Style</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-300">
            Discover premium fashion curated for the modern wardrobe. Quality fabrics, timeless designs.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/products">
              <Button size="lg">Shop Now</Button>
            </Link>
            <Link to="/products?featured=true">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Featured
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="group card flex flex-col items-center p-6 text-center transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl">
                👔
              </div>
              <h3 className="font-semibold group-hover:text-accent">{cat.name}</h3>
              <p className="mt-1 text-sm text-muted line-clamp-2">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-surface py-16">
        <div className="container-app">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products?featured=true" className="text-sm font-medium text-accent hover:underline">
              View All →
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </div>
      </section>

      {/* Promotions Banner */}
      <section className="container-app py-16">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-primary p-8 text-white md:p-12">
          <div className="max-w-lg">
            <p className="text-sm font-medium uppercase tracking-wider text-accent/80">Limited Time</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Summer Sale — Up to 40% Off</h2>
            <p className="mt-3 text-gray-200">Refresh your wardrobe with our seasonal collection at unbeatable prices.</p>
            <Link to="/products" className="mt-6 inline-block">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Shop Sale
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-app py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-sm font-medium text-accent hover:underline">
            View All →
          </Link>
        </div>
        <ProductGrid products={newArrivals} loading={loading} />
      </section>
    </div>
  );
}

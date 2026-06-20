import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '@/services';
import { Product, Category } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [filters, setFilters] = useState({ search, minPrice, maxPrice });

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.data.data as Category[]));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: 12, sort };
        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice) params.minPrice = parseFloat(minPrice);
        if (maxPrice) params.maxPrice = parseFloat(maxPrice);
        if (featured) params.featured = true;

        const { data } = await productApi.getAll(params);
        setProducts(data.data as Product[]);
        if (data.meta) setMeta(data.meta);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, sort, minPrice, maxPrice, featured, page]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const applyFilters = () => {
    updateParam('search', filters.search);
    updateParam('minPrice', filters.minPrice);
    updateParam('maxPrice', filters.maxPrice);
  };

  return (
    <div className="container-app py-8">
      <h1 className="mb-8 text-3xl font-bold">Shop All Products</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card space-y-4 p-4">
            <h3 className="font-semibold">Filters</h3>

            <Input
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search products..."
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.slug, label: c.name })),
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="0"
              />
              <Input
                label="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="999"
              />
            </div>

            <Select
              label="Sort By"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Top Rated' },
              ]}
            />

            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <p className="mb-4 text-sm text-muted">{meta.total} products found</p>
          <ProductGrid products={products} loading={loading} />

          {meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', p.toString())}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    p === page ? 'bg-accent text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

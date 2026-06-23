import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '@/services';
import { Product } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import { FaFilter, FaTimes } from 'react-icons/fa';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Retrieve search filters from URL parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const fabric = searchParams.get('fabric') || '';
  const color = searchParams.get('color') || '';
  const occasion = searchParams.get('occasion') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: 12, sort };
        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice) params.minPrice = parseFloat(minPrice);
        if (maxPrice) params.maxPrice = parseFloat(maxPrice);
        if (fabric) params.fabric = fabric;
        if (color) params.color = color;
        if (occasion) params.occasion = occasion;

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
  }, [search, category, sort, minPrice, maxPrice, fabric, color, occasion, page]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(params);
  };

  const handlePriceRangeChange = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams);
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');

    params.set('page', '1');
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setShowMobileFilters(false);
  };

  // Static options based on user requirements
  const fabrics = ['Silk', 'Cotton', 'Linen', 'Georgette'];
  const occasions = ['Wedding', 'Party Wear', 'Daily Wear', 'Festive'];
  const colors = [
    { name: 'Red', hex: '#800020' }, // Maroon / Red
    { name: 'Green', hex: '#2E7D32' },
    { name: 'Blue', hex: '#1565C0' },
    { name: 'Pink', hex: '#E91E63' },
    { name: 'Purple', hex: '#4A148C' },
  ];

  const priceRanges = [
    { label: 'All Prices', min: '', max: '' },
    { label: 'Under ₹1,000', min: '0', max: '1000' },
    { label: '₹1,000 – ₹3,000', min: '1000', max: '3000' },
    { label: '₹3,000 – ₹5,000', min: '3000', max: '5000' },
    { label: 'Above ₹5,000', min: '5000', max: '99999' },
  ];

  const isPriceRangeSelected = (min: string, max: string) => {
    return minPrice === min && maxPrice === max;
  };

  const FilterSidebar = () => (
    <div className="space-y-8 bg-white p-6 border border-[#E5DCC5]/40 rounded-2xl">
      <div className="flex items-center justify-between border-b border-[#E5DCC5]/40 pb-4">
        <h3 className="font-display text-lg font-bold text-[#800020]">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-xs font-semibold text-[#8C7B75] hover:text-[#800020] transition-colors uppercase tracking-wider cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Fabric Filter */}
      <div className="space-y-3">
        <h4 className="font-display text-sm font-bold text-[#2C1810] uppercase tracking-wider">
          Fabric
        </h4>
        <div className="flex flex-col gap-2">
          {fabrics.map((fab) => (
            <button
              key={fab}
              onClick={() => updateParam('fabric', fabric === fab ? '' : fab)}
              className={`flex items-center justify-between py-1.5 px-3 text-sm rounded-lg transition-all text-left ${
                fabric === fab
                  ? 'bg-[#800020]/5 text-[#800020] font-bold border border-[#800020]/20'
                  : 'text-[#8C7B75] hover:text-[#2C1810]'
              }`}
            >
              <span>{fab}</span>
              {fabric === fab && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="space-y-3">
        <h4 className="font-display text-sm font-bold text-[#2C1810] uppercase tracking-wider">
          Color
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {colors.map((col) => (
            <button
              key={col.name}
              onClick={() => updateParam('color', color === col.name ? '' : col.name)}
              className={`relative h-8 w-8 rounded-full border shadow-xs transition-transform duration-200 hover:scale-110 flex items-center justify-center cursor-pointer ${
                color === col.name ? 'ring-2 ring-[#D4AF37] scale-105' : 'border-gray-200'
              }`}
              style={{ backgroundColor: col.hex }}
              title={col.name}
            >
              {color === col.name && (
                <span className="text-white text-[10px] drop-shadow-md">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <h4 className="font-display text-sm font-bold text-[#2C1810] uppercase tracking-wider">
          Price Range
        </h4>
        <div className="flex flex-col gap-2">
          {priceRanges.map((range, i) => (
            <button
              key={i}
              onClick={() => handlePriceRangeChange(range.min, range.max)}
              className={`flex items-center justify-between py-1.5 px-3 text-sm rounded-lg transition-all text-left ${
                isPriceRangeSelected(range.min, range.max)
                  ? 'bg-[#800020]/5 text-[#800020] font-bold border border-[#800020]/20'
                  : 'text-[#8C7B75] hover:text-[#2C1810]'
              }`}
            >
              <span>{range.label}</span>
              {isPriceRangeSelected(range.min, range.max) && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Occasion Filter */}
      <div className="space-y-3">
        <h4 className="font-display text-sm font-bold text-[#2C1810] uppercase tracking-wider">
          Occasion
        </h4>
        <div className="flex flex-col gap-2">
          {occasions.map((occ) => (
            <button
              key={occ}
              onClick={() => updateParam('occasion', occasion === occ ? '' : occ)}
              className={`flex items-center justify-between py-1.5 px-3 text-sm rounded-lg transition-all text-left ${
                occasion === occ
                  ? 'bg-[#800020]/5 text-[#800020] font-bold border border-[#800020]/20'
                  : 'text-[#8C7B75] hover:text-[#2C1810]'
              }`}
            >
              <span>{occ}</span>
              {occasion === occ && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FFF8E7] min-h-screen py-10">
      <div className="container-app">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Exquisite Showroom
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold text-[#800020]">
            Our Saree Catalogue
          </h1>
          <div className="mx-auto mt-3 h-[2px] w-20 bg-[#D4AF37]"></div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white border border-[#E5DCC5]/40 rounded-xl p-4 mb-8 shadow-xs">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 lg:hidden px-4 py-2 bg-[#800020] text-white rounded-lg text-sm font-medium cursor-pointer"
          >
            <FaFilter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
          
          <p className="text-sm text-[#8C7B75] font-light hidden lg:block">
            Showing <span className="font-bold text-[#2C1810]">{meta.total}</span> beautiful designs
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2C1810] hidden sm:inline">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="rounded-lg border border-[#E5DCC5] bg-[#FFF8E7]/30 px-3 py-1.5 text-xs font-medium text-[#2C1810] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="newest">Newest Weaves</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Catalog Layout */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterSidebar />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <p className="mb-4 text-xs text-[#8C7B75] lg:hidden">
              Found <span className="font-bold text-[#2C1810]">{meta.total}</span> designs
            </p>
            <ProductGrid products={products} loading={loading} />

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParam('page', p.toString())}
                    className={`rounded-lg px-4 py-2 font-display text-sm font-bold shadow-xs transition-colors cursor-pointer ${
                      p === page
                        ? 'bg-[#800020] text-white'
                        : 'bg-white text-[#2C1810] hover:bg-gray-100 border border-[#E5DCC5]/40'
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

      {/* Mobile Drawer Filters */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setShowMobileFilters(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative flex w-80 max-w-full flex-col bg-[#FFF8E7] p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DCC5]/40 pb-4 mb-6">
              <span className="font-display text-lg font-bold text-[#800020]">Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full p-2 text-[#2C1810] hover:bg-[#800020]/5 cursor-pointer"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { SHOP_BY_CONCERNS } from '../lib/seedData';

export const CollectionsPage: React.FC = () => {
  const { categories, products } = useStore();

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-24 md:py-12 space-y-8 sm:space-y-12">
      {/* Commercial Storefront Header */}
      <div className="bg-[#141413] text-[#FAF8F5] p-6 sm:p-10 border border-[#2C2A27] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] font-semibold">
            Cartlane Grooming Store · Curated Verticals
          </p>
          <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-white leading-tight">
            Shop by Grooming Collection
          </h1>
          <p className="text-xs sm:text-sm text-[#D6D3D1] leading-relaxed">
            Explore specialized men&apos;s grooming formulations across Fine Fragrances, Activated Bamboo Charcoal Skincare, Argan Beard Care, Hair Growth, and Luxury Gift Boxes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/products"
            className="px-5 py-3 bg-[#8C6239] hover:bg-[#A37446] text-white text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            View All {products.length} Products →
          </Link>
          <Link
            to="/offers"
            className="px-4 py-3 border border-[#3F3B36] hover:border-[#D4AF37] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            Active Coupons
          </Link>
        </div>
      </div>

      {/* 6 Primary Grooming Verticals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.slug);
          const count = catProducts.length;
          const startingPrice =
            catProducts.length > 0
              ? Math.min(...catProducts.map((p) => p.price))
              : 249;

          return (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="group border border-[#E5E0D8] bg-white flex flex-col justify-between overflow-hidden hover:border-[#141413] active:scale-[0.99] transition-all shadow-xs"
            >
              <div className="relative aspect-square sm:aspect-[4/3] bg-[#F3EFEA] overflow-hidden">
                <img
                  src={getOptimizedImageUrl(cat.image, 640)}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#141413]/90 text-[#FAF8F5] text-[10px] font-mono-tabular uppercase tracking-wider">
                  {count} Formulations
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white/95 text-[#141413] text-[10px] font-mono-tabular font-bold border border-[#E5E0D8]">
                  From ₹{startingPrice}
                </span>
              </div>
              <div className="p-3.5 sm:p-6 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-[#8C6239] font-semibold">
                    Cartlane Signature Range
                  </p>
                  <h2 className="font-serif-display text-lg sm:text-2xl font-bold text-[#141413] group-hover:text-[#8C6239] transition-colors line-clamp-1">
                    {cat.name}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#57534E] leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#ECE7DF] flex items-center justify-between text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#141413] group-hover:text-[#8C6239]">
                  <span>Shop Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Shop By Grooming Concern Section */}
      <section className="pt-4 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5E0D8] pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
              Targeted Solutions
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
              Shop by Grooming Concern
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold uppercase tracking-wider text-[#141413] hover:text-[#8C6239]"
          >
            Explore All Concerns →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {SHOP_BY_CONCERNS.map((concern) => (
            <Link
              key={concern.id}
              to={`/products?concern=${encodeURIComponent(concern.query)}`}
              className="group bg-[#F3EFEA] border border-[#E5E0D8] hover:border-[#141413] p-3 sm:p-4 flex items-center gap-3 transition-all"
            >
              <img
                src={getOptimizedImageUrl(concern.image, 160)}
                alt={concern.title}
                referrerPolicy="no-referrer"
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover bg-white border border-[#E5E0D8] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#141413] group-hover:text-[#8C6239] truncate">
                  {concern.title}
                </p>
                <p className="text-[11px] text-[#57534E] line-clamp-1">
                  {concern.subtitle}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#8C6239]">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export const CollectionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, products } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const category = categories.find((c) => c.slug === slug);

  const collectionProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (slug && slug !== 'all' && p.category !== slug) return false;
      if (inStockOnly && p.stock <= 0) return false;
      return true;
    });
    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')
      return [...list].sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
    if (sortBy === 'discount')
      return [...list].sort((a, b) => b.discountPercent - a.discountPercent);
    return list;
  }, [products, slug, sortBy, inStockOnly]);

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-4 pb-24 md:py-10 space-y-6 sm:space-y-8">
      {/* Breadcrumb + Collection Hero Card */}
      <div className="bg-[#141413] text-[#FAF8F5] border border-[#2C2A27] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#A8A29E]">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-white">
              Collections
            </Link>
            <span>/</span>
            <span className="text-[#D4AF37] font-semibold">
              {category?.name || slug}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {category?.name || 'Curated Grooming Collection'}
            </h1>
            <p className="text-xs sm:text-sm text-[#D6D3D1] max-w-2xl leading-relaxed">
              {category?.description ||
                'Dermatologically tested formulations crafted with pure botanical extracts, essential oils, and long-lasting aromatic profiles.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-[#D6D3D1] font-mono-tabular">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              {collectionProducts.length} Authentic Products
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Free Delivery Above ₹499
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Paraben &amp; Sulphate Free
            </span>
          </div>
        </div>

        {category?.image && (
          <div className="hidden lg:block lg:col-span-4 bg-[#1F1E1C] max-h-64 overflow-hidden">
            <img
              src={getOptimizedImageUrl(category.image, 600)}
              alt={category.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        )}
      </div>

      {/* Quick Category Switcher Strip (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#E5E0D8]">
        <Link
          to="/products"
          className="shrink-0 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border border-[#E5E0D8] bg-white text-[#57534E] hover:border-[#141413] hover:text-[#141413] transition-colors"
        >
          All Products ({products.length})
        </Link>
        {categories.map((cat) => {
          const active = cat.slug === slug;
          const cnt = products.filter((p) => p.category === cat.slug).length;
          return (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className={`shrink-0 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                active
                  ? 'bg-[#141413] text-white border-[#141413]'
                  : 'bg-[#F3EFEA] text-[#57534E] border-[#E5E0D8] hover:border-[#141413] hover:text-[#141413]'
              }`}
            >
              {cat.name} ({cnt})
            </Link>
          );
        })}
      </div>

      {/* Toolbar: In-stock toggle + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F3EFEA] border border-[#E5E0D8] px-4 py-3">
        <label className="inline-flex items-center gap-2 text-xs font-medium text-[#141413] cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-[#141413]"
          />
          <span>Show In-Stock Only ({collectionProducts.length} items)</span>
        </label>

        <div className="flex items-center gap-2">
          <label className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">
            Sort By:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 bg-white border border-[#D6D3D1] px-3 text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
          >
            <option value="featured">Featured Bestsellers</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount">Highest Discount %</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {collectionProducts.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-[#F3EFEA] border border-[#E5E0D8]">
          <p className="font-serif-display text-2xl text-[#141413]">
            No formulations found in this collection
          </p>
          <p className="text-xs text-[#57534E] max-w-md mx-auto">
            Explore our complete men&apos;s grooming range or switch to another category tab above.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {collectionProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </main>
  );
};

export const ProductsPage: React.FC = () => {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || 'all';
  const urlConcern = searchParams.get('concern') || 'all';

  const [queryText, setQueryText] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedConcern, setSelectedConcern] = useState(urlConcern);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'
  >('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync when URL query params change (e.g., from Navbar or Concern cards)
  useEffect(() => {
    setQueryText(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedConcern(searchParams.get('concern') || 'all');
  }, [searchParams]);

  const concerns = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.concern) set.add(p.concern);
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (
          selectedConcern !== 'all' &&
          !(p.concern || '').toLowerCase().includes(selectedConcern.toLowerCase())
        ) {
          return false;
        }
        if (p.price > maxPrice) return false;
        if (inStockOnly && p.stock <= 0) return false;
        if (queryText.trim()) {
          const q = queryText.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.shortDescription.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchConcern = (p.concern || '').toLowerCase().includes(q);
          const matchIng = (p.ingredients || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat && !matchConcern && !matchIng)
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.ratingAvg || 0) - (a.ratingAvg || 0);
        if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
        return Number(b.isFeatured) - Number(a.isFeatured);
      });
  }, [products, selectedCategory, selectedConcern, maxPrice, inStockOnly, queryText, sortBy]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedConcern !== 'all' ? 1 : 0) +
    (maxPrice < 2500 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const popularSuggestions = [
    'Charcoal',
    'Blanc',
    'Vitamin C',
    'Beard Oil',
    'Salicylic Acid',
    'Gift Kit',
  ];

  const resetAllFilters = () => {
    setQueryText('');
    setSelectedCategory('all');
    setSelectedConcern('all');
    setMaxPrice(2500);
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-24 md:py-12 space-y-6 sm:space-y-8">
      {/* Header & Search Input */}
      <div className="border-b border-[#E5E0D8] pb-5 sm:pb-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
              Cartlane Official Store · Complete Catalog
            </p>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#141413]">
              All Men&apos;s Grooming Formulations
            </h1>
          </div>
          <p className="text-xs font-mono-tabular text-[#57534E]">
            Showing {filtered.length} of {products.length} formulations
          </p>
        </div>

        {/* Interactive Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#141413] text-white border-[#141413]'
                : 'bg-white text-[#57534E] border-[#E5E0D8] hover:border-[#141413]'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => {
            const cnt = products.filter((p) => p.category === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                  isSelected
                    ? 'bg-[#141413] text-white border-[#141413]'
                    : 'bg-white text-[#57534E] border-[#E5E0D8] hover:border-[#141413]'
                }`}
              >
                {cat.name} ({cnt})
              </button>
            );
          })}
        </div>

        {/* Search & Quick Suggestions */}
        <div className="space-y-2.5">
          <div className="relative max-w-2xl">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={queryText}
              onChange={(e) => {
                setQueryText(e.target.value);
                setSearchParams(e.target.value ? { q: e.target.value } : {});
              }}
              placeholder="Search Charcoal, Blanc, Vitamin C, Beard Oil, SPF 50..."
              className="w-full h-11 bg-white border border-[#D6D3D1] pl-10 pr-4 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs text-[#78716C] py-0.5">
            <span className="shrink-0 font-semibold text-[#141413]">Popular Searches:</span>
            {popularSuggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQueryText(term)}
                className="px-2.5 py-1 bg-[#F3EFEA] border border-[#E5E0D8] hover:border-[#141413] text-[#141413] transition-colors whitespace-nowrap shrink-0"
              >
                {term}
              </button>
            ))}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-800 font-semibold whitespace-nowrap shrink-0"
              >
                Clear Filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE COMPACT FILTER & SORT BAR (lg:hidden) */}
      <div className="lg:hidden flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 min-h-[44px] px-4 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </span>
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          aria-label="Sort products"
          className="flex-1 min-h-[44px] bg-white border border-[#141413] px-3 text-xs font-semibold uppercase tracking-wider text-[#141413]"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>

      {/* DESKTOP INLINE FILTERS & SORTING BAR (hidden lg:grid) */}
      <div className="hidden lg:grid p-5 bg-[#F3EFEA] border border-[#E5E0D8] grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#57534E] mb-1.5">
            Category Vertical
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-[#D6D3D1] px-3 py-2 text-xs text-[#141413]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#57534E] mb-1.5">
            Shop by Concern
          </label>
          <select
            value={selectedConcern}
            onChange={(e) => setSelectedConcern(e.target.value)}
            className="w-full bg-white border border-[#D6D3D1] px-3 py-2 text-xs text-[#141413]"
          >
            <option value="all">All Concerns</option>
            {concerns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#57534E] mb-1.5 font-mono-tabular">
            Max Price: ₹{maxPrice.toLocaleString('en-IN')}
          </label>
          <input
            type="range"
            min={200}
            max={2500}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-[#8C6239]"
          />
        </div>

        <div className="flex items-center gap-2 pt-4">
          <input
            id="instock-toggle"
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-[#141413]"
          />
          <label htmlFor="instock-toggle" className="text-xs font-medium text-[#141413]">
            In-Stock Items Only
          </label>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#57534E] mb-1.5">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full bg-white border border-[#D6D3D1] px-3 py-2 text-xs text-[#141413]"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="discount">Highest Savings %</option>
          </select>
        </div>
      </div>

      {/* Product Grid (2-Col on Mobile, 3-Col on Desktop) */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-[#F3EFEA] border border-[#E5E0D8] space-y-4">
          <SlidersHorizontal className="w-8 h-8 text-[#8C6239] mx-auto" />
          <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
            No matching formulations found
          </h2>
          <p className="text-xs text-[#57534E] max-w-md mx-auto">
            Try clearing your search filter or expanding the price slider to view our complete men&apos;s grooming range.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="min-h-[42px] px-6 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* SLIDE-UP MOBILE FILTER BOTTOM SHEET */}
      {mobileFilterOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="bg-[#FAF8F5] rounded-t-3xl border-t border-[#E5E0D8] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-3 pb-2 px-5 flex items-center justify-between border-b border-[#ECE7DF]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#141413]">
                Filter Formulations
              </span>
              <div className="w-10 h-1.5 bg-[#D6D3D1] rounded-full" />
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filter sheet"
                className="w-9 h-9 flex items-center justify-center text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-2">
                  Category Vertical
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-11 bg-white border border-[#D6D3D1] px-3 text-xs text-[#141413]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-2">
                  Shop by Grooming Concern
                </label>
                <select
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                  className="w-full h-11 bg-white border border-[#D6D3D1] px-3 text-xs text-[#141413]"
                >
                  <option value="all">All Concerns</option>
                  {concerns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-2 font-mono-tabular">
                  Maximum Price: ₹{maxPrice.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min={200}
                  max={2500}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#8C6239]"
                />
              </div>

              <label className="min-h-[44px] flex items-center gap-3 p-3 bg-white border border-[#E5E0D8] text-xs font-semibold text-[#141413]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#141413]"
                />
                <span>Show In-Stock Formulations Only</span>
              </label>
            </div>

            <div className="p-4 bg-[#F3EFEA] border-t border-[#E5E0D8] grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="min-h-[46px] border border-[#141413] text-[#141413] text-xs font-semibold uppercase tracking-wider"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="min-h-[46px] bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider"
              >
                Show {filtered.length} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

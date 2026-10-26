import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-24 md:py-6 space-y-4">
      {/* Flipkart Storefront Header */}
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-[#2874F0] font-extrabold">
            Cartlane Grooming Superstore
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212121]">
            Shop by Grooming Category
          </h1>
          <p className="text-xs sm:text-sm text-[#878787] leading-relaxed">
            Explore specialized men&apos;s grooming formulations across Fine Fragrances, Activated Bamboo Charcoal Skincare, Argan Beard Care, Hair Growth, and Luxury Gift Boxes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/products"
            className="px-5 py-2.5 bg-[#2874F0] hover:bg-[#1E5BC6] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
          >
            View All {products.length} Products →
          </Link>
          <Link
            to="/offers"
            className="px-4 py-2.5 bg-[#FF9F00] hover:bg-[#FB641B] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
          >
            Top Offers
          </Link>
        </div>
      </div>

      {/* 6 Primary Grooming Verticals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
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
              className="group border border-[#E0E0E0] bg-white rounded-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition-all"
            >
              <div className="relative aspect-square sm:aspect-[4/3] bg-white p-3 overflow-hidden border-b border-[#F0F0F0]">
                <img
                  src={getOptimizedImageUrl(cat.image, 640)}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#2874F0] text-white text-[10px] font-mono-tabular font-bold uppercase rounded-xs">
                  {count} Items
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-[#E8F5E9] text-[#388E3C] text-[11px] font-mono-tabular font-extrabold rounded-xs">
                  From ₹{startingPrice}
                </span>
              </div>
              <div className="p-3.5 sm:p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h2 className="text-sm sm:text-lg font-extrabold text-[#212121] group-hover:text-[#2874F0] transition-colors line-clamp-1">
                    {cat.name}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#878787] leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-xs font-bold text-[#2874F0]">
                  <span>Explore Deals</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Shop By Grooming Concern Section */}
      <section className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#212121]">
              Shop by Grooming Concern
            </h2>
            <p className="text-xs text-[#878787]">
              Targeted dermatological &amp; botanical solutions
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#2874F0] hover:underline"
          >
            View All Products →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {SHOP_BY_CONCERNS.map((concern) => (
            <Link
              key={concern.id}
              to={`/products?concern=${encodeURIComponent(concern.concernQuery)}`}
              className="group bg-[#F8F9FA] border border-[#E0E0E0] hover:border-[#2874F0] rounded-xs p-3 flex items-center gap-3 transition-all"
            >
              <img
                src={getOptimizedImageUrl(concern.image, 160)}
                alt={concern.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover bg-white border border-[#E0E0E0] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#212121] group-hover:text-[#2874F0] truncate">
                  {concern.title}
                </p>
                <p className="text-[11px] text-[#388E3C] font-semibold line-clamp-1">
                  {concern.subtitle}
                </p>
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
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-24 md:py-6 space-y-3 sm:space-y-4">
      {/* Quick Category Switcher Strip */}
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-2xs">
        <Link
          to="/products"
          className="shrink-0 px-3.5 py-2 text-xs font-bold rounded-xs border border-[#E0E0E0] bg-[#F8F9FA] text-[#212121] hover:border-[#2874F0]"
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
              className={`shrink-0 px-3.5 py-2 text-xs font-bold rounded-xs border transition-colors ${
                active
                  ? 'bg-[#2874F0] text-white border-[#2874F0]'
                  : 'bg-white text-[#212121] border-[#E0E0E0] hover:border-[#2874F0]'
              }`}
            >
              {cat.name} ({cnt})
            </Link>
          );
        })}
      </div>

      {/* Main White Catalog Box */}
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-3 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F0F0F0] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#878787]">
              <Link to="/" className="hover:text-[#2874F0]">
                Home
              </Link>
              <span>›</span>
              <Link to="/collections" className="hover:text-[#2874F0]">
                Categories
              </Link>
              <span>›</span>
              <span className="text-[#212121] font-semibold">
                {category?.name || slug}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#212121]">
              {category?.name || 'Curated Collection'}{' '}
              <span className="text-xs font-normal text-[#878787]">
                (Showing {collectionProducts.length} products)
              </span>
            </h1>
          </div>

          {/* Flipkart Horizontal Sort Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#212121] mr-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#2874F0]"
              />
              <span>In-Stock Only</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 bg-[#F8F9FA] border border-[#E0E0E0] px-3 text-xs font-bold text-[#212121] rounded-xs focus:outline-none focus:border-[#2874F0]"
            >
              <option value="featured">Sort By: Popularity</option>
              <option value="price-asc">Price — Low to High</option>
              <option value="price-desc">Price — High to Low</option>
              <option value="discount">Discount — High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {collectionProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <p className="text-lg font-extrabold text-[#212121]">
              No products found in this category
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase rounded-xs"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {collectionProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
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

  const resetAllFilters = () => {
    setQueryText('');
    setSelectedCategory('all');
    setSelectedConcern('all');
    setMaxPrice(2500);
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-24 md:py-6">
      {/* FLIPKART 2-COLUMN SEARCH & CATALOG LAYOUT (Left Filter Sidebar + Right Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        {/* LEFT SIDEBAR: FLIPKART FILTERS PANEL (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E0E0E0] rounded-xs divide-y divide-[#F0F0F0] shadow-2xs sticky top-24">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#212121]">Filters</h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-extrabold uppercase text-[#2874F0] hover:underline"
              >
                CLEAR ALL
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="p-4 space-y-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#212121]">
              Categories
            </p>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`block w-full text-left py-1 ${
                  selectedCategory === 'all'
                    ? 'font-extrabold text-[#2874F0]'
                    : 'text-[#212121] hover:text-[#2874F0]'
                }`}
              >
                All Grooming ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`block w-full text-left py-1 ${
                    selectedCategory === cat.slug
                      ? 'font-extrabold text-[#2874F0]'
                      : 'text-[#212121] hover:text-[#2874F0]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Slider */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#212121]">
                Price
              </p>
              <span className="text-xs font-mono-tabular font-bold text-[#2874F0]">
                Up to ₹{maxPrice}
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={2500}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#2874F0]"
            />
          </div>

          {/* Grooming Concern */}
          <div className="p-4 space-y-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#212121]">
              Grooming Concern
            </p>
            <select
              value={selectedConcern}
              onChange={(e) => setSelectedConcern(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E0E0E0] px-2.5 py-2 text-xs text-[#212121] rounded-xs"
            >
              <option value="all">All Concerns</option>
              {concerns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="p-4">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-[#212121] cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#2874F0]"
              />
              <span>Exclude Out of Stock</span>
            </label>
          </div>
        </aside>

        {/* RIGHT COLUMN: SORT BAR + PRODUCT GRID */}
        <div className="lg:col-span-9 space-y-3">
          {/* Mobile Filter & Sort Bar */}
          <div className="lg:hidden flex items-center gap-2 bg-white p-2.5 border border-[#E0E0E0] rounded-xs">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 min-h-[40px] px-3 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-xs inline-flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort products"
              className="flex-1 min-h-[40px] bg-[#F8F9FA] border border-[#E0E0E0] px-2.5 text-xs font-bold text-[#212121] rounded-xs"
            >
              <option value="featured">Sort: Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          {/* Main Results Container */}
          <div className="bg-white border border-[#E0E0E0] rounded-xs p-3 sm:p-5 space-y-4 shadow-2xs">
            {/* Header & Flipkart Sort Tabs */}
            <div className="border-b border-[#F0F0F0] pb-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-base sm:text-xl font-extrabold text-[#212121]">
                    {queryText
                      ? `Search Results for "${queryText}"`
                      : "Cartlane Men's Grooming Store"}
                  </h1>
                  <p className="text-xs text-[#878787]">
                    Showing 1 – {filtered.length} of {products.length} products
                  </p>
                </div>

                {/* Quick Search Inside Catalog */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={queryText}
                    onChange={(e) => {
                      setQueryText(e.target.value);
                      setSearchParams(e.target.value ? { q: e.target.value } : {});
                    }}
                    placeholder="Filter by keyword..."
                    className="w-full h-9 bg-[#F8F9FA] border border-[#E0E0E0] pl-8 pr-3 text-xs text-[#212121] rounded-xs focus:outline-none focus:border-[#2874F0]"
                  />
                </div>
              </div>

              {/* Desktop Flipkart Horizontal Sort Bar */}
              <div className="hidden lg:flex items-center gap-6 text-xs pt-1">
                <span className="font-extrabold text-[#212121]">Sort By</span>
                {[
                  { id: 'featured', label: 'Popularity' },
                  { id: 'price-asc', label: 'Price — Low to High' },
                  { id: 'price-desc', label: 'Price — High to Low' },
                  { id: 'discount', label: 'Biggest Discount' },
                  { id: 'rating', label: 'Customer Rating' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSortBy(tab.id as typeof sortBy)}
                    className={`pb-1.5 transition-colors ${
                      sortBy === tab.id
                        ? 'text-[#2874F0] font-extrabold border-b-2 border-[#2874F0]'
                        : 'text-[#212121] hover:text-[#2874F0]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-lg font-extrabold text-[#212121]">
                  Sorry, no matching products found!
                </p>
                <p className="text-xs text-[#878787]">
                  Please check the spelling or try searching for something else.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase rounded-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SLIDE-UP MOBILE FILTER BOTTOM SHEET */}
      {mobileFilterOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl border-t border-[#E0E0E0] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-3 px-5 bg-[#2874F0] text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Filter Products
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filter sheet"
                className="w-8 h-8 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#212121] mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 bg-[#F8F9FA] border border-[#E0E0E0] px-3 text-xs text-[#212121] rounded-xs"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#212121] mb-2">
                  Grooming Concern
                </label>
                <select
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                  className="w-full h-10 bg-[#F8F9FA] border border-[#E0E0E0] px-3 text-xs text-[#212121] rounded-xs"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#212121] mb-2 font-mono-tabular">
                  Maximum Price: ₹{maxPrice.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min={200}
                  max={2500}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#2874F0]"
                />
              </div>

              <label className="min-h-[44px] flex items-center gap-3 p-3 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xs text-xs font-semibold text-[#212121]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#2874F0]"
                />
                <span>Exclude Out of Stock</span>
              </label>
            </div>

            <div className="p-4 bg-[#F8F9FA] border-t border-[#E0E0E0] grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="min-h-[44px] border border-[#E0E0E0] bg-white text-[#212121] text-xs font-bold uppercase tracking-wider rounded-xs"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="min-h-[44px] bg-[#FB641B] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs"
              >
                Apply ({filtered.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

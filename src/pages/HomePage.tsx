import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { SHOP_BY_CONCERNS } from '../lib/seedData';

export const HomePage: React.FC = () => {
  const { products, categories, banners, reviews, settings } = useStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeConcern, setActiveConcern] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const touchStartX = useRef<number | null>(null);
  const navigate = useNavigate();

  const heroBanners = useMemo(() => {
    const list = banners.filter((b) => b.placement === 'hero' && b.active);
    return list.length > 0 ? list : banners.slice(0, 4);
  }, [banners]);

  const promoBanners = useMemo(
    () => banners.filter((b) => b.placement === 'promo' && b.active).slice(0, 2),
    [banners]
  );

  // Auto-advance hero banner carousel every 5.5 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBanners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const currentHero = heroBanners[heroIndex] || heroBanners[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || heroBanners.length <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        setHeroIndex((prev) => (prev + 1) % heroBanners.length);
      } else {
        setHeroIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
      }
    }
    touchStartX.current = null;
  };

  const filteredProducts = useMemo(() => {
    const list = products;
    if (activeConcern) {
      return list.filter(
        (p) =>
          p.concern?.toLowerCase() === activeConcern.toLowerCase() ||
          p.description.toLowerCase().includes(activeConcern.toLowerCase())
      );
    }
    if (activeTab === 'all') return list;
    if (activeTab === 'bestsellers') return list.filter((p) => p.isBestseller);
    return list.filter((p) => p.category === activeTab);
  }, [products, activeTab, activeConcern]);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      navigate('/products');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      {/* MOBILE-ONLY QUICK SEARCH + STORY CATEGORY CIRCLES (Inspired by The Man Company Mobile App) */}
      <div className="md:hidden px-4 pt-3 pb-2 space-y-3 bg-[#FAF8F5] border-b border-[#E5E0D8]">
        <form onSubmit={handleQuickSearch} className="flex items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Perfumes, Charcoal Face Wash, Beard Oil..."
              className="w-full h-10 bg-white border border-[#D6D3D1] pl-10 pr-3 text-xs text-[#141413] placeholder-[#78716C] focus:outline-none focus:border-[#141413]"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-4 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider shrink-0"
          >
            Go
          </button>
        </form>

        {/* Horizontal Snap-Scroll Category Circles */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar snap-x py-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="snap-start flex flex-col items-center gap-1.5 shrink-0 w-[68px] active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full p-0.5 border border-[#8C6239] bg-white overflow-hidden">
                <img
                  src={getOptimizedImageUrl(cat.image, 160)}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-[10px] font-semibold text-[#141413] text-center leading-tight line-clamp-1 w-full">
                {cat.name.split('&')[0].trim()}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION 1: Storefront Hero Showcase + Touch-Swipeable Banner Carousel + Proof Strip */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-3 sm:pt-6 pb-6 sm:pb-10">
        <div
          className="border border-[#E5E0D8] bg-[#141413] text-[#FAF8F5] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Full-Bleed Promotional Banner Image with Touch Swipe & Prev/Next Controls */}
          {currentHero?.image && (
            <div className="relative w-full bg-[#1C1A17] overflow-hidden">
              <Link to={currentHero.ctaLink || '/products'} className="block w-full">
                <img
                  src={getOptimizedImageUrl(currentHero.image, 1600)}
                  alt={currentHero.title}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[16/9] sm:aspect-auto sm:max-h-[480px] object-cover object-center transition-opacity duration-300"
                />
              </Link>

              {heroBanners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setHeroIndex(
                        (prev) => (prev - 1 + heroBanners.length) % heroBanners.length
                      )
                    }
                    aria-label="Previous banner"
                    className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#141413]/80 hover:bg-[#141413] text-white border border-[#3F3B36] items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setHeroIndex((prev) => (prev + 1) % heroBanners.length)
                    }
                    aria-label="Next banner"
                    className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#141413]/80 hover:bg-[#141413] text-white border border-[#3F3B36] items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Hero Action & Search Bar Strip */}
          <div className="p-4 sm:p-6 md:p-8 lg:px-10 bg-[#141413] border-t border-[#292524] flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-widest text-[#D4AF7A]">
                <span>Gentleman&apos;s Grooming Essentials</span>
                <span aria-hidden="true">·</span>
                <span>
                  Slide {heroIndex + 1} / {heroBanners.length}
                </span>
              </div>
              <h1
                className="font-serif-display text-xl sm:text-2xl md:text-3xl font-bold text-[#FAF8F5] tracking-tight leading-snug"
                style={{ textWrap: 'balance' }}
              >
                {currentHero?.title ||
                  'Signature Eau De Parfums, Charcoal Skincare & Beard Care'}
              </h1>
              <p className="text-xs sm:text-sm text-[#D6D3D1] leading-relaxed line-clamp-2 sm:line-clamp-none">
                {currentHero?.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* Desktop Search Bar */}
              <form onSubmit={handleQuickSearch} className="hidden md:flex">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Charcoal, Blanc, Vitamin C..."
                  className="w-64 bg-[#1F1E1C] border border-[#3F3B36] px-3.5 py-2.5 text-xs text-[#FAF8F5] placeholder-[#A8A29E] focus:outline-none focus:border-[#D4AF7A]"
                />
                <button
                  type="submit"
                  aria-label="Search catalog"
                  className="px-4 py-2.5 bg-[#292524] hover:bg-[#3F3B36] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </form>

              <Link
                to={currentHero?.ctaLink || '/products'}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8C6239] hover:bg-[#734f2c] active:scale-[0.98] text-white text-xs font-semibold uppercase tracking-widest transition-all whitespace-nowrap shrink-0"
              >
                <span>{currentHero?.ctaText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Slide Selector Bar */}
          {heroBanners.length > 1 && (
            <div className="px-4 sm:px-6 py-2.5 bg-[#1B1917] border-t border-[#292524] flex items-center justify-between text-xs text-[#A8A29E] overflow-x-auto no-scrollbar gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {heroBanners.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setHeroIndex(i)}
                    className={`min-h-[32px] px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap ${
                      heroIndex === i
                        ? 'bg-[#8C6239] text-white font-semibold'
                        : 'bg-[#292524] text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    0{i + 1}. {b.title.split('—')[0].split('|')[0].trim().slice(0, 20)}
                  </button>
                ))}
              </div>
              <Link
                to="/offers"
                className="text-[11px] uppercase tracking-widest text-[#D4AF7A] hover:underline whitespace-nowrap shrink-0"
              >
                Code ROYAL15: Extra 15% OFF →
              </Link>
            </div>
          )}
        </div>

        {/* Full-Width 4-Column Quantitative Proof Strip Below Hero */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-x border-b border-[#E5E0D8] bg-[#F3EFEA] divide-y lg:divide-y-0 divide-x divide-[#E5E0D8]">
          <div className="p-3 sm:p-5">
            <p className="font-mono-tabular text-xs sm:text-base md:text-lg font-bold text-[#141413]">
              0% SLS &amp; Parabens
            </p>
            <p className="text-[11px] sm:text-xs text-[#57534E] mt-0.5 line-clamp-2">
              Dermatologically tested botanical skincare formulations
            </p>
          </div>
          <div className="p-3 sm:p-5">
            <p className="font-mono-tabular text-xs sm:text-base md:text-lg font-bold text-[#141413]">
              100% Essential Oils
            </p>
            <p className="text-[11px] sm:text-xs text-[#57534E] mt-0.5 line-clamp-2">
              Charcoal, Niacinamide, Vitamin C &amp; Cold-Pressed Almond
            </p>
          </div>
          <div className="p-3 sm:p-5">
            <p className="font-mono-tabular text-xs sm:text-base md:text-lg font-bold text-[#141413]">
              Free Delivery ≥ ₹{settings.freeShippingThreshold}
            </p>
            <p className="text-[11px] sm:text-xs text-[#57534E] mt-0.5 line-clamp-2">
              {settings.estimatedDeliveryDays} · COD available
            </p>
          </div>
          <div className="p-3 sm:p-5">
            <p className="font-mono-tabular text-xs sm:text-base md:text-lg font-bold text-[#141413]">
              Up to 65% OFF Kits
            </p>
            <p className="text-[11px] sm:text-xs text-[#57534E] mt-0.5 line-clamp-2">
              Blanc Curation Kit &amp; Party Starter 4-Piece Gift Boxes
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Shop By Category Visual Tiles + Touch-Scrollable Shop By Concern Bar */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-8 sm:space-y-10">
        {/* Category Tiles (3-col on mobile for compact 2-row grid, 6-col on desktop) */}
        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-[#E5E0D8] pb-3 sm:pb-4">
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
                Head-to-Toe Grooming
              </p>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
                Shop By Category
              </h2>
            </div>
            <Link
              to="/collections"
              className="text-xs font-semibold uppercase tracking-wider text-[#141413] hover:text-[#8C6239] whitespace-nowrap"
            >
              All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/collections/${cat.slug}`}
                className="group bg-white border border-[#E5E0D8] overflow-hidden flex flex-col active:scale-[0.98] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#141413]"
              >
                <div className="aspect-square w-full bg-[#F5F3EF] overflow-hidden">
                  <img
                    src={getOptimizedImageUrl(cat.image, 400)}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2 sm:p-3 text-center bg-[#FAF8F5] border-t border-[#ECE7DF]">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#141413] group-hover:text-[#8C6239] transition-colors block truncate">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Shop By Concern Bar (Horizontal Snap-Scroll on Mobile, 8-Col Grid on Desktop) */}
        <div className="p-4 sm:p-6 bg-[#F3EFEA] border border-[#E5E0D8] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
                Targeted Dermatological &amp; Botanical Solutions
              </p>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#141413]">
                Shop By Grooming Concern
              </h3>
            </div>
            {activeConcern && (
              <button
                type="button"
                onClick={() => setActiveConcern(null)}
                className="min-h-[36px] text-xs font-semibold uppercase tracking-wider text-[#8C6239] underline whitespace-nowrap self-start sm:self-auto"
              >
                Clear Concern Filter ({activeConcern}) ✕
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto no-scrollbar snap-x gap-2.5 pb-1 lg:grid lg:grid-cols-8 lg:gap-3">
            {SHOP_BY_CONCERNS.map((item) => {
              const isSelected = activeConcern === item.concernQuery;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveConcern(isSelected ? null : item.concernQuery);
                    const el = document.getElementById('catalog-showcase');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`snap-start shrink-0 w-[132px] lg:w-auto group p-3 text-left border transition-all flex flex-col items-center text-center gap-2 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : 'bg-white text-[#141413] border-[#E5E0D8] hover:border-[#141413]'
                  }`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-[#F5F3EF] border border-[#E5E0D8] shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-bold leading-tight truncate">{item.title}</p>
                    <p
                      className={`text-[10px] sm:text-[11px] mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-[#D4AF7A]' : 'text-[#78716C]'
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Curated Grooming Collection & Interactive Category Filter */}
      <section
        id="catalog-showcase"
        className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 border-b border-[#E5E0D8] pb-4 sm:pb-6">
          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
              {activeConcern
                ? `Filtered By Concern: ${activeConcern}`
                : 'Authentic Formulations & Bestsellers'}
            </p>
            <h2
              className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#141413]"
              style={{ textWrap: 'balance' }}
            >
              {activeConcern
                ? `Recommended for ${activeConcern}`
                : 'Bestselling Perfumes, Face Care & Beard Essentials'}
            </h2>
          </div>

          {/* Interactive Filter Controls (Touch-Scrollable Segmented Bar) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F3EFEA] border border-[#E5E0D8] overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveConcern(null);
                setActiveTab('all');
              }}
              className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                !activeConcern && activeTab === 'all'
                  ? 'bg-[#141413] text-[#FAF8F5]'
                  : 'text-[#57534E] hover:text-[#141413]'
              }`}
            >
              All ({products.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveConcern(null);
                setActiveTab('bestsellers');
              }}
              className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                !activeConcern && activeTab === 'bestsellers'
                  ? 'bg-[#141413] text-[#FAF8F5]'
                  : 'text-[#57534E] hover:text-[#141413]'
              }`}
            >
              Bestsellers
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveConcern(null);
                  setActiveTab(cat.slug);
                }}
                className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                  !activeConcern && activeTab === cat.slug
                    ? 'bg-[#141413] text-[#FAF8F5]'
                    : 'text-[#57534E] hover:text-[#141413]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Mobile Grid -> 3-Column Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SECTION 4: Bespoke Promotional Campaign Split & Client Proof */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
          {promoBanners.map((promo) => (
            <div
              key={promo.id}
              className="grid grid-cols-1 sm:grid-cols-12 items-stretch border border-[#E5E0D8] bg-[#F3EFEA]"
            >
              <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5 order-2 sm:order-1">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
                    Exclusive Storefront Offer
                  </span>
                  <h3
                    className="font-serif-display text-2xl md:text-3xl font-bold text-[#141413]"
                    style={{ textWrap: 'balance' }}
                  >
                    {promo.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[#57534E] leading-relaxed">
                    {promo.subtitle}
                  </p>
                </div>
                <div>
                  <Link
                    to={promo.ctaLink}
                    className="min-h-[42px] inline-flex items-center gap-2 px-5 py-2.5 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider hover:bg-[#8C6239] transition-colors whitespace-nowrap"
                  >
                    <span>{promo.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div className="sm:col-span-5 bg-[#E6DFD3] aspect-[16/10] sm:aspect-auto sm:min-h-[240px] order-1 sm:order-2">
                <img
                  src={getOptimizedImageUrl(promo.image, 700)}
                  alt={promo.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Verified Client Reviews Adjacency Block (Horizontal Snap-Scroll on Mobile, 4-Col on Desktop) */}
        {reviews.length > 0 && (
          <div className="border-t border-[#E5E0D8] pt-8 sm:pt-12 space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
                  Verified Gentleman Reviews
                </p>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413] mt-1">
                  Trusted by Discerning Men Across India
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-semibold uppercase tracking-wider text-[#141413] underline underline-offset-4"
              >
                Explore Full 16-Product Catalog →
              </Link>
            </div>

            <div className="flex overflow-x-auto no-scrollbar snap-x gap-4 pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
              {reviews.slice(0, 4).map((rev) => {
                const reviewedProd = products.find((p) => p.id === rev.productId);
                return (
                  <div
                    key={rev.id}
                    className="snap-start shrink-0 w-[285px] md:w-auto p-5 sm:p-6 bg-[#F3EFEA] border border-[#E5E0D8] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#78716C] font-mono-tabular">
                        <span className="text-[#141413] font-semibold">
                          {'★'.repeat(rev.rating)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Verified Purchase</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#141413]">
                        &ldquo;{rev.title}&rdquo;
                      </h3>
                      <p className="text-xs text-[#57534E] leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#78716C] gap-2">
                      <span className="font-semibold text-[#141413] truncate">
                        {rev.authorName}
                      </span>
                      {reviewedProd && (
                        <Link
                          to={`/products/${reviewedProd.slug}`}
                          className="text-[#8C6239] hover:underline truncate max-w-[120px] shrink-0"
                        >
                          {reviewedProd.name.split('|')[0].trim()}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

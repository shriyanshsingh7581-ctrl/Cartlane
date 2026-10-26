import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Truck,
  Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { SHOP_BY_CONCERNS } from '../lib/seedData';

export const HomePage: React.FC = () => {
  const { products, categories, banners, reviews, settings } = useStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeConcern, setActiveConcern] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const heroBanners = useMemo(() => {
    const list = banners.filter((b) => b.placement === 'hero' && b.active);
    return list.length > 0 ? list : banners.slice(0, 4);
  }, [banners]);

  const promoBanners = useMemo(
    () => banners.filter((b) => b.placement === 'promo' && b.active).slice(0, 2),
    [banners]
  );

  // Auto-advance hero banner carousel every 7 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBanners.length);
    }, 7000);
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

  return (
    <main className="min-h-screen pb-20 md:pb-10 space-y-3 sm:space-y-4">
      {/* SECTION 1: FLIPKART TOP VISUAL CATEGORY ICON BAR */}
      <div className="bg-white border-b border-[#E0E0E0] shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x">
          <Link
            to="/offers"
            className="snap-start flex flex-col items-center gap-1.5 shrink-0 min-w-[66px] sm:min-w-[84px] group"
          >
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#FFF8E1] border border-[#FFE082] flex items-center justify-center overflow-hidden">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#FB641B]" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#212121] group-hover:text-[#2874F0] whitespace-nowrap">
              Top Offers
            </span>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="snap-start flex flex-col items-center gap-1.5 shrink-0 min-w-[66px] sm:min-w-[84px] group"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#F8F9FA] border border-[#E0E0E0] group-hover:border-[#2874F0] overflow-hidden p-0.5 transition-colors">
                <img
                  src={getOptimizedImageUrl(cat.image, 160)}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#212121] group-hover:text-[#2874F0] whitespace-nowrap">
                {cat.name.split('&')[0].trim()}
              </span>
            </Link>
          ))}

          <Link
            to="/products"
            className="snap-start flex flex-col items-center gap-1.5 shrink-0 min-w-[66px] sm:min-w-[84px] group"
          >
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#E3F2FD] border border-[#90CAF9] flex items-center justify-center overflow-hidden">
              <Tag className="w-6 h-6 sm:w-7 sm:h-7 text-[#2874F0]" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#212121] group-hover:text-[#2874F0] whitespace-nowrap">
              All Catalog
            </span>
          </Link>
        </div>
      </div>

      {/* SECTION 2: FLIPKART FULL-WIDTH HERO CAROUSEL + BANK/COUPON OFFER STRIP */}
      <section className="max-w-[1440px] mx-auto px-2 sm:px-4 space-y-2.5">
        <div
          className="bg-white border border-[#E0E0E0] shadow-2xs overflow-hidden rounded-xs"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentHero?.image && (
            <div className="relative w-full bg-[#09358A] overflow-hidden">
              <Link to={currentHero.ctaLink || '/products'} className="block w-full">
                <img
                  src={getOptimizedImageUrl(currentHero.image, 1600)}
                  alt={currentHero.title}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[16/9] sm:max-h-[480px] object-contain sm:object-cover object-center transition-opacity duration-300"
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
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-white/90 hover:bg-white text-[#212121] shadow-md items-center justify-center rounded-r-xs transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setHeroIndex((prev) => (prev + 1) % heroBanners.length)
                    }
                    aria-label="Next banner"
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-white/90 hover:bg-white text-[#212121] shadow-md items-center justify-center rounded-l-xs transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Hero Bottom Bar */}
          <div className="px-4 sm:px-6 py-3 bg-white border-t border-[#F0F0F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-extrabold text-[#212121] truncate">
                {currentHero?.title ||
                  'Cartlane Big Grooming Sale — Up to 65% Off Perfumes, Charcoal & Beard Kits'}
              </h1>
              <p className="text-xs text-[#878787] truncate">{currentHero?.subtitle}</p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                {heroBanners.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setHeroIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      heroIndex === i ? 'w-6 bg-[#2874F0]' : 'w-2 bg-[#D0D0D0]'
                    }`}
                  />
                ))}
              </div>
              <Link
                to={currentHero?.ctaLink || '/products'}
                className="px-4 py-2 bg-[#2874F0] hover:bg-[#1E5BC6] text-white text-xs font-bold uppercase tracking-wider rounded-xs inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>{currentHero?.ctaText || 'Shop Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Flipkart Bank & Privilege Offer Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Link
            to="/offers"
            className="p-3 sm:p-3.5 bg-white border border-[#E0E0E0] rounded-xs flex items-center gap-3 hover:border-[#2874F0] transition-colors"
          >
            <Tag className="w-5 h-5 text-[#388E3C] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#212121] truncate">
                Extra 15% OFF · ROYAL15
              </p>
              <p className="text-[11px] text-[#878787] truncate">
                Instant discount on Perfumes &amp; Kits
              </p>
            </div>
          </Link>

          <Link
            to="/collections/face-skin"
            className="p-3 sm:p-3.5 bg-white border border-[#E0E0E0] rounded-xs flex items-center gap-3 hover:border-[#2874F0] transition-colors"
          >
            <Zap className="w-5 h-5 text-[#FB641B] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#212121] truncate">
                Flat 20% OFF · CHARCOAL20
              </p>
              <p className="text-[11px] text-[#878787] truncate">
                Activated Bamboo Charcoal Range
              </p>
            </div>
          </Link>

          <div className="p-3 sm:p-3.5 bg-white border border-[#E0E0E0] rounded-xs flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#2874F0] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#212121] truncate">
                Free Express Delivery
              </p>
              <p className="text-[11px] text-[#878787] truncate">
                On orders above ₹{settings.freeShippingThreshold} · COD Active
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 bg-white border border-[#E0E0E0] rounded-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2874F0] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#212121] truncate">
                100% Cartlane Assured
              </p>
              <p className="text-[11px] text-[#878787] truncate">
                0% Parabens &amp; Sulphates · 7-Day Returns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FLIPKART "BEST OF GROOMING & TOP DEALS" PRODUCT SHELF */}
      <section
        id="catalog-showcase"
        className="max-w-[1440px] mx-auto px-2 sm:px-4"
      >
        <div className="bg-white border border-[#E0E0E0] rounded-xs p-3 sm:p-6 space-y-4 sm:space-y-6 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#F0F0F0] pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-[#212121]">
                  {activeConcern
                    ? `Recommended for ${activeConcern}`
                    : 'Best of Grooming & Top Deals'}
                </h2>
                <p className="text-xs text-[#878787] mt-0.5">
                  Authentic Formulations · Up to 65% Off MRP · Free Delivery
                </p>
              </div>
              <Link
                to="/products"
                className="lg:hidden px-3.5 py-1.5 bg-[#2874F0] text-white text-xs font-bold rounded-xs"
              >
                View All
              </Link>
            </div>

            {/* Interactive Category Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <button
                type="button"
                onClick={() => {
                  setActiveConcern(null);
                  setActiveTab('all');
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xs border transition-colors whitespace-nowrap shrink-0 ${
                  !activeConcern && activeTab === 'all'
                    ? 'bg-[#2874F0] text-white border-[#2874F0]'
                    : 'bg-[#F1F3F6] text-[#212121] border-[#E0E0E0] hover:border-[#2874F0]'
                }`}
              >
                All Deals ({products.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveConcern(null);
                  setActiveTab('bestsellers');
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xs border transition-colors whitespace-nowrap shrink-0 ${
                  !activeConcern && activeTab === 'bestsellers'
                    ? 'bg-[#2874F0] text-white border-[#2874F0]'
                    : 'bg-[#F1F3F6] text-[#212121] border-[#E0E0E0] hover:border-[#2874F0]'
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
                  className={`px-3.5 py-2 text-xs font-bold rounded-xs border transition-colors whitespace-nowrap shrink-0 ${
                    !activeConcern && activeTab === cat.slug
                      ? 'bg-[#2874F0] text-white border-[#2874F0]'
                      : 'bg-[#F1F3F6] text-[#212121] border-[#E0E0E0] hover:border-[#2874F0]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Mobile Grid -> 4-Column Flipkart Desktop Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SHOP BY CONCERN + PROMOTIONAL CAMPAIGN BANNERS + BUYER REVIEWS */}
      <section className="max-w-[1440px] mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
        {/* Shop By Grooming Concern White Block */}
        <div className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-[#212121]">
                Shop by Grooming Concern
              </h2>
              <p className="text-xs text-[#878787]">
                Tap any skin, beard, or fragrance concern to filter formulations
              </p>
            </div>
            {activeConcern && (
              <button
                type="button"
                onClick={() => setActiveConcern(null)}
                className="text-xs font-bold text-[#2874F0] hover:underline"
              >
                Clear Filter ({activeConcern}) ✕
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
                  className={`snap-start shrink-0 w-[126px] lg:w-auto p-3 border rounded-xs transition-all flex flex-col items-center text-center gap-2 ${
                    isSelected
                      ? 'bg-[#E3F2FD] border-[#2874F0]'
                      : 'bg-white border-[#E0E0E0] hover:border-[#2874F0]'
                  }`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-[#F8F9FA] border border-[#E0E0E0] shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-bold text-[#212121] truncate">{item.title}</p>
                    <p className="text-[10px] text-[#388E3C] font-semibold mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Promotional Banner Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {promoBanners.map((promo) => (
            <div
              key={promo.id}
              className="grid grid-cols-1 sm:grid-cols-12 items-stretch border border-[#E0E0E0] bg-white rounded-xs overflow-hidden shadow-2xs"
            >
              <div className="sm:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4 order-2 sm:order-1">
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#388E3C] font-extrabold">
                    Special Storefront Deal
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#212121]">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-[#878787] leading-relaxed">
                    {promo.subtitle}
                  </p>
                </div>
                <div>
                  <Link
                    to={promo.ctaLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2874F0] hover:bg-[#1E5BC6] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors whitespace-nowrap"
                  >
                    <span>{promo.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div className="sm:col-span-5 bg-[#F8F9FA] aspect-[16/10] sm:aspect-auto sm:min-h-[200px] order-1 sm:order-2">
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

        {/* Verified Buyer Reviews White Container */}
        {reviews.length > 0 && (
          <div className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3">
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-[#212121]">
                  Verified Buyer Ratings &amp; Reviews
                </h2>
                <p className="text-xs text-[#878787]">
                  Real feedback from authenticated Cartlane customers across India
                </p>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-[#2874F0] hover:underline"
              >
                Explore All Products →
              </Link>
            </div>

            <div className="flex overflow-x-auto no-scrollbar snap-x gap-3 pb-1 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
              {reviews.slice(0, 4).map((rev) => {
                const reviewedProd = products.find((p) => p.id === rev.productId);
                return (
                  <div
                    key={rev.id}
                    className="snap-start shrink-0 w-[275px] md:w-auto p-4 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-mono-tabular">
                        <span className="font-bold text-[#388E3C]">
                          {rev.rating}.0 ★
                        </span>
                        <span className="text-[#878787]">·</span>
                        <span className="text-[#212121] font-bold truncate">
                          {rev.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                    <div className="pt-2.5 border-t border-[#E0E0E0] flex items-center justify-between text-[11px] text-[#878787] gap-2">
                      <span className="font-semibold text-[#212121] truncate">
                        ✓ {rev.authorName} (Certified Buyer)
                      </span>
                      {reviewedProd && (
                        <Link
                          to={`/products/${reviewedProd.slug}`}
                          className="text-[#2874F0] font-semibold hover:underline truncate max-w-[110px] shrink-0"
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

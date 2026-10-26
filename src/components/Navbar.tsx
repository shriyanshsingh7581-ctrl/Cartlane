import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Grid,
  Home,
  Search,
  ShoppingBag,
  Tag,
  User,
  X,
  Heart,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../lib/cloudinary';

/**
 * Storefront Header + Mobile Thumb-Zone Bottom Tab Bar:
 * - Adheres to the 3-Zone Top Bar Contract on desktop & mobile
 * - Respects the 15% Mobile Sticky Surface Cap
 * - Provides a fixed bottom 5-tab navigation bar (md:hidden) with 44x44px minimum touch hitboxes
 *   and a slide-up Category & Search Bottom Sheet for one-handed mobile browsing.
 */
export const Navbar: React.FC = () => {
  const { settings, cart, categories, wishlistIds, setCartDrawerOpen, isAdmin } = useStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileSearchText, setMobileSearchText] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Hide bottom tab bar on PDP and Checkout where a dedicated sticky bottom Buy/Checkout CTA bar is anchored
  const hasDedicatedBottomBar =
    (location.pathname.startsWith('/products/') && location.pathname !== '/products') ||
    location.pathname === '/checkout';

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileSheetOpen(false);
    if (!mobileSearchText.trim()) {
      navigate('/products');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(mobileSearchText.trim())}`);
  };

  return (
    <>
      <div className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md">
        {/* Slim Dismissible Announcement Bar (32px on mobile, 36px on desktop) */}
        {!bannerDismissed && (
          <div className="h-8 sm:h-9 bg-[#141413] text-[#FAF8F5] px-3 sm:px-4 flex items-center justify-between text-[11px] sm:text-xs tracking-wide">
            <div className="w-6 hidden sm:block" aria-hidden="true" />
            <Link
              to={settings.announcementLink || '/offers'}
              className="truncate font-medium text-center flex-1 hover:text-[#D4AF7A] transition-colors"
            >
              {settings.announcementText}
            </Link>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss announcement"
              className="w-7 h-7 flex items-center justify-center text-[#A8A29E] hover:text-white transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3-Zone Top Bar Contract (Compact 52px on mobile, 68px on desktop) */}
        <header className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 h-[52px] sm:h-[68px] border-b border-[#E5E0D8]">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="font-serif-display text-xl sm:text-2xl font-bold tracking-wider text-[#141413] whitespace-nowrap shrink-0"
          >
            {settings.brandName || 'CARTLANE'}
          </Link>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]">
            <Link
              to="/products"
              className="hover:text-[#141413] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Shop All
            </Link>
            <Link
              to="/collections"
              className="hover:text-[#141413] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Collections
            </Link>
            <Link
              to="/offers"
              className="hover:text-[#141413] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Offers
            </Link>
            <Link
              to="/track-order"
              className="hover:text-[#141413] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Track Order
            </Link>
            <Link
              to={isAdmin ? '/admin' : '/account'}
              className="hover:text-[#141413] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              {isAdmin ? 'Admin Console' : 'Account'}
            </Link>
          </nav>

          {/* Zone 3: 1 Primary Action (44px min touch height) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="min-h-[40px] sm:min-h-[42px] inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold tracking-wider uppercase text-[#FAF8F5] bg-[#141413] hover:bg-[#292524] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag ({totalBagCount})</span>
            </button>
          </div>
        </header>
      </div>

      {/* MOBILE THUMB-ZONE FIXED BOTTOM TAB BAR (md:hidden) */}
      {!hasDedicatedBottomBar && (
        <nav
          aria-label="Mobile bottom navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E5E0D8] grid grid-cols-5 items-center h-14 px-1 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]"
        >
          <Link
            to="/"
            onClick={() => setMobileSheetOpen(false)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname === '/' && !mobileSheetOpen
                ? 'text-[#8C6239] font-semibold'
                : 'text-[#57534E]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Home</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileSheetOpen((prev) => !prev)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              mobileSheetOpen || location.pathname.startsWith('/collections')
                ? 'text-[#8C6239] font-semibold'
                : 'text-[#57534E]'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Categories</span>
          </button>

          <Link
            to="/products"
            onClick={() => setMobileSheetOpen(false)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname === '/products' || location.pathname === '/search'
                ? 'text-[#8C6239] font-semibold'
                : 'text-[#57534E]'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Shop All</span>
          </Link>

          <Link
            to="/offers"
            onClick={() => setMobileSheetOpen(false)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname === '/offers'
                ? 'text-[#8C6239] font-semibold'
                : 'text-[#57534E]'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Offers</span>
          </Link>

          <Link
            to={isAdmin ? '/admin' : '/account'}
            onClick={() => setMobileSheetOpen(false)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname.startsWith('/account') || location.pathname === '/login'
                ? 'text-[#8C6239] font-semibold'
                : 'text-[#57534E]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">
              {isAdmin ? 'Admin' : 'Account'}
            </span>
          </Link>
        </nav>
      )}

      {/* SLIDE-UP MOBILE CATEGORY & SEARCH BOTTOM SHEET */}
      {mobileSheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setMobileSheetOpen(false)}
        >
          <div
            className="bg-[#FAF8F5] rounded-t-3xl border-t border-[#E5E0D8] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Affordance */}
            <div className="pt-3 pb-2 px-5 flex items-center justify-between border-b border-[#ECE7DF]">
              <div className="w-6" />
              <div className="w-10 h-1.5 bg-[#D6D3D1] rounded-full" />
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                aria-label="Close categories sheet"
                className="w-9 h-9 flex items-center justify-center text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 pb-8">
              {/* Quick Mobile Search */}
              <form onSubmit={handleMobileSearchSubmit} className="flex gap-2">
                <input
                  type="search"
                  value={mobileSearchText}
                  onChange={(e) => setMobileSearchText(e.target.value)}
                  placeholder="Search Charcoal, Blanc, Beard Oil, SPF 50..."
                  className="flex-1 h-11 bg-white border border-[#D6D3D1] px-3.5 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
                />
                <button
                  type="submit"
                  className="h-11 px-4 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Visual Category Grid for Thumb Tapping */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#141413]">
                    Shop By Category
                  </p>
                  <Link
                    to="/collections"
                    onClick={() => setMobileSheetOpen(false)}
                    className="text-xs font-semibold text-[#8C6239]"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/collections/${cat.slug}`}
                      onClick={() => setMobileSheetOpen(false)}
                      className="flex items-center gap-3 p-2.5 bg-white border border-[#E5E0D8] active:scale-[0.98] transition-transform"
                    >
                      <img
                        src={getOptimizedImageUrl(cat.image, 160)}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover bg-[#F5F3EF] shrink-0"
                      />
                      <span className="text-xs font-semibold text-[#141413] leading-snug line-clamp-2">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Utility Tap Rows (56px height per mobile guidelines) */}
              <div className="divide-y divide-[#ECE7DF] border-y border-[#ECE7DF]">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileSheetOpen(false)}
                  className="min-h-[52px] flex items-center justify-between text-xs font-semibold text-[#141413]"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-[#8C6239]" />
                    <span>Saved Wishlist ({wishlistIds.length})</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#78716C]" />
                </Link>

                <Link
                  to="/track-order"
                  onClick={() => setMobileSheetOpen(false)}
                  className="min-h-[52px] flex items-center justify-between text-xs font-semibold text-[#141413]"
                >
                  <span className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-[#8C6239]" />
                    <span>Track Your Order</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#78716C]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

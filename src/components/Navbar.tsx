import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Grid,
  Heart,
  Home,
  MapPin,
  Search,
  ShoppingCart,
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../lib/cloudinary';

/**
 * Flipkart-Style Storefront Header + Mobile Bottom Navigation:
 * - Royal Blue (#2874F0) top bar with crisp white & golden-yellow (#FFE500) accents
 * - Integrated Instant Search Bar for desktop & mobile
 * - Fixed 5-tab mobile bottom thumb bar (Home, Categories, Deals, Account, Cart)
 */
export const Navbar: React.FC = () => {
  const {
    settings,
    cart,
    categories,
    wishlistIds,
    setCartDrawerOpen,
    user,
    userProfile,
  } = useStore();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(user || userProfile);
  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Hide bottom tab bar on PDP and Checkout where a dedicated sticky bottom Buy/Checkout CTA bar is anchored
  const hasDedicatedBottomBar =
    (location.pathname.startsWith('/products/') && location.pathname !== '/products') ||
    location.pathname === '/checkout' ||
    location.pathname === '/cart';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileSheetOpen(false);
    if (!searchText.trim()) {
      navigate('/products');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
  };

  return (
    <>
      <div className="sticky top-0 z-40 w-full bg-[#2874F0] text-white shadow-sm">
        {/* 3-Zone Top Bar Contract */}
        <header className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 sm:gap-8 px-3 sm:px-6 h-[56px] sm:h-[64px]">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            className="text-lg sm:text-2xl font-extrabold italic tracking-tight text-white whitespace-nowrap shrink-0"
          >
            {settings.brandName || 'Cartlane'}
          </Link>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-white/95">
            <Link
              to="/products"
              className="hover:text-[#FFE500] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              All Products
            </Link>
            <Link
              to="/collections"
              className="hover:text-[#FFE500] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Categories
            </Link>
            <Link
              to="/offers"
              className="hover:text-[#FFE500] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Top Offers
            </Link>
            <Link
              to={isLoggedIn ? '/account' : '/login'}
              className="hover:text-[#FFE500] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              {isLoggedIn ? 'My Account' : 'Login / Sign Up'}
            </Link>
            <Link
              to="/admin"
              className="text-[#FFE500] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Admin Panel
            </Link>
          </nav>

          {/* Zone 3: 1 Primary Action (Cart Button) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="min-h-[38px] sm:min-h-[40px] inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-[#2874F0] bg-white hover:bg-[#FFE500] hover:text-[#212121] rounded-xs shadow-xs active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart ({totalBagCount})</span>
            </button>
          </div>
        </header>

        {/* Sub-Header Instant Search & Quick Mobile/Desktop Actions */}
        <div className="bg-[#1E5BC6] border-t border-white/15">
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Flipkart White Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for Perfumes, Charcoal Face Wash, Beard Oil, Gift Kits..."
                  className="w-full h-9 sm:h-10 bg-white text-[#212121] placeholder-[#878787] pl-3.5 pr-10 text-xs sm:text-sm rounded-xs shadow-xs focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#2874F0] hover:text-[#1E5BC6] cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <Link
                to="/admin"
                className="sm:hidden h-9 px-2.5 bg-[#FFE500] text-[#212121] text-[11px] font-extrabold uppercase tracking-wider rounded-xs inline-flex items-center justify-center whitespace-nowrap shrink-0"
              >
                Admin
              </Link>
              <Link
                to={isLoggedIn ? '/account' : '/login'}
                className="sm:hidden h-9 px-2.5 bg-white/15 border border-white/30 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-xs inline-flex items-center justify-center whitespace-nowrap shrink-0"
              >
                {isLoggedIn ? 'Account' : 'Login'}
              </Link>
            </form>

            {/* Delivery Location & Offer Callout */}
            <div className="hidden sm:flex items-center gap-5 text-xs text-white/95 shrink-0">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFE500] text-[#212121] rounded-xs font-extrabold hover:bg-white transition-colors whitespace-nowrap"
              >
                <span>Seller Hub / Admin Panel</span>
              </Link>
              <Link
                to={isLoggedIn ? '/account' : '/login'}
                className="inline-flex items-center gap-1 hover:text-[#FFE500] font-bold transition-colors whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-[#FFE500]" />
                <span>{isLoggedIn ? userProfile?.displayName || 'My Account' : 'Login / Sign Up'}</span>
              </Link>
              <Link
                to="/wishlist"
                className="inline-flex items-center gap-1.5 hover:text-[#FFE500] transition-colors whitespace-nowrap"
              >
                <Heart className="w-3.5 h-3.5 text-[#FFE500]" />
                <span>Wishlist ({wishlistIds.length})</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 text-white/90 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5 text-[#FFE500]" />
                <span>Free Delivery above ₹{settings.freeShippingThreshold}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE THUMB-ZONE FIXED BOTTOM TAB BAR (md:hidden) */}
      {!hasDedicatedBottomBar && (
        <nav
          aria-label="Mobile bottom navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0E0E0] grid grid-cols-5 items-center h-14 px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
        >
          <Link
            to="/"
            onClick={() => setMobileSheetOpen(false)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname === '/' && !mobileSheetOpen
                ? 'text-[#2874F0] font-bold'
                : 'text-[#878787]'
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
                ? 'text-[#2874F0] font-bold'
                : 'text-[#878787]'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Categories</span>
          </button>

          <Link
            to="/admin"
            onClick={() => setMobileSheetOpen(false)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname.startsWith('/admin')
                ? 'text-[#2874F0] font-bold'
                : 'text-[#2874F0] font-bold'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Admin Panel</span>
          </Link>

          <Link
            to={isLoggedIn ? '/account' : '/login'}
            onClick={() => setMobileSheetOpen(false)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname.startsWith('/account') || location.pathname === '/login'
                ? 'text-[#2874F0] font-bold'
                : 'text-[#878787]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">
              {isLoggedIn ? 'Account' : 'Login'}
            </span>
          </Link>

          <Link
            to="/cart"
            onClick={() => setMobileSheetOpen(false)}
            className={`relative min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname === '/cart'
                ? 'text-[#2874F0] font-bold'
                : 'text-[#878787]'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">
              Cart ({totalBagCount})
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
            className="bg-white rounded-t-2xl border-t border-[#E0E0E0] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-3 pb-2 px-5 bg-[#2874F0] text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                All Cartlane Categories
              </span>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                aria-label="Close categories sheet"
                className="w-8 h-8 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-5 pb-8 bg-[#F1F3F6]">
              {/* Visual Category Grid for Thumb Tapping */}
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/collections/${cat.slug}`}
                    onClick={() => setMobileSheetOpen(false)}
                    className="flex items-center gap-3 p-2.5 bg-white border border-[#E0E0E0] rounded-xs active:scale-[0.98] transition-transform"
                  >
                    <img
                      src={getOptimizedImageUrl(cat.image, 160)}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover bg-[#F8F9FA] shrink-0 rounded-xs"
                    />
                    <span className="text-xs font-bold text-[#212121] leading-snug line-clamp-2">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Quick Utility Tap Rows */}
              <div className="bg-white border border-[#E0E0E0] divide-y divide-[#F0F0F0] px-4">
                <Link
                  to="/products"
                  onClick={() => setMobileSheetOpen(false)}
                  className="min-h-[48px] flex items-center justify-between text-xs font-bold text-[#212121]"
                >
                  <span>Browse All 16 Grooming Products</span>
                  <ArrowRight className="w-4 h-4 text-[#2874F0]" />
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setMobileSheetOpen(false)}
                  className="min-h-[48px] flex items-center justify-between text-xs font-bold text-[#212121]"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#FF4343]" />
                    <span>My Wishlist ({wishlistIds.length})</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#878787]" />
                </Link>

                <Link
                  to="/track-order"
                  onClick={() => setMobileSheetOpen(false)}
                  className="min-h-[48px] flex items-center justify-between text-xs font-bold text-[#212121]"
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#2874F0]" />
                    <span>Track My Order</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#878787]" />
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setMobileSheetOpen(false)}
                  className="min-h-[48px] flex items-center justify-between text-xs font-bold text-[#2874F0]"
                >
                  <span>Cartlane Seller Hub (Admin Panel)</span>
                  <ArrowRight className="w-4 h-4 text-[#2874F0]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, user, isAdmin, showToast } = useStore();
  const [email, setEmail] = useState('');
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Thank you for subscribing to Cartlane.');
    setEmail('');
  };

  return (
    <footer className="bg-[#141413] text-[#E7E5E4] border-t border-[#292524] mt-16 pb-16 md:pb-0">
      {/* Storefront Assurance Bar */}
      <div className="border-b border-[#292524] bg-[#1B1917]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-[#D4AF7A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                100% Authentic Formulations
              </p>
              <p className="text-[11px] text-[#A8A29E] mt-0.5">
                SLS &amp; Paraben-free botanical grooming
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#D4AF7A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Free Express Shipping
              </p>
              <p className="text-[11px] text-[#A8A29E] mt-0.5">
                On all orders ≥ ₹{settings.freeShippingThreshold} across India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF7A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Cash on Delivery (COD)
              </p>
              <p className="text-[11px] text-[#A8A29E] mt-0.5">
                Pay securely at your doorstep upon arrival
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-[#D4AF7A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                {settings.returnWindowDays}-Day Easy Returns
              </p>
              <p className="text-[11px] text-[#A8A29E] mt-0.5">
                Transparent live order tracking &amp; support
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#292524]">
          {/* Column 1: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              className="font-serif-display text-2xl sm:text-3xl font-bold tracking-wider text-[#FAF8F5] block"
            >
              {settings.brandName || 'CARTLANE'}
            </Link>
            <p className="text-xs sm:text-sm text-[#A8A29E] max-w-md leading-relaxed">
              Premium men&apos;s grooming, high-concentration Eau De Parfums, Activated Charcoal cleansers, 10% Vitamin C serums, and cold-pressed Almond &amp; Thyme beard care.
            </p>
            <form onSubmit={handleNewsletter} className="flex max-w-md pt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for exclusive offers"
                className="flex-1 h-11 bg-[#1F1E1C] border border-[#3F3B36] px-4 text-xs sm:text-sm text-[#FAF8F5] placeholder-[#78716C] focus:outline-none focus:border-[#8C6239]"
              />
              <button
                type="submit"
                className="h-11 px-5 bg-[#8C6239] hover:bg-[#734f2c] text-xs font-semibold uppercase tracking-wider text-white transition-colors whitespace-nowrap shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Column 2: Grooming Categories (Exact Slugs) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF7A]">
              Shop By Category
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A8A29E]">
              <li>
                <Link to="/collections/fragrance" className="hover:text-white transition-colors">
                  Perfumes &amp; Fragrances (EDP &amp; EDT)
                </Link>
              </li>
              <li>
                <Link to="/collections/face-skin" className="hover:text-white transition-colors">
                  Face &amp; Skin Care (Charcoal &amp; Serums)
                </Link>
              </li>
              <li>
                <Link to="/collections/beard-care" className="hover:text-white transition-colors">
                  Beard Growth &amp; Care
                </Link>
              </li>
              <li>
                <Link to="/collections/hair-care" className="hover:text-white transition-colors">
                  Hair Growth &amp; Derma Rollers
                </Link>
              </li>
              <li>
                <Link to="/collections/body-shave" className="hover:text-white transition-colors">
                  Body &amp; Shaving Essentials
                </Link>
              </li>
              <li>
                <Link to="/collections/kits-combos" className="hover:text-white transition-colors">
                  Luxury Gifting &amp; Combos
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Concierge */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF7A]">
              Customer Service
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A8A29E]">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products Catalog
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Coupons &amp; Combo Offers
                </Link>
              </li>
              <li>
                <Link to={user ? '/account' : '/login'} className="hover:text-white transition-colors">
                  {user ? 'My Account & Orders' : 'Customer Sign In'}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support &amp; FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policies & Governance */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF7A]">
              Store Policies &amp; Admin
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A8A29E]">
              <li>
                <Link to="/policies/shipping" className="hover:text-white transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-white transition-colors">
                  Returns, Refunds &amp; Cancellations
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  to={isAdmin ? '/admin' : '/admin/login'}
                  className="text-xs text-[#D4AF7A] hover:underline"
                >
                  Store Administrator Console →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Contact Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#78716C]">
          <p>
            © {new Date().getFullYear()} {settings.brandName || 'Cartlane'}. All rights reserved. Independent men&apos;s grooming storefront.
          </p>
          <p className="font-mono-tabular">
            Support: {settings.supportEmail} · {settings.supportPhone}
          </p>
        </div>
      </div>
    </footer>
  );
};

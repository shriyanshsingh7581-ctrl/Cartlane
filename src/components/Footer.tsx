import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RotateCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, showToast } = useStore();
  const [email, setEmail] = useState('');
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    showToast('Subscribed! You will receive Cartlane Big Grooming Sale alerts.');
    setEmail('');
  };

  return (
    <footer className="bg-[#172337] text-white border-t border-[#2874F0]/30 mt-8 pb-20 md:pb-0">
      {/* Top Storefront Assurance Strip */}
      <div className="border-b border-white/10 bg-[#1E2B42]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                100% Cartlane Assured
              </p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Dermatologically tested · 0% SLS &amp; Parabens
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Free Express Delivery
              </p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Free shipping on orders above ₹{settings.freeShippingThreshold}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Cash on Delivery (COD)
              </p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Pay via Cash or UPI at your doorstep across India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                {settings.returnWindowDays}-Day Easy Replacement
              </p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Instant pre-dispatch cancellation &amp; hassle-free returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flipkart Dark Navy Multi-Column Directory */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Col 1 & 2: Brand & Deal Alerts */}
        <div className="lg:col-span-2 space-y-4">
          <Link
            to="/"
            className="text-2xl font-extrabold italic tracking-tight text-white block"
          >
            {settings.brandName || 'Cartlane'}
          </Link>
          <p className="text-xs text-white/75 max-w-sm leading-relaxed">
            India&apos;s premier men&apos;s grooming superstore featuring Eau De Parfums, Activated Bamboo Charcoal skincare, Argan beard oils, and luxury gift combos.
          </p>

          <form onSubmit={handleSubscribe} className="flex max-w-sm pt-1">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for deal alerts"
              className="flex-1 bg-white text-[#212121] px-3.5 py-2.5 text-xs placeholder-[#878787] rounded-l-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#2874F0] hover:bg-[#1E5BC6] text-white text-xs font-bold uppercase tracking-wider rounded-r-xs transition-colors whitespace-nowrap shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Col 3: Grooming Categories */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#878787]">
            Categories
          </h3>
          <ul className="space-y-2 text-xs text-white/90 font-medium">
            <li>
              <Link to="/collections/fragrance" className="hover:underline">
                Perfumes &amp; Body Mist
              </Link>
            </li>
            <li>
              <Link to="/collections/face-skin" className="hover:underline">
                Charcoal &amp; Vitamin C Face Care
              </Link>
            </li>
            <li>
              <Link to="/collections/beard-care" className="hover:underline">
                Beard Growth Oils &amp; Softeners
              </Link>
            </li>
            <li>
              <Link to="/collections/hair-care" className="hover:underline">
                Hair Growth Serums &amp; Styling
              </Link>
            </li>
            <li>
              <Link to="/collections/body-shave" className="hover:underline">
                Body Wash &amp; Shaving Rituals
              </Link>
            </li>
            <li>
              <Link to="/collections/kits-combos" className="hover:underline">
                Luxury Grooming Gift Kits
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Customer Help */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#878787]">
            Help &amp; Account
          </h3>
          <ul className="space-y-2 text-xs text-white/90 font-medium">
            <li>
              <Link to="/track-order" className="hover:underline">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link to="/offers" className="hover:underline">
                Coupons &amp; Super Deals
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:underline">
                My Account &amp; Orders
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:underline">
                Saved Wishlist
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                24x7 Customer Care
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5: Consumer Policy */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#878787]">
            Consumer Policy
          </h3>
          <ul className="space-y-2 text-xs text-white/90 font-medium">
            <li>
              <Link to="/policies/shipping" className="hover:underline">
                Shipping &amp; Delivery
              </Link>
            </li>
            <li>
              <Link to="/policies/returns" className="hover:underline">
                Cancellation &amp; Returns
              </Link>
            </li>
            <li>
              <Link to="/policies/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/policies/terms" className="hover:underline">
                Terms of Use
              </Link>
            </li>
          </ul>
          <div className="pt-2 text-[11px] text-white/60 space-y-0.5 font-mono-tabular">
            <p>{settings.supportEmail}</p>
            <p>{settings.supportPhone}</p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
          <p>
            © {new Date().getFullYear()} {settings.brandName || 'Cartlane'}. All rights reserved.
          </p>
          <p>
            Free Delivery ≥ ₹{settings.freeShippingThreshold} · {settings.returnWindowDays}-Day Return Policy · Cash on Delivery Available
          </p>
        </div>
      </div>
    </footer>
  );
};

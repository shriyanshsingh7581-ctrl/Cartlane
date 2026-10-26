import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  Gift,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { products, wishlistIds, user, loginWithGoogle, addToCart, showToast } =
    useStore();
  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleMoveAllToBag = async () => {
    for (const prod of savedProducts) {
      if (prod.stock > 0) {
        await addToCart({
          productId: prod.id,
          variantLabel: prod.variants[0]?.label || 'Standard',
          quantity: 1,
        });
      }
    }
    showToast(`Added ${savedProducts.length} saved formulation(s) to your bag.`);
  };

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-24 md:py-12 space-y-8">
      <div className="border-b border-[#E5E0D8] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
            Cartlane Personal Curations
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#141413]">
            Saved Wishlist ({savedProducts.length})
          </h1>
        </div>

        {savedProducts.length > 0 && (
          <button
            type="button"
            onClick={handleMoveAllToBag}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#141413] hover:bg-[#8C6239] text-white text-xs font-semibold uppercase tracking-widest transition-colors self-start sm:self-auto"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Move All to Bag</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="p-10 sm:p-14 bg-[#F3EFEA] border border-[#E5E0D8] text-center space-y-4">
          <Heart className="w-10 h-10 text-[#8C6239] mx-auto" />
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
            Sign in to sync your Cartlane Wishlist across devices
          </h2>
          <p className="text-xs text-[#57534E] max-w-md mx-auto">
            Save your favorite Eau De Parfums, Charcoal Face Washes, and Gift Kits for instant 1-tap checkout anytime.
          </p>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="px-7 py-3.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
          >
            Sign In with Google
          </button>
        </div>
      ) : savedProducts.length === 0 ? (
        <div className="p-10 sm:p-14 bg-[#F3EFEA] border border-[#E5E0D8] text-center space-y-4">
          <Heart className="w-10 h-10 text-[#8C6239] mx-auto" />
          <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
            Your wishlist is currently empty
          </p>
          <p className="text-xs text-[#57534E] max-w-md mx-auto">
            Tap the heart icon on any product card to save formulations to your personal grooming list.
          </p>
          <Link
            to="/products"
            className="inline-block px-7 py-3.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
          >
            Explore Bestsellers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
};

export const OffersPage: React.FC = () => {
  const { coupons, products, applyCouponCode, showToast } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    applyCouponCode(code);
    showToast(`Coupon ${code} copied and applied to your bag.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Top discounted products & gift combos
  const topDealProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 6);
  }, [products]);

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-24 md:py-12 space-y-10 sm:space-y-14">
      {/* Promotional Hero Banner */}
      <div className="bg-[#141413] text-[#FAF8F5] p-6 sm:p-10 border border-[#2C2A27] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8C6239]/30 border border-[#8C6239] text-[#D4AF37] text-[10px] font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cartlane Official Privilege Offers</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-white leading-tight">
            Up to 65% OFF Gift Kits + Extra Coupon Savings
          </h1>
          <p className="text-xs sm:text-sm text-[#D6D3D1] leading-relaxed">
            Tap any privilege coupon below to automatically apply it to your shopping bag. Combine catalog discounts with member codes at checkout.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/collections/kits-combos"
            className="px-6 py-3.5 bg-[#8C6239] hover:bg-[#A37446] text-white text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            Shop Gift Combos →
          </Link>
          <Link
            to="/cart"
            className="px-5 py-3.5 border border-[#3F3B36] hover:border-[#D4AF37] text-white text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            Go to Bag
          </Link>
        </div>
      </div>

      {/* Active Coupons Grid */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#8C6239]" />
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
              Active Storefront Coupons ({coupons.length})
            </h2>
          </div>
          <span className="text-xs text-[#78716C] hidden sm:inline">
            1-Click Instant Bag Application
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {coupons.map((cpn) => (
            <div
              key={cpn.id}
              className="p-6 bg-white border border-[#E5E0D8] hover:border-[#141413] flex flex-col justify-between space-y-6 transition-colors shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono-tabular">
                  <span className="px-2.5 py-0.5 bg-[#F3EFEA] text-[#8C6239] font-bold">
                    {cpn.discountType === 'percentage'
                      ? `${cpn.discountValue}% PRIVILEGE`
                      : `FLAT ₹${cpn.discountValue} OFF`}
                  </span>
                  <span className="text-[#78716C]">Min. Order ₹{cpn.minOrderAmount}</span>
                </div>
                <h3 className="font-mono-tabular text-2xl font-bold text-[#141413] tracking-wider">
                  {cpn.code}
                </h3>
                <p className="text-xs text-[#57534E] leading-relaxed">{cpn.description}</p>
              </div>

              <div className="pt-4 border-t border-[#ECE7DF] flex items-center justify-between">
                <span className="text-[11px] font-mono-tabular text-[#78716C]">
                  Valid until {cpn.expiresAt}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(cpn.code)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#8C6239] transition-colors"
                >
                  {copiedCode === cpn.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied to Bag</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Apply Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Highest Savings Deals & Gift Combos */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5E0D8] pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
              Maximum Value Combos
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
              Biggest Discounted Formulations &amp; Gift Kits
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold uppercase tracking-wider text-[#141413] hover:text-[#8C6239]"
          >
            View All Deals →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {topDealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
};

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How long does Cartlane take to dispatch and deliver my order?',
      a: `All confirmed orders are packed and dispatched within 24 hours from our Gurugram warehouse. Standard insured delivery takes ${settings.estimatedDeliveryDays} across serviceable Indian PIN codes.`,
    },
    {
      q: 'Is Cash on Delivery (COD) available on all grooming products?',
      a: 'Yes! Cash on Delivery is available nationwide with zero extra COD handling fees. You can pay via Cash or UPI at the time of doorstep delivery.',
    },
    {
      q: 'Are Cartlane formulations free from Parabens and Sulphates?',
      a: 'Every Cartlane skincare, beard, and hair care formulation is dermatologically tested, 100% cruelty-free, and formulated without harsh parabens or sulphates.',
    },
    {
      q: 'How do I cancel or request a return for my order?',
      a: `You can cancel any order prior to dispatch directly from your My Orders page. Delivered items are eligible for a ${settings.returnWindowDays}-day return or replacement if received damaged or sealed.`,
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 pb-24 md:py-12 space-y-12">
      <div className="border-b border-[#E5E0D8] pb-6 space-y-2">
        <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
          Client Concierge &amp; Support Desk
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#141413]">
          Contact {settings.brandName}
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl">
          Have a question about fragrance longevity, skincare routines, bulk corporate gifting, or an existing order? Our specialists are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
        <div className="md:col-span-5 space-y-6 bg-[#F3EFEA] border border-[#E5E0D8] p-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8C6239]" />
              <span>Concierge Email</span>
            </p>
            <p className="text-xs font-mono-tabular text-[#57534E]">
              {settings.supportEmail}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#8C6239]" />
              <span>Direct Helpline</span>
            </p>
            <p className="text-xs font-mono-tabular text-[#57534E]">
              {settings.supportPhone}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8C6239]" />
              <span>Operating Hours</span>
            </p>
            <p className="text-xs text-[#57534E]">
              Monday – Saturday: 10:00 AM to 7:00 PM IST
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8C6239]" />
              <span>Corporate Headquarters</span>
            </p>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Cartlane Grooming Pvt. Ltd., DLF Cyber City Phase III, Gurugram, Haryana — 122002
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            showToast('Your inquiry has been logged with our Client Concierge.');
          }}
          className="md:col-span-7 bg-white border border-[#E5E0D8] p-6 sm:p-8 space-y-4"
        >
          <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
            Send a Direct Dispatch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="Your Full Name *"
              className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
            />
            <input
              required
              type="email"
              placeholder="Your Email Address *"
              className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
            />
          </div>
          <input
            placeholder="Order ID (Optional, e.g. AV-...)"
            className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs font-mono-tabular"
          />
          <textarea
            required
            rows={4}
            placeholder="How may our grooming specialists assist you?"
            className="w-full border border-[#D6D3D1] p-3.5 text-xs"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-[#141413] hover:bg-[#8C6239] text-white text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            {submitted ? '✓ Inquiry Logged with Concierge' : 'Submit Inquiry'}
          </button>
        </form>
      </div>

      {/* Frequently Asked Questions */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
          <HelpCircle className="w-4 h-4 text-[#8C6239]" />
          <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="divide-y divide-[#E5E0D8] border border-[#E5E0D8] bg-white">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left text-xs sm:text-sm font-bold text-[#141413]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8C6239] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-xs text-[#57534E] leading-relaxed mt-3 pt-3 border-t border-[#ECE7DF]">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export const PolicyPage: React.FC = () => {
  const { policyType } = useParams<{ policyType: string }>();
  const { settings } = useStore();
  const activeKey = policyType || 'shipping';

  const contentMap: Record<
    string,
    { title: string; subtitle: string; clauses: { heading: string; body: string }[] }
  > = {
    shipping: {
      title: 'Shipping & Delivery Policy',
      subtitle: `Official Storefront Policy · ${settings.brandName}`,
      clauses: [
        {
          heading: '01. Free Shipping Threshold & Standard Delivery Rate',
          body: `Orders with a net payable value of ₹${settings.freeShippingThreshold} or above receive complimentary insured shipping across India. Orders below ₹${settings.freeShippingThreshold} incur a flat shipping fee of ₹${settings.standardShippingFee}.`,
        },
        {
          heading: '02. Dispatch & Estimated Delivery Window',
          body: `Orders are quality-checked and packed in tamper-evident Cartlane boxes within 24 hours of confirmation. Standard transit duration is ${settings.estimatedDeliveryDays}.`,
        },
        {
          heading: '03. Cash on Delivery (COD) Verification',
          body: settings.codEnabled
            ? 'Cash on Delivery is active for all serviceable 6-digit Indian PIN codes at no additional COD surcharge.'
            : 'Cash on Delivery is currently disabled.',
        },
      ],
    },
    returns: {
      title: 'Returns, Replacements & Cancellation Policy',
      subtitle: `Official Storefront Policy · ${settings.brandName}`,
      clauses: [
        {
          heading: '01. Instant Pre-Dispatch Order Cancellation',
          body: 'Customers can request immediate cancellation directly from their Order Tracking page while the order is in Order Placed, Order Confirmed, or Processing state.',
        },
        {
          heading: `02. ${settings.returnWindowDays}-Day Return & Replacement Eligibility`,
          body: `Unopened grooming products or items received with transit damage are eligible for a return request within ${settings.returnWindowDays} days of delivery. Due to hygiene standards, used fragrances or unsealed skincare tubes cannot be restocked unless defective.`,
        },
        {
          heading: '03. Refund & Replacement Processing',
          body: 'Once a returned item is picked up and inspected at our warehouse, replacements or refunds are processed within 5–7 business days.',
        },
      ],
    },
    privacy: {
      title: 'Privacy & Data Protection Policy',
      subtitle: `Official Storefront Policy · ${settings.brandName}`,
      clauses: [
        {
          heading: '01. PII Isolation & Google Firebase Authentication',
          body: 'Customer sign-in is handled via Google Firebase Authentication. We never store raw passwords. Personal shipping addresses and order histories are isolated by strict database security rules so only the authenticated account owner and authorized administrators can access them.',
        },
        {
          heading: '02. Transaction & Payment Security',
          body: 'We never store credit card numbers, CVVs, or banking credentials in our database.',
        },
      ],
    },
    terms: {
      title: 'Terms & Conditions of Sale',
      subtitle: `Official Storefront Policy · ${settings.brandName}`,
      clauses: [
        {
          heading: '01. Brand & Storefront Identity',
          body: `${settings.brandName} is an independent men's grooming e-commerce storefront offering authentic botanical skincare, beard care, and fine fragrances.`,
        },
        {
          heading: '02. Pricing, GST & Inventory Accuracy',
          body: 'All prices are listed in Indian Rupees (INR) inclusive of applicable GST. Inventory and coupon redemptions are validated transactionally at checkout.',
        },
      ],
    },
  };

  const policy = contentMap[activeKey] || contentMap.shipping;

  const tabs = [
    { key: 'shipping', label: 'Shipping Policy' },
    { key: 'returns', label: 'Returns & Cancellations' },
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'terms', label: 'Terms & Conditions' },
  ];

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-5 pb-24 md:py-12 space-y-8">
      {/* Policy Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#E5E0D8] pb-4">
        {tabs.map((t) => (
          <Link
            key={t.key}
            to={`/policies/${t.key}`}
            className={`shrink-0 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${
              activeKey === t.key
                ? 'bg-[#141413] text-white border-[#141413]'
                : 'bg-white text-[#57534E] border-[#E5E0D8] hover:border-[#141413]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="border-b border-[#E5E0D8] pb-6 space-y-2">
        <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
          {policy.subtitle}
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#141413]">
          {policy.title}
        </h1>
      </div>

      <div className="space-y-5">
        {policy.clauses.map((c, idx) => (
          <div key={idx} className="p-6 bg-white border border-[#E5E0D8] space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141413]">
              {c.heading}
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export const NotFoundPage: React.FC = () => (
  <main className="max-w-lg mx-auto px-6 py-24 text-center space-y-4">
    <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
      404 · Page Not Found
    </p>
    <h1 className="font-serif-display text-4xl font-bold text-[#141413]">
      This Route Does Not Exist
    </h1>
    <p className="text-xs text-[#57534E]">
      Return to the Cartlane storefront to browse our fine fragrances and grooming essentials.
    </p>
    <Link
      to="/"
      className="inline-block px-6 py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
    >
      Return to Homepage
    </Link>
  </main>
);

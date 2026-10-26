import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
  Tag,
  Zap,
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
        addToCart(
          prod.id,
          prod.variants?.[0]?.label || 'Standard',
          1,
          false
        );
      }
    }
    showToast(`Added ${savedProducts.length} item(s) to your Cart!`);
  };

  return (
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-24 md:py-6 space-y-4">
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#212121]">
            My Wishlist ({savedProducts.length})
          </h1>
          <p className="text-xs text-[#878787]">
            Your saved Cartlane grooming items
          </p>
        </div>

        {savedProducts.length > 0 && (
          <button
            type="button"
            onClick={handleMoveAllToBag}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FB641B] hover:bg-[#E85812] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs shadow-xs self-start sm:self-auto"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add All to Cart</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="p-12 bg-white border border-[#E0E0E0] rounded-xs text-center space-y-4 shadow-2xs">
          <Heart className="w-12 h-12 text-[#2874F0] mx-auto" />
          <h2 className="text-xl font-extrabold text-[#212121]">
            Missing Wishlist items?
          </h2>
          <p className="text-xs text-[#878787] max-w-md mx-auto">
            Login to see the items you added previously across your mobile and desktop devices.
          </p>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="px-8 py-3 bg-[#FB641B] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs"
          >
            Login
          </button>
        </div>
      ) : savedProducts.length === 0 ? (
        <div className="p-12 bg-white border border-[#E0E0E0] rounded-xs text-center space-y-4 shadow-2xs">
          <Heart className="w-12 h-12 text-[#C2C2C2] mx-auto" />
          <p className="text-xl font-extrabold text-[#212121]">
            Empty Wishlist
          </p>
          <p className="text-xs text-[#878787] max-w-md mx-auto">
            You have no items in your wishlist. Start adding!
          </p>
          <Link
            to="/products"
            className="inline-block px-7 py-3 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-xs"
          >
            Explore Deals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
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
    showToast(`Coupon ${code} copied and applied to your Cart!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const topDealProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 8);
  }, [products]);

  return (
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-24 md:py-6 space-y-4">
      {/* Flipkart Super Deals Banner */}
      <div className="bg-[#2874F0] text-white p-6 sm:p-8 rounded-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFE500] text-[#212121] text-[10px] font-extrabold uppercase tracking-wider rounded-xs">
            <Zap className="w-3.5 h-3.5 fill-[#212121]" />
            <span>Cartlane Big Grooming Sale</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            Up to 65% OFF Gift Kits + Extra Coupon Discounts
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Tap any coupon card below to automatically apply it to your Cartlane shopping cart.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/collections/kits-combos"
            className="px-6 py-3 bg-[#FFE500] hover:bg-[#FFD600] text-[#212121] text-xs font-extrabold uppercase tracking-wider rounded-xs shadow-xs"
          >
            Shop Gift Combos →
          </Link>
          <Link
            to="/cart"
            className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white text-xs font-bold uppercase tracking-wider rounded-xs"
          >
            Go to Cart
          </Link>
        </div>
      </div>

      {/* Active Coupons Grid */}
      <section className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#388E3C]" />
            <h2 className="text-base sm:text-xl font-extrabold text-[#212121]">
              Coupons For You ({coupons.length})
            </h2>
          </div>
          <span className="text-xs text-[#388E3C] font-bold hidden sm:inline">
            1-Tap Instant Cart Application
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {coupons.map((cpn) => (
            <div
              key={cpn.id}
              className="p-5 bg-[#F8F9FA] border border-dashed border-[#2874F0] rounded-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-tabular">
                  <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#388E3C] font-extrabold rounded-xs">
                    {cpn.discountType === 'percentage'
                      ? `${cpn.discountValue}% OFF`
                      : `FLAT ₹${cpn.discountValue} OFF`}
                  </span>
                  <span className="text-[#878787]">Min. Order ₹{cpn.minOrderAmount}</span>
                </div>
                <h3 className="font-mono-tabular text-xl font-extrabold text-[#2874F0] tracking-wider">
                  {cpn.code}
                </h3>
                <p className="text-xs text-[#212121] leading-relaxed">{cpn.description}</p>
              </div>

              <div className="pt-3 border-t border-[#E0E0E0] flex items-center justify-between">
                <span className="text-[11px] font-mono-tabular text-[#878787]">
                  Valid till {cpn.expiresAt}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(cpn.code)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2874F0] hover:bg-[#1E5BC6] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                >
                  {copiedCode === cpn.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Apply Coupon</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Discounted Deals */}
      <section className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-[#212121]">
              Top Discounted Deals (Up to 65% Off)
            </h2>
            <p className="text-xs text-[#878787]">
              Lowest prices on luxury perfume sets &amp; daily grooming combos
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#2874F0] hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
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
      q: 'How quickly does Cartlane deliver orders?',
      a: `All confirmed orders are packed and dispatched within 24 hours from our Gurugram fulfillment center. Standard delivery takes ${settings.estimatedDeliveryDays} across India.`,
    },
    {
      q: 'Is Cash on Delivery (COD) available?',
      a: 'Yes, Cash on Delivery is available on all orders across serviceable 6-digit Indian PIN codes with zero extra COD fee.',
    },
    {
      q: 'Are Cartlane grooming products Paraben & Sulphate free?',
      a: 'Yes! Every Cartlane face wash, beard oil, and hair serum is dermatologically tested and free from harsh parabens and sulphates.',
    },
    {
      q: 'How can I cancel or return an order?',
      a: `You can cancel any order before dispatch directly from your My Orders page. Delivered products are covered by our ${settings.returnWindowDays}-day replacement/return policy.`,
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-2 sm:px-4 pt-4 pb-24 md:py-8 space-y-4">
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-5 sm:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-[#F0F0F0] pb-4">
          <p className="text-xs uppercase tracking-wider text-[#2874F0] font-extrabold">
            24x7 Customer Care &amp; Help Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212121] mt-1">
            Contact {settings.brandName} Support
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xs p-5">
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase text-[#212121] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2874F0]" />
                <span>Support Email</span>
              </p>
              <p className="text-xs font-mono-tabular text-[#555555]">
                {settings.supportEmail}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase text-[#212121] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2874F0]" />
                <span>Helpline Number</span>
              </p>
              <p className="text-xs font-mono-tabular text-[#555555]">
                {settings.supportPhone}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase text-[#212121] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2874F0]" />
                <span>Support Hours</span>
              </p>
              <p className="text-xs text-[#555555]">
                Mon – Sat: 10:00 AM – 7:00 PM IST
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase text-[#212121] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2874F0]" />
                <span>Corporate Office</span>
              </p>
              <p className="text-xs text-[#555555] leading-relaxed">
                Cartlane Grooming Pvt. Ltd., DLF Cyber City Phase III, Gurugram, Haryana — 122002
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              showToast('Your support ticket has been logged with Cartlane Help Center.');
            }}
            className="md:col-span-7 space-y-3.5"
          >
            <h2 className="text-base font-extrabold text-[#212121]">
              Raise a Support Ticket
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                placeholder="Your Full Name *"
                className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs"
              />
              <input
                required
                type="email"
                placeholder="Your Email Address *"
                className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs"
              />
            </div>
            <input
              placeholder="Order ID (Optional, e.g. AV-...)"
              className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs font-mono-tabular rounded-xs"
            />
            <textarea
              required
              rows={4}
              placeholder="Describe your query or order issue..."
              className="w-full border border-[#D0D0D0] p-3 text-xs rounded-xs"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#FB641B] hover:bg-[#E85812] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors"
            >
              {submitted ? '✓ Ticket Submitted' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <section className="bg-white border border-[#E0E0E0] rounded-xs p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3">
          <HelpCircle className="w-4 h-4 text-[#2874F0]" />
          <h2 className="text-base sm:text-lg font-extrabold text-[#212121]">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="divide-y divide-[#F0F0F0]">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left text-xs sm:text-sm font-bold text-[#212121]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#2874F0] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-xs text-[#555555] leading-relaxed mt-2.5 pt-2.5 border-t border-[#F8F9FA]">
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
          heading: '01. Free Delivery Threshold & Flat Rate',
          body: `Orders with a net payable value of ₹${settings.freeShippingThreshold} or above receive FREE insured delivery across India. Orders below ₹${settings.freeShippingThreshold} incur a standard shipping charge of ₹${settings.standardShippingFee}.`,
        },
        {
          heading: '02. Dispatch & Estimated Delivery Window',
          body: `Orders are quality-checked and packed within 24 hours of confirmation. Standard transit duration is ${settings.estimatedDeliveryDays}.`,
        },
        {
          heading: '03. Cash on Delivery (COD) Verification',
          body: settings.codEnabled
            ? 'Cash on Delivery is active for all serviceable 6-digit Indian PIN codes at no extra surcharge.'
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
          body: 'Customers can cancel any order directly from their My Orders page while the order is in Order Placed, Order Confirmed, or Processing state.',
        },
        {
          heading: `02. ${settings.returnWindowDays}-Day Return & Replacement Eligibility`,
          body: `Unopened grooming products or items received with transit damage are eligible for a return request within ${settings.returnWindowDays} days of delivery.`,
        },
        {
          heading: '03. Refund Processing',
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
          body: 'Customer sign-in is handled via Google Firebase Authentication. Personal shipping addresses and order histories are isolated by strict database security rules.',
        },
        {
          heading: '02. Transaction Security',
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
          body: `${settings.brandName} is an independent men's grooming e-commerce superstore offering authentic botanical skincare, beard care, and fine fragrances.`,
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
    { key: 'terms', label: 'Terms of Use' },
  ];

  return (
    <main className="max-w-4xl mx-auto px-2 sm:px-4 pt-4 pb-24 md:py-8 space-y-4">
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-3 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-2xs">
        {tabs.map((t) => (
          <Link
            key={t.key}
            to={`/policies/${t.key}`}
            className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors ${
              activeKey === t.key
                ? 'bg-[#2874F0] text-white'
                : 'bg-[#F8F9FA] text-[#212121] hover:text-[#2874F0]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-xs p-5 sm:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-[#F0F0F0] pb-4">
          <p className="text-xs uppercase tracking-wider text-[#2874F0] font-extrabold">
            {policy.subtitle}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212121] mt-1">
            {policy.title}
          </h1>
        </div>

        <div className="space-y-4">
          {policy.clauses.map((c, idx) => (
            <div key={idx} className="p-4 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xs space-y-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#212121]">
                {c.heading}
              </h2>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export const NotFoundPage: React.FC = () => (
  <main className="max-w-lg mx-auto px-6 py-24 text-center space-y-4">
    <p className="text-xs uppercase tracking-widest text-[#2874F0] font-extrabold">
      404 · Page Not Found
    </p>
    <h1 className="text-3xl font-extrabold text-[#212121]">
      Unfortunately the page you are looking for has been moved or deleted
    </h1>
    <Link
      to="/"
      className="inline-block px-6 py-3 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-widest rounded-xs"
    >
      Go to Homepage
    </Link>
  </main>
);

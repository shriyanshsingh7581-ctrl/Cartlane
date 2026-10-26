import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  X,
  Zap,
  ZoomIn,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { db, handleFirestoreError } from '../lib/firebase';
import { OperationType, Review } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    products,
    reviews,
    settings,
    user,
    userProfile,
    addToCart,
    wishlistIds,
    toggleWishlist,
    recentlyViewedIds,
    recordProductView,
    showToast,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug),
    [products, slug]
  );

  const [selectedVariantLabel, setSelectedVariantLabel] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // PIN code serviceability check
  const [pinCode, setPinCode] = useState('122002');
  const [pinStatus, setPinStatus] = useState<string | null>(
    'Delivery in 2–4 Days, Free · Cash on Delivery available'
  );

  // Review submission form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariantLabel(product.variants?.[0]?.label || 'Standard');
      setQuantity(1);
      setActiveImageIdx(0);
      recordProductView(product.id);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <main className="max-w-[1440px] mx-auto px-6 py-24 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-[#212121]">
          Product Not Found
        </h1>
        <p className="text-sm text-[#878787]">
          The requested product may have been archived or moved.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-widest rounded-xs"
        >
          Return to Catalog
        </Link>
      </main>
    );
  }

  const activeVariant = product.variants?.find((v) => v.label === selectedVariantLabel);
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayCompareAt = activeVariant ? activeVariant.compareAtPrice : product.compareAtPrice;
  const displaySku = activeVariant ? activeVariant.sku : product.sku;
  const availableStock = Math.min(
    product.stock,
    activeVariant ? activeVariant.stock : product.stock
  );
  const discountPercent =
    displayCompareAt > displayPrice
      ? Math.round(((displayCompareAt - displayPrice) / displayCompareAt) * 100)
      : 0;
  const extraSavings = Math.max(0, displayCompareAt - displayPrice);

  const gallery =
    product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages
      : [{ url: product.mainImage, alt: product.imageAlt }];

  const currentImage = gallery[activeImageIdx]?.url || product.mainImage;
  const isWishlisted = wishlistIds.includes(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const recentlyViewedProducts = recentlyViewedIds
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || gallery.length <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        setActiveImageIdx((prev) => (prev + 1) % gallery.length);
      } else {
        setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    }
    touchStartX.current = null;
  };

  const handleCheckPinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pinCode.trim())) {
      setPinStatus('Please enter a valid 6-digit Indian PIN code (e.g., 110001, 400001).');
      return;
    }
    setPinStatus(
      `Deliverable to ${pinCode.trim()} in ${settings.estimatedDeliveryDays} · Free Delivery · Cash on Delivery available.`
    );
  };

  const handleBuyNow = () => {
    if (availableStock <= 0) return;
    addToCart(product.id, selectedVariantLabel, quantity, false);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in with Google to submit a verified review.', 'info');
      return;
    }
    if (reviewTitle.trim().length < 2 || reviewComment.trim().length < 5) {
      showToast('Please provide both a headline and a review comment.', 'error');
      return;
    }
    setSubmittingReview(true);
    const reviewId = `rev_${Date.now()}`;
    const newReview: Review = {
      id: reviewId,
      productId: product.id,
      uid: user.uid,
      authorName: (userProfile?.displayName || user.displayName || 'Certified Buyer').slice(0, 80),
      rating: reviewRating,
      title: reviewTitle.trim().slice(0, 120),
      comment: reviewComment.trim().slice(0, 1000),
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'reviews', reviewId), newReview);
      setReviewTitle('');
      setReviewComment('');
      showToast('Thank you! Your review has been published.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${reviewId}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-24 lg:py-6 space-y-4">
      {/* FLIPKART WHITE PDP CONTAINER */}
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-3 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT COLUMN: Sticky Gallery + Flipkart Side-by-Side ADD TO CART / BUY NOW Buttons */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {/* Vertical Thumbnails on sm+, Horizontal on mobile */}
              {gallery.length > 1 && (
                <div className="flex sm:flex-col items-center gap-2 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:max-h-[420px] shrink-0">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 border p-1 overflow-hidden shrink-0 bg-white rounded-xs transition-all ${
                        activeImageIdx === idx
                          ? 'border-[#2874F0] ring-1 ring-[#2874F0]'
                          : 'border-[#E0E0E0] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getOptimizedImageUrl(img.url, 240)}
                        alt={img.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Frame */}
              <div
                className="relative flex-1 aspect-square bg-white border border-[#F0F0F0] p-4 overflow-hidden"
                onTouchStart={handleGalleryTouchStart}
                onTouchEnd={handleGalleryTouchEnd}
              >
                <img
                  src={getOptimizedImageUrl(currentImage, 1100)}
                  alt={product.imageAlt || product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />

                {/* Top-Right Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full border border-[#E0E0E0] bg-white shadow-xs flex items-center justify-center"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-[#FF4343] text-[#FF4343]' : 'text-[#C2C2C2]'
                    }`}
                  />
                </button>

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length)
                      }
                      aria-label="Previous image"
                      className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 text-[#212121] border border-[#E0E0E0] rounded-full flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx((prev) => (prev + 1) % gallery.length)}
                      aria-label="Next image"
                      className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 text-[#212121] border border-[#E0E0E0] rounded-full flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Zoom image"
                  className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white/95 text-[#212121] text-[11px] font-bold inline-flex items-center gap-1 border border-[#E0E0E0] rounded-xs"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#2874F0]" />
                  <span>Zoom</span>
                </button>
              </div>
            </div>

            {/* FLIPKART SIGNATURE SIDE-BY-SIDE CTA BUTTONS BELOW IMAGE (Desktop) */}
            <div className="hidden lg:grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={availableStock <= 0}
                onClick={() => addToCart(product.id, selectedVariantLabel, quantity, true)}
                className="h-13 bg-[#FF9F00] hover:bg-[#F39700] disabled:bg-[#E0E0E0] text-white text-sm font-extrabold uppercase tracking-wider rounded-xs shadow-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 fill-white" />
                <span>{availableStock <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
              </button>

              <button
                type="button"
                disabled={availableStock <= 0}
                onClick={handleBuyNow}
                className="h-13 bg-[#FB641B] hover:bg-[#E85812] disabled:bg-[#E0E0E0] text-white text-sm font-extrabold uppercase tracking-wider rounded-xs shadow-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>BUY NOW</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Contiguous Flipkart Product Details, Offers, PIN Code & Specs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-[#878787] overflow-x-auto no-scrollbar whitespace-nowrap">
              <Link to="/" className="hover:text-[#2874F0]">
                Home
              </Link>
              <span>›</span>
              <Link
                to={`/collections/${product.category}`}
                className="hover:text-[#2874F0] capitalize"
              >
                {product.category.replace('-', ' ')}
              </Link>
              <span>›</span>
              <span className="text-[#878787] truncate">{product.name}</span>
            </nav>

            {/* Brand, Title, Rating & Cartlane Assured */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#878787]">
                CARTLANE · {product.subcategory || product.category}
              </p>

              <h1 className="text-lg sm:text-2xl font-bold text-[#212121] leading-snug">
                {product.name} ({selectedVariantLabel})
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                <span className="font-mono-tabular font-bold text-white bg-[#388E3C] px-2 py-0.5 rounded-xs">
                  {(product.ratingAvg || 4.8).toFixed(1)} ★
                </span>
                <a
                  href="#reviews"
                  className="font-semibold text-[#878787] hover:text-[#2874F0]"
                >
                  {productReviews.length + 148} Ratings &amp; {productReviews.length} Verified Reviews
                </a>
                <span className="inline-flex items-center gap-1 font-extrabold italic text-[#2874F0]">
                  <ShieldCheck className="w-4 h-4 text-[#2874F0]" />
                  <span>Cartlane Assured</span>
                </span>
              </div>
            </div>

            {/* Flipkart Special Price Block */}
            <div className="space-y-1">
              {extraSavings > 0 && (
                <p className="text-xs font-bold text-[#388E3C]">
                  Extra ₹{extraSavings.toLocaleString('en-IN')} off · Special price
                </p>
              )}
              <div className="flex items-baseline flex-wrap gap-3 font-mono-tabular">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#212121]">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                {displayCompareAt > displayPrice && (
                  <>
                    <span className="text-sm sm:text-base text-[#878787] line-through">
                      ₹{displayCompareAt.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#388E3C]">
                      {discountPercent}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#878787]">
                Inclusive of all taxes ·{' '}
                <span
                  className={
                    availableStock > 0
                      ? 'text-[#388E3C] font-bold'
                      : 'text-red-600 font-bold'
                  }
                >
                  {availableStock > 0
                    ? `In Stock (${availableStock} units ready for dispatch)`
                    : 'Out of Stock'}
                </span>
              </p>
            </div>

            {/* FLIPKART AVAILABLE OFFERS LIST */}
            <div className="space-y-2 pt-1">
              <h2 className="text-xs font-extrabold text-[#212121] uppercase tracking-wider">
                Available offers
              </h2>
              <ul className="space-y-2 text-xs text-[#212121]">
                <li className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-[#388E3C] shrink-0 mt-0.5" />
                  <span>
                    <strong>Coupon Offer:</strong> Apply code{' '}
                    <span className="font-mono-tabular font-bold text-[#2874F0]">ROYAL15</span> in
                    cart for extra 15% off on orders above ₹799{' '}
                    <Link to="/offers" className="text-[#2874F0] font-bold hover:underline">
                      T&amp;C
                    </Link>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-[#388E3C] shrink-0 mt-0.5" />
                  <span>
                    <strong>Skincare Offer:</strong> Flat 20% off with code{' '}
                    <span className="font-mono-tabular font-bold text-[#2874F0]">
                      CHARCOAL20
                    </span>{' '}
                    on orders above ₹999
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-[#388E3C] shrink-0 mt-0.5" />
                  <span>
                    <strong>Partner Offer:</strong> Free Express Insured Delivery on orders above ₹
                    {settings.freeShippingThreshold} + Cash on Delivery available
                  </span>
                </li>
              </ul>
            </div>

            {/* Pack Size / Volume Selector & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3 border-t border-[#F0F0F0] items-center">
              {product.variants && product.variants.length > 0 && (
                <div className="sm:col-span-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-xs font-bold text-[#878787] w-24 shrink-0">
                    Pack Size
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantLabel(v.label)}
                        className={`px-3.5 py-2 text-xs font-bold border rounded-xs transition-colors ${
                          selectedVariantLabel === v.label
                            ? 'border-[#2874F0] text-[#2874F0] bg-[#E3F2FD]/40'
                            : 'border-[#E0E0E0] text-[#212121] hover:border-[#2874F0]'
                        }`}
                      >
                        {v.label} (₹{v.price})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="sm:col-span-4 flex items-center gap-3">
                <span className="text-xs font-bold text-[#878787]">Qty</span>
                <div className="inline-flex items-center border border-[#E0E0E0] bg-white rounded-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 flex items-center justify-center text-[#212121] hover:bg-[#F1F3F6]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-mono-tabular font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(Math.max(1, availableStock), q + 1))
                    }
                    disabled={quantity >= availableStock}
                    aria-label="Increase quantity"
                    className="w-8 h-8 flex items-center justify-center text-[#212121] hover:bg-[#F1F3F6] disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* FLIPKART DELIVERY PINCODE CHECKER */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-3 border-t border-[#F0F0F0]">
              <span className="text-xs font-bold text-[#878787] w-24 shrink-0 pt-2">
                Delivery
              </span>
              <div className="flex-1 space-y-2">
                <form
                  onSubmit={handleCheckPinCode}
                  className="inline-flex items-center border-b-2 border-[#2874F0] pb-1"
                >
                  <MapPin className="w-4 h-4 text-[#2874F0] mr-1.5" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter Delivery Pincode"
                    className="w-40 text-xs font-mono-tabular font-bold text-[#212121] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="text-xs font-extrabold text-[#2874F0] hover:underline px-2"
                  >
                    Check
                  </button>
                </form>
                {pinStatus && (
                  <p className="text-xs font-semibold text-[#212121]">{pinStatus}</p>
                )}
              </div>
            </div>

            {/* Highlights & Seller Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-[#F0F0F0]">
              {product.highlights && product.highlights.length > 0 && (
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-[#878787] w-20 shrink-0">
                    Highlights
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#212121] list-disc pl-3">
                    {product.highlights.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4">
                <span className="text-xs font-bold text-[#878787] w-20 shrink-0">
                  Seller
                </span>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-[#2874F0]">
                    Cartlane Official Retail{' '}
                    <span className="ml-1 px-1.5 py-0.5 bg-[#2874F0] text-white text-[10px] rounded-xs">
                      4.9 ★
                    </span>
                  </p>
                  <p className="text-[#212121]">• {settings.returnWindowDays} Days Replacement Policy</p>
                  <p className="text-[#212121]">• GST Invoice Available</p>
                  <p className="text-[#212121]">• Cash on Delivery Eligible</p>
                </div>
              </div>
            </div>

            {/* Specifications Table (Flipkart Style) */}
            <div className="border border-[#E0E0E0] rounded-xs overflow-hidden mt-4">
              <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E0E0E0]">
                <h2 className="text-sm sm:text-base font-extrabold text-[#212121]">
                  Specifications &amp; Formulation Details
                </h2>
              </div>
              <div className="divide-y divide-[#F0F0F0] p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 pb-2">
                  <span className="sm:col-span-4 text-[#878787] font-medium">
                    Description
                  </span>
                  <span className="sm:col-span-8 text-[#212121] leading-relaxed">
                    {product.description}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 pt-3 pb-2">
                  <span className="sm:col-span-4 text-[#878787] font-medium">
                    Key Ingredients
                  </span>
                  <span className="sm:col-span-8 text-[#212121] leading-relaxed">
                    {product.ingredients ||
                      '100% SLS & Paraben-free formulation enriched with cold-pressed essential oils.'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 pt-3 pb-2">
                  <span className="sm:col-span-4 text-[#878787] font-medium">
                    How to Use
                  </span>
                  <span className="sm:col-span-8 text-[#212121] leading-relaxed">
                    {product.usageInstructions ||
                      'Apply daily as part of your morning and evening grooming routine.'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 pt-3">
                  <span className="sm:col-span-4 text-[#878787] font-medium">
                    SKU / Pack Code
                  </span>
                  <span className="sm:col-span-8 font-mono-tabular text-[#212121]">
                    {displaySku} · Concern: {product.concern || 'Daily Men Grooming'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Block */}
      <section
        id="reviews"
        className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 space-y-6 shadow-2xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#212121]">
                Ratings &amp; Certified Buyer Reviews
              </h2>
              <p className="text-xs text-[#878787] mt-0.5">
                {(product.ratingAvg || 4.8).toFixed(1)} ★ overall rating based on verified orders
              </p>
            </div>

            <form
              onSubmit={handleSubmitReview}
              className="p-4 sm:p-5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xs space-y-3"
            >
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#212121]">
                Rate this Product
              </h3>
              <div>
                <label className="block text-xs text-[#878787] mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full h-10 bg-white border border-[#E0E0E0] px-3 text-xs text-[#212121]"
                >
                  <option value={5}>5 ★ — Excellent</option>
                  <option value={4}>4 ★ — Very Good</option>
                  <option value={3}>3 ★ — Good</option>
                  <option value={2}>2 ★ — Fair</option>
                  <option value={1}>1 ★ — Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#878787] mb-1">Review Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Terrific fragrance longevity!"
                  className="w-full h-10 bg-white border border-[#E0E0E0] px-3 text-xs text-[#212121]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#878787] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details on fragrance projection, texture, or skin results..."
                  className="w-full bg-white border border-[#E0E0E0] p-3 text-xs text-[#212121]"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full min-h-[40px] py-2.5 bg-[#2874F0] hover:bg-[#1E5BC6] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {productReviews.length === 0 ? (
              <div className="p-8 bg-[#F8F9FA] border border-[#E0E0E0] text-center">
                <p className="text-xs sm:text-sm text-[#878787]">
                  No reviews have been submitted for this product yet. Be the first buyer to review!
                </p>
              </div>
            ) : (
              productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-white border border-[#E0E0E0] rounded-xs space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono-tabular font-bold text-white bg-[#388E3C] px-1.5 py-0.5 rounded-xs">
                      {rev.rating} ★
                    </span>
                    <h4 className="font-bold text-[#212121]">{rev.title}</h4>
                  </div>
                  <p className="text-xs text-[#212121] leading-relaxed">{rev.comment}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#878787] pt-1">
                    <span>✓ {rev.authorName} · Certified Buyer</span>
                    <span className="font-mono-tabular">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 space-y-4 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#212121]">
            Similar Grooming Products
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewedProducts.length > 0 && (
        <section className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 space-y-4 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#212121]">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* FLIPKART STICKY MOBILE BOTTOM ACTION BAR (lg:hidden - White Add to Cart + #FB641B Orange Buy Now) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0E0E0] grid grid-cols-2 h-14 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          disabled={availableStock <= 0}
          onClick={() => addToCart(product.id, selectedVariantLabel, quantity, true)}
          className="h-full bg-white text-[#212121] text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 border-r border-[#E0E0E0] active:bg-[#F1F3F6]"
        >
          <ShoppingCart className="w-4 h-4 text-[#212121]" />
          <span>ADD TO CART</span>
        </button>
        <button
          type="button"
          disabled={availableStock <= 0}
          onClick={handleBuyNow}
          className="h-full bg-[#FB641B] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 active:bg-[#E85812]"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>BUY NOW · ₹{(displayPrice * quantity).toLocaleString('en-IN')}</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 bg-white text-[#212121] flex items-center justify-center rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={getOptimizedImageUrl(currentImage, 1400)}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-h-[85vh] max-w-[94vw] object-contain bg-white p-4"
          />
        </div>
      )}
    </main>
  );
};

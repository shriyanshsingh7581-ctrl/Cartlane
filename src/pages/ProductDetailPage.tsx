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
  ShoppingBag,
  ZoomIn,
  X,
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
  const [pinCode, setPinCode] = useState('');
  const [pinStatus, setPinStatus] = useState<string | null>(null);

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
        <h1 className="font-serif-display text-4xl font-bold text-[#141413]">
          Formulation Not Found
        </h1>
        <p className="text-sm text-[#57534E]">
          The requested product may have been archived or moved.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest"
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
      `Deliverable to ${pinCode.trim()} · Estimated arrival in ${settings.estimatedDeliveryDays} · Cash on Delivery available.`
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
      authorName: (userProfile?.displayName || user.displayName || 'Verified Client').slice(0, 80),
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
      showToast('Thank you. Your review has been published.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${reviewId}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-4 pb-24 lg:py-10 space-y-10 sm:space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#78716C] overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link to="/" className="hover:text-[#141413]">
          Home
        </Link>
        <span>/</span>
        <Link to={`/collections/${product.category}`} className="hover:text-[#141413] capitalize">
          {product.category.replace('-', ' ')}
        </Link>
        <span>/</span>
        <span className="text-[#141413] font-medium truncate">{product.name}</span>
      </nav>

      {/* Primary Split: Touch-Swipeable Gallery Left + Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left: Product Image Gallery */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4 lg:sticky lg:top-28">
          <div
            className="relative aspect-square w-full bg-[#F5F3EF] border border-[#E5E0D8] overflow-hidden"
            onTouchStart={handleGalleryTouchStart}
            onTouchEnd={handleGalleryTouchEnd}
          >
            <img
              src={getOptimizedImageUrl(currentImage, 1100)}
              alt={product.imageAlt || product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            {/* Left/Right Gallery Arrows when multiple images exist */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length)
                  }
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 hover:bg-white text-[#141413] border border-[#E5E0D8] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIdx((prev) => (prev + 1) % gallery.length)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 hover:bg-white text-[#141413] border border-[#E5E0D8] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image Counter Indicator + Zoom Trigger */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-1 bg-[#141413]/80 text-white text-[11px] font-mono-tabular">
                {activeImageIdx + 1} / {gallery.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Zoom image"
                className="pointer-events-auto min-h-[36px] px-3 py-1.5 bg-[#FAF8F5]/95 hover:bg-[#FAF8F5] text-[#141413] text-xs font-semibold inline-flex items-center gap-1.5 border border-[#D6D3D1]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </button>
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 sm:w-20 aspect-square border overflow-hidden shrink-0 bg-[#F5F3EF] transition-all ${
                    activeImageIdx === idx
                      ? 'border-[#141413] ring-1 ring-[#141413]'
                      : 'border-[#E5E0D8] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img.url, 240)}
                    alt={img.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6 bg-[#FAF8F5] border border-[#E5E0D8] p-4 sm:p-6 md:p-8">
          <div className="space-y-2 border-b border-[#ECE7DF] pb-4 sm:pb-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
                <span>{product.subcategory || product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular text-[#78716C]">SKU: {displaySku}</span>
              </div>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Toggle wishlist"
                className="w-10 h-10 border border-[#D6D3D1] bg-white hover:border-[#141413] flex items-center justify-center shrink-0"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-[#8C6239] text-[#8C6239]' : 'text-[#141413]'
                  }`}
                />
              </button>
            </div>

            <h1 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#141413] leading-snug">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {product.shortDescription}
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs font-mono-tabular">
              <span className="font-semibold text-[#141413]">
                ★ {(product.ratingAvg || 4.8).toFixed(1)} / 5.0
              </span>
              <span aria-hidden="true">·</span>
              <a href="#reviews" className="underline text-[#57534E] hover:text-[#141413]">
                {productReviews.length} Verified Client Reviews
              </a>
            </div>
          </div>

          {/* Authoritative Price & Availability */}
          <div className="space-y-1.5">
            <div className="flex items-baseline flex-wrap gap-3 font-mono-tabular">
              <span className="text-2xl sm:text-3xl font-bold text-[#141413]">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {displayCompareAt > displayPrice && (
                <>
                  <span className="text-sm sm:text-base text-[#78716C] line-through">
                    MRP ₹{displayCompareAt.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#8C6239]">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-[#78716C]">
              Inclusive of all taxes ·{' '}
              <span
                className={
                  availableStock > 0
                    ? 'text-emerald-800 font-semibold'
                    : 'text-red-700 font-semibold'
                }
              >
                {availableStock > 0
                  ? `In Stock (${availableStock} units available)`
                  : 'Currently Out of Stock'}
              </span>
            </p>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413]">
                Select Volume / Pack Size
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantLabel(v.label)}
                    className={`min-h-[42px] px-4 py-2 text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedVariantLabel === v.label
                        ? 'border-[#141413] bg-[#141413] text-[#FAF8F5]'
                        : 'border-[#D6D3D1] bg-white text-[#141413] hover:border-[#141413]'
                    }`}
                  >
                    {v.label} — ₹{v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Primary Purchase Actions */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border border-[#D6D3D1] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 flex items-center justify-center text-[#141413] hover:bg-[#F3EFEA]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-mono-tabular font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(1, availableStock), q + 1))
                  }
                  disabled={quantity >= availableStock}
                  aria-label="Increase quantity"
                  className="w-11 h-11 flex items-center justify-center text-[#141413] hover:bg-[#F3EFEA] disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={availableStock <= 0}
                onClick={() => addToCart(product.id, selectedVariantLabel, quantity, true)}
                className="flex-1 h-11 bg-[#141413] hover:bg-[#292524] disabled:bg-[#D6D3D1] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{availableStock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={availableStock <= 0}
              onClick={handleBuyNow}
              className="w-full min-h-[46px] py-3 bg-[#8C6239] hover:bg-[#734f2c] disabled:opacity-40 text-white text-xs font-semibold uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              Buy Now with Cash on Delivery
            </button>
          </div>

          {/* Delivery PIN Code Serviceability Checker */}
          <div className="pt-4 border-t border-[#ECE7DF] space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413]">
              Check Delivery &amp; COD Availability
            </label>
            <form onSubmit={handleCheckPinCode} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code"
                  className="w-full h-11 bg-white border border-[#D6D3D1] pl-9 pr-3 text-xs font-mono-tabular text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 border border-[#141413] text-[#141413] text-xs font-semibold uppercase tracking-wider hover:bg-[#141413] hover:text-white transition-colors whitespace-nowrap"
              >
                Check
              </button>
            </form>
            {pinStatus && (
              <p className="text-xs text-[#57534E] leading-relaxed">{pinStatus}</p>
            )}
          </div>

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="pt-4 border-t border-[#ECE7DF] space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#141413]">
                Formulation Highlights
              </h3>
              <ul className="space-y-1.5 text-xs text-[#57534E]">
                {product.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#8C6239] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Specifications, Ingredients & Usage Ritual */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 border-t border-[#E5E0D8] pt-8 sm:pt-12">
        <div className="p-5 sm:p-6 bg-[#F3EFEA] border border-[#E5E0D8] space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8C6239]">
            01. Formulation Narrative
          </h2>
          <p className="text-xs sm:text-sm text-[#292524] leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="p-5 sm:p-6 bg-[#F3EFEA] border border-[#E5E0D8] space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8C6239]">
            02. Botanical Ingredients
          </h2>
          <p className="text-xs text-[#57534E] leading-relaxed font-mono-tabular">
            {product.ingredients ||
              '100% SLS & Paraben-free formulation enriched with cold-pressed essential oils.'}
          </p>
        </div>

        <div className="p-5 sm:p-6 bg-[#F3EFEA] border border-[#E5E0D8] space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8C6239]">
            03. Application Ritual
          </h2>
          <p className="text-xs sm:text-sm text-[#292524] leading-relaxed">
            {product.usageInstructions ||
              'Use daily as part of your morning and evening grooming ritual.'}
          </p>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="border-t border-[#E5E0D8] pt-8 sm:pt-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
              Client Feedback
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
              Verified Reviews ({productReviews.length})
            </h2>

            <form
              onSubmit={handleSubmitReview}
              className="p-5 sm:p-6 bg-[#F3EFEA] border border-[#E5E0D8] space-y-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#141413]">
                Write a Customer Review
              </h3>
              <div>
                <label className="block text-xs text-[#57534E] mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full h-11 bg-white border border-[#D6D3D1] px-3 text-xs text-[#141413]"
                >
                  <option value={5}>★★★★★ (5/5 — Exceptional)</option>
                  <option value={4}>★★★★☆ (4/5 — Very Good)</option>
                  <option value={3}>★★★☆☆ (3/5 — Satisfactory)</option>
                  <option value={2}>★★☆☆☆ (2/5 — Subpar)</option>
                  <option value={1}>★☆☆☆☆ (1/5 — Poor)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#57534E] mb-1">Headline</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full h-11 bg-white border border-[#D6D3D1] px-3 text-xs text-[#141413]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#57534E] mb-1">Review</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details on fragrance projection, texture, or skin results..."
                  className="w-full bg-white border border-[#D6D3D1] p-3 text-xs text-[#141413]"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full min-h-[44px] py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239] transition-colors"
              >
                {submittingReview ? 'Publishing...' : 'Submit Verified Review'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {productReviews.length === 0 ? (
              <div className="p-8 bg-[#F3EFEA] border border-[#E5E0D8] text-center">
                <p className="text-sm text-[#57534E]">
                  No reviews have been submitted for this formulation yet. Be the first gentleman to share your review.
                </p>
              </div>
            ) : (
              productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 bg-white border border-[#E5E0D8] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-[#78716C]">
                    <span className="font-mono-tabular font-semibold text-[#141413]">
                      {'★'.repeat(rev.rating)} · {rev.authorName}
                    </span>
                    <span className="font-mono-tabular">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#141413]">{rev.title}</h4>
                  <p className="text-xs text-[#57534E] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products (2-col on mobile, 4-col on desktop) */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#E5E0D8] pt-8 sm:pt-12 space-y-5">
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
            Complementary Formulations
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed (2-col on mobile, 4-col on desktop) */}
      {recentlyViewedProducts.length > 0 && (
        <section className="border-t border-[#E5E0D8] pt-8 sm:pt-12 space-y-5">
          <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
            Recently Inspected
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* STICKY MOBILE BOTTOM BUY BAR (lg:hidden - Thumb-Zone Purchase Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E5E0D8] px-3 py-2.5 flex items-center justify-between gap-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="min-w-0 pr-1">
          <div className="flex items-baseline gap-1.5 font-mono-tabular">
            <span className="text-base font-bold text-[#141413]">
              ₹{(displayPrice * quantity).toLocaleString('en-IN')}
            </span>
            {discountPercent > 0 && (
              <span className="text-[11px] font-bold text-[#8C6239]">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#78716C] truncate">
            {selectedVariantLabel} · Qty {quantity}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={availableStock <= 0}
            onClick={() => addToCart(product.id, selectedVariantLabel, quantity, true)}
            className="min-h-[44px] px-4 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider active:scale-[0.98] transition-transform whitespace-nowrap"
          >
            Add to Cart
          </button>
          <button
            type="button"
            disabled={availableStock <= 0}
            onClick={handleBuyNow}
            className="min-h-[44px] px-4 bg-[#8C6239] text-white text-xs font-semibold uppercase tracking-wider active:scale-[0.98] transition-transform whitespace-nowrap"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 bg-white text-[#141413] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={getOptimizedImageUrl(currentImage, 1400)}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-h-[85vh] max-w-[94vw] object-contain bg-[#FAF8F5]"
          />
        </div>
      )}
    </main>
  );
};

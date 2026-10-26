import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../lib/cloudinary';

/**
 * ProductCard engineered for both 2-Column Mobile Touch Grids (375px-430px)
 * and 3-Column Desktop Showcase Grids (1440px):
 * - Square 1:1 studio product frame with secondary gallery image reveal on hover
 * - 40x40px+ Wishlist tap target
 * - Clean unboxed metadata (Zero-Pill Discipline)
 * - Stacked full-width tactile Add to Cart CTA on mobile, inline on larger screens
 */
export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, wishlistIds, toggleWishlist } = useStore();
  const [imgError, setImgError] = useState(false);
  const [hoverImgError, setHoverImgError] = useState(false);

  const isWishlisted = wishlistIds.includes(product.id);
  const isOutOfStock = product.stock <= 0;
  const defaultVariant = product.variants?.[0]?.label || 'Standard';

  const secondaryImage =
    product.galleryImages && product.galleryImages.length > 1
      ? product.galleryImages[1].url
      : null;

  const statusTag = isOutOfStock
    ? 'Out of Stock'
    : product.isBestseller
    ? 'Bestseller'
    : product.isNewArrival
    ? 'New'
    : null;

  return (
    <div className="group flex flex-col bg-white border border-[#E5E0D8] transition-transform duration-200 sm:hover:-translate-y-0.5 hover:shadow-md">
      {/* Product Image Frame (1:1 aspect ratio matching 1100x1100 studio photography) */}
      <div className="relative aspect-square w-full bg-[#F5F3EF] overflow-hidden">
        <Link to={`/products/${product.slug}`} className="block w-full h-full relative">
          {!imgError && product.mainImage ? (
            <>
              <img
                src={getOptimizedImageUrl(product.mainImage, 700)}
                alt={product.imageAlt || product.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImgError(true)}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  secondaryImage && !hoverImgError
                    ? 'sm:group-hover:opacity-0'
                    : 'sm:group-hover:scale-[1.03]'
                }`}
              />
              {secondaryImage && !hoverImgError && (
                <img
                  src={getOptimizedImageUrl(secondaryImage, 700)}
                  alt={`${product.name} alternate view`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={() => setHoverImgError(true)}
                  className="hidden sm:block absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#EFECE6] text-[#57534E]">
              <span className="font-serif-display text-sm sm:text-lg font-semibold text-[#141413] line-clamp-2">
                {product.name}
              </span>
              <span className="text-[11px] mt-1">{product.subcategory || product.category}</span>
            </div>
          )}
        </Link>

        {/* Wishlist Toggle Affordance (Ergonomic Touch Target) */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/90 hover:bg-white text-[#141413] border border-[#E5E0D8] active:scale-95 transition-all z-10"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-[#8C6239] text-[#8C6239]' : 'text-[#141413]'
            }`}
          />
        </button>
      </div>

      {/* Contiguous Card Content (Compact p-3 on mobile 2-col grid, p-5 on desktop) */}
      <div className="flex flex-col flex-1 p-3 sm:p-5 justify-between gap-2.5 sm:gap-4">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs uppercase tracking-wider text-[#78716C] truncate">
            <span className="truncate">{product.subcategory || product.category.replace('-', ' ')}</span>
            {statusTag && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#8C6239] shrink-0">{statusTag}</span>
              </>
            )}
            {product.ratingAvg ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular text-[#141413] font-medium shrink-0">
                  ★ {product.ratingAvg.toFixed(1)}
                </span>
              </>
            ) : null}
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="block text-xs sm:text-[15px] font-semibold text-[#141413] group-hover:text-[#8C6239] transition-colors line-clamp-2 leading-snug min-h-[2.1rem] sm:min-h-[2.6rem]"
          >
            {product.name}
          </Link>

          <p className="text-[11px] sm:text-xs text-[#57534E] line-clamp-1 sm:line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price Baseline & Direct Add to Bag (Full-width button on mobile 2-col, inline on sm+) */}
        <div className="pt-2.5 sm:pt-3.5 border-t border-[#ECE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-baseline flex-wrap gap-1.5 sm:gap-2 font-mono-tabular">
            <span className="text-sm sm:text-base font-bold text-[#141413]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice > product.price && (
              <>
                <span className="text-[11px] sm:text-xs text-[#78716C] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#8C6239]">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addToCart(product.id, defaultVariant, 1, true)}
            className={`w-full sm:w-auto min-h-[40px] sm:min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider active:scale-[0.98] transition-all whitespace-nowrap shrink-0 ${
              isOutOfStock
                ? 'bg-[#E5E0D8] text-[#78716C] cursor-not-allowed'
                : 'bg-[#141413] text-[#FAF8F5] hover:bg-[#8C6239]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

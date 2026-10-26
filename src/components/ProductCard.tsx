import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../lib/cloudinary';

/**
 * Flipkart-Style Marketplace Product Card:
 * - Clean white surface on #F1F3F6 canvas
 * - Square studio product image with hover secondary angle reveal
 * - Flipkart Green rating & discount callouts (#388E3C) + Cartlane Assured mark
 * - Full-width tactile ADD TO CART button (#FF9F00 / #2874F0)
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

  const ratingValue = (product.ratingAvg || 4.7).toFixed(1);

  return (
    <div className="group flex flex-col bg-white border border-[#E0E0E0] rounded-xs transition-all duration-200 hover:shadow-lg">
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full bg-white p-3 sm:p-4 overflow-hidden border-b border-[#F0F0F0]">
        <Link to={`/products/${product.slug}`} className="block w-full h-full relative">
          {!imgError && product.mainImage ? (
            <>
              <img
                src={getOptimizedImageUrl(product.mainImage, 700)}
                alt={product.imageAlt || product.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImgError(true)}
                className={`w-full h-full object-contain transition-all duration-300 ${
                  secondaryImage && !hoverImgError
                    ? 'sm:group-hover:opacity-0'
                    : 'sm:group-hover:scale-105'
                }`}
              />
              {secondaryImage && !hoverImgError && (
                <img
                  src={getOptimizedImageUrl(secondaryImage, 700)}
                  alt={`${product.name} alternate view`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={() => setHoverImgError(true)}
                  className="hidden sm:block absolute inset-0 w-full h-full object-contain p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F8F9FA] text-[#878787]">
              <span className="text-sm font-bold text-[#212121] line-clamp-2">
                {product.name}
              </span>
              <span className="text-[11px] mt-1">{product.subcategory || product.category}</span>
            </div>
          )}
        </Link>

        {/* Bestseller Top-Left Tag */}
        {product.isBestseller && !isOutOfStock && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-[#388E3C] bg-[#E8F5E9] px-1.5 py-0.5">
            BESTSELLER
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          className="absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/95 rounded-full shadow-xs border border-[#E0E0E0] active:scale-95 transition-all z-10"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-[#FF4343] text-[#FF4343]' : 'text-[#C2C2C2] hover:text-[#878787]'
            }`}
          />
        </button>
      </div>

      {/* Card Details */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 justify-between gap-2.5">
        <div className="space-y-1.5">
          {/* Brand + Pack Size */}
          <div className="flex items-center justify-between text-[11px] text-[#878787]">
            <span className="font-bold uppercase tracking-wide text-[#878787] truncate">
              CARTLANE
            </span>
            <span className="font-mono-tabular truncate">{defaultVariant}</span>
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product.slug}`}
            className="block text-xs sm:text-sm font-semibold text-[#212121] group-hover:text-[#2874F0] transition-colors line-clamp-2 leading-snug min-h-[2.1rem] sm:min-h-[2.4rem]"
          >
            {product.name}
          </Link>

          {/* Flipkart Rating Row + Assured Mark */}
          <div className="flex items-center gap-2 text-xs pt-0.5">
            <span className="font-mono-tabular font-bold text-[#388E3C]">
              {ratingValue} ★
            </span>
            <span className="text-[#878787] text-[11px]">·</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold italic text-[#2874F0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2874F0]" />
              <span>Assured</span>
            </span>
          </div>

          {/* Flipkart Price Block */}
          <div className="flex items-baseline flex-wrap gap-1.5 sm:gap-2 font-mono-tabular pt-1">
            <span className="text-sm sm:text-base font-extrabold text-[#212121]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice > product.price && (
              <>
                <span className="text-[11px] sm:text-xs text-[#878787] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#388E3C]">
                  {product.discountPercent}% off
                </span>
              </>
            )}
          </div>

          <p className="text-[10px] sm:text-[11px] text-[#212121] font-medium">
            Free delivery · <span className="text-[#388E3C] font-semibold">Hot Deal</span>
          </p>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => addToCart(product.id, defaultVariant, 1, true)}
          className={`w-full min-h-[38px] sm:min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs active:scale-[0.98] transition-all whitespace-nowrap ${
            isOutOfStock
              ? 'bg-[#E0E0E0] text-[#878787] cursor-not-allowed'
              : 'bg-[#FF9F00] hover:bg-[#FB641B] text-white shadow-xs'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};

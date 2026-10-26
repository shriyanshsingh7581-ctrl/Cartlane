import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../lib/cloudinary';

export const CartDrawer: React.FC = () => {
  const {
    cartDrawerOpen,
    setCartDrawerOpen,
    cartTotals,
    couponCode,
    applyCouponCode,
    updateCartQuantity,
    removeFromCart,
    settings,
  } = useStore();
  const [couponInput, setCouponInput] = useState(couponCode);
  const navigate = useNavigate();

  if (!cartDrawerOpen) return null;

  const {
    lineItems,
    subtotal,
    productSavings,
    couponDiscount,
    appliedCoupon,
    couponError,
    shippingFee,
    amountForFreeShipping,
    finalPayable,
  } = cartTotals;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyCouponCode(couponInput);
  };

  const progressPercent = Math.min(
    100,
    Math.round(((subtotal - couponDiscount) / Math.max(1, settings.freeShippingThreshold)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FAF8F5] h-full flex flex-col justify-between shadow-2xl border-l border-[#E5E0D8]">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#141413]" />
            <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
              Your Grooming Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close bag"
            className="w-9 h-9 flex items-center justify-center text-[#57534E] hover:text-[#141413]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {lineItems.length > 0 && (
          <div className="px-6 py-3 bg-[#F3EFEA] border-b border-[#E5E0D8] space-y-1.5">
            <p className="text-xs text-[#141413] font-medium">
              {amountForFreeShipping > 0 ? (
                <>
                  Add{' '}
                  <span className="font-mono-tabular font-semibold text-[#8C6239]">
                    ₹{amountForFreeShipping.toLocaleString('en-IN')}
                  </span>{' '}
                  more for complimentary shipping
                </>
              ) : (
                <span className="text-[#141413] font-semibold">
                  Complimentary shipping unlocked on your order
                </span>
              )}
            </p>
            <div className="w-full h-1.5 bg-[#E5E0D8] overflow-hidden">
              <div
                className="h-full bg-[#8C6239] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {lineItems.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="font-serif-display text-2xl text-[#141413]">
                Your grooming bag is currently empty
              </p>
              <p className="text-sm text-[#57534E]">
                Explore our signature Eau De Parfums, Activated Bamboo Charcoal cleansers, and cold-pressed beard oils.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/products');
                }}
                className="inline-block px-6 py-3 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239] transition-colors"
              >
                Explore Products
              </button>
            </div>
          ) : (
            lineItems.map(({ cartItem, product, unitPrice, compareAtPrice, lineSubtotal, availableStock }) => (
              <div
                key={`${cartItem.productId}_${cartItem.variantLabel}`}
                className="flex gap-4 pb-5 border-b border-[#ECE7DF]"
              >
                <Link
                  to={`/products/${product.slug}`}
                  onClick={() => setCartDrawerOpen(false)}
                  className="w-20 h-20 bg-[#F3EFEA] shrink-0 overflow-hidden border border-[#E5E0D8]"
                >
                  <img
                    src={getOptimizedImageUrl(product.mainImage, 200)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    to={`/products/${product.slug}`}
                    onClick={() => setCartDrawerOpen(false)}
                    className="text-sm font-semibold text-[#141413] hover:text-[#8C6239] line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-[#78716C]">
                    Size: {cartItem.variantLabel} · In Stock: {availableStock}
                  </p>
                  <div className="flex items-baseline gap-2 font-mono-tabular pt-0.5">
                    <span className="text-sm font-semibold text-[#141413]">
                      ₹{lineSubtotal.toLocaleString('en-IN')}
                    </span>
                    {compareAtPrice > unitPrice && (
                      <span className="text-xs text-[#78716C] line-through">
                        ₹{(compareAtPrice * cartItem.quantity).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="inline-flex items-center border border-[#D6D3D1] bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(
                            cartItem.productId,
                            cartItem.variantLabel,
                            cartItem.quantity - 1
                          )
                        }
                        aria-label="Decrease quantity"
                        className="w-7 h-7 flex items-center justify-center text-[#141413] hover:bg-[#F3EFEA]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-mono-tabular font-semibold">
                        {cartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(
                            cartItem.productId,
                            cartItem.variantLabel,
                            cartItem.quantity + 1
                          )
                        }
                        disabled={cartItem.quantity >= availableStock}
                        aria-label="Increase quantity"
                        className="w-7 h-7 flex items-center justify-center text-[#141413] hover:bg-[#F3EFEA] disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(cartItem.productId, cartItem.variantLabel)}
                      aria-label="Remove item"
                      className="text-xs text-[#78716C] hover:text-red-700 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer: Coupon & Summary */}
        {lineItems.length > 0 && (
          <div className="p-6 bg-[#F3EFEA] border-t border-[#E5E0D8] space-y-4">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Privilege code (e.g. VANGUARD20)"
                className="flex-1 bg-white border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular uppercase text-[#141413] focus:outline-none focus:border-[#141413]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#292524] whitespace-nowrap shrink-0"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-xs text-red-700">{couponError}</p>}
            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span>
                  Code {appliedCoupon.code} applied (Saved ₹
                  {couponDiscount.toLocaleString('en-IN')})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCouponInput('');
                    applyCouponCode('');
                  }}
                  className="underline"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-xs border-t border-[#E5E0D8] pt-3">
              <div className="flex justify-between text-[#57534E]">
                <span>Bag Subtotal</span>
                <span className="font-mono-tabular">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {productSavings > 0 && (
                <div className="flex justify-between text-[#8C6239]">
                  <span>Catalog MRP Savings</span>
                  <span className="font-mono-tabular">
                    -₹{productSavings.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Privilege Coupon Discount</span>
                  <span className="font-mono-tabular">
                    -₹{couponDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#57534E]">
                <span>Shipping</span>
                <span className="font-mono-tabular">
                  {shippingFee === 0 ? 'COMPLIMENTARY' : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#141413] pt-2 border-t border-[#E5E0D8]">
                <span>Payable Amount</span>
                <span className="font-mono-tabular">₹{finalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                to="/cart"
                onClick={() => setCartDrawerOpen(false)}
                className="py-3 text-center border border-[#141413] text-[#141413] text-xs font-semibold uppercase tracking-wider hover:bg-[#E5E0D8] transition-colors whitespace-nowrap"
              >
                View Full Bag
              </Link>
              <Link
                to="/checkout"
                onClick={() => setCartDrawerOpen(false)}
                className="py-3 text-center bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider hover:bg-[#8C6239] transition-colors whitespace-nowrap"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

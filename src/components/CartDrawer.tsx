import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShieldCheck, ShoppingCart, Trash2, X, Zap } from 'lucide-react';
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
      <div className="relative w-full max-w-md bg-[#F1F3F6] h-full flex flex-col justify-between shadow-2xl">
        {/* Flipkart Blue Drawer Header */}
        <div className="px-5 py-4 bg-[#2874F0] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-[#FFE500]" />
            <h2 className="text-base font-extrabold tracking-wide">
              My Cart ({lineItems.reduce((s, i) => s + i.cartItem.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close cart"
            className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {lineItems.length > 0 && (
          <div className="px-5 py-2.5 bg-white border-b border-[#E0E0E0] space-y-1.5">
            <p className="text-xs text-[#212121] font-medium">
              {amountForFreeShipping > 0 ? (
                <>
                  Add{' '}
                  <span className="font-mono-tabular font-bold text-[#2874F0]">
                    ₹{amountForFreeShipping.toLocaleString('en-IN')}
                  </span>{' '}
                  more for <strong>FREE Delivery</strong>
                </>
              ) : (
                <span className="text-[#388E3C] font-bold">
                  ✓ Yay! You get FREE Delivery on this order
                </span>
              )}
            </p>
            <div className="w-full h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#388E3C] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {lineItems.length === 0 ? (
            <div className="py-16 px-4 bg-white border border-[#E0E0E0] rounded-xs text-center space-y-4">
              <ShoppingCart className="w-12 h-12 text-[#2874F0] mx-auto" />
              <p className="text-lg font-extrabold text-[#212121]">
                Your Cartlane cart is empty!
              </p>
              <p className="text-xs text-[#878787]">
                Add items to it now from our top grooming deals.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/products');
                }}
                className="inline-block px-6 py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-xs"
              >
                Shop Now
              </button>
            </div>
          ) : (
            lineItems.map(
              ({
                cartItem,
                product,
                unitPrice,
                compareAtPrice,
                lineSubtotal,
                availableStock,
              }) => (
                <div
                  key={`${cartItem.productId}_${cartItem.variantLabel}`}
                  className="flex gap-3 p-3 bg-white border border-[#E0E0E0] rounded-xs"
                >
                  <Link
                    to={`/products/${product.slug}`}
                    onClick={() => setCartDrawerOpen(false)}
                    className="w-18 h-18 bg-white p-1 shrink-0 overflow-hidden border border-[#F0F0F0]"
                  >
                    <img
                      src={getOptimizedImageUrl(product.mainImage, 200)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      to={`/products/${product.slug}`}
                      onClick={() => setCartDrawerOpen(false)}
                      className="text-xs font-bold text-[#212121] hover:text-[#2874F0] line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] text-[#878787]">
                      Pack: {cartItem.variantLabel} ·{' '}
                      <span className="text-[#2874F0] font-semibold italic">Assured</span>
                    </p>
                    <div className="flex items-baseline gap-2 font-mono-tabular pt-0.5">
                      <span className="text-sm font-extrabold text-[#212121]">
                        ₹{lineSubtotal.toLocaleString('en-IN')}
                      </span>
                      {compareAtPrice > unitPrice && (
                        <>
                          <span className="text-[11px] text-[#878787] line-through">
                            ₹{(compareAtPrice * cartItem.quantity).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] font-bold text-[#388E3C]">
                            {product.discountPercent}% off
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-[#E0E0E0] bg-white rounded-xs">
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
                          className="w-7 h-7 flex items-center justify-center text-[#212121] hover:bg-[#F1F3F6]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono-tabular font-bold">
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
                          className="w-7 h-7 flex items-center justify-center text-[#212121] hover:bg-[#F1F3F6] disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(cartItem.productId, cartItem.variantLabel)}
                        aria-label="Remove item"
                        className="text-[11px] font-bold uppercase text-[#212121] hover:text-red-600 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Drawer Footer: Flipkart Price Details & Place Order */}
        {lineItems.length > 0 && (
          <div className="p-4 bg-white border-t border-[#E0E0E0] space-y-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter Coupon Code (e.g. ROYAL15)"
                className="flex-1 bg-[#F8F9FA] border border-[#E0E0E0] px-3 py-2 text-xs font-mono-tabular uppercase text-[#212121] focus:outline-none focus:border-[#2874F0]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1E5BC6] rounded-xs whitespace-nowrap shrink-0"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-[#388E3C] font-bold">
                <span>
                  ✓ {appliedCoupon.code} applied (-₹{couponDiscount.toLocaleString('en-IN')})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCouponInput('');
                    applyCouponCode('');
                  }}
                  className="underline text-[#878787]"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-1 text-xs border-t border-[#F0F0F0] pt-2.5">
              <div className="flex justify-between text-[#212121]">
                <span>Cart Subtotal</span>
                <span className="font-mono-tabular">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {productSavings + couponDiscount > 0 && (
                <div className="flex justify-between text-[#388E3C] font-semibold">
                  <span>Total Savings</span>
                  <span className="font-mono-tabular">
                    -₹{(productSavings + couponDiscount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#212121]">
                <span>Delivery Charges</span>
                <span className="font-mono-tabular text-[#388E3C] font-bold">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#212121] pt-2 border-t border-dashed border-[#E0E0E0]">
                <span>Total Amount</span>
                <span className="font-mono-tabular">₹{finalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                to="/cart"
                onClick={() => setCartDrawerOpen(false)}
                className="py-3 text-center border border-[#E0E0E0] text-[#212121] text-xs font-bold uppercase tracking-wider hover:bg-[#F1F3F6] rounded-xs whitespace-nowrap"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => setCartDrawerOpen(false)}
                className="py-3 text-center bg-[#FB641B] hover:bg-[#E85812] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs shadow-xs inline-flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Place Order</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Check,
  Lock,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { checkoutSchema, CheckoutFormValues } from '../schemas/validation';
import { placeOrderTransaction } from '../lib/orders';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { EmailAuthCard } from './AccountPages';

export const CartPage: React.FC = () => {
  const {
    products,
    cartTotals,
    couponCode,
    applyCouponCode,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    coupons,
    settings,
  } = useStore();
  const [couponInput, setCouponInput] = useState(couponCode);

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

  const totalMrp = lineItems.reduce(
    (sum, item) => sum + item.compareAtPrice * item.cartItem.quantity,
    0
  );
  const totalSavings = productSavings + couponDiscount + (shippingFee === 0 ? 69 : 0);

  // Recommend 3 low-ticket routine add-ons not yet in the cart
  const recommendedAddons = useMemo(() => {
    const inCartIds = new Set(lineItems.map((li) => li.product.id));
    return products
      .filter((p) => !inCartIds.has(p.id) && p.stock > 0)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
  }, [products, lineItems]);

  return (
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-32 md:py-8">
      {lineItems.length === 0 ? (
        <div className="py-16 sm:py-20 px-4 text-center bg-white border border-[#E0E0E0] rounded-xs space-y-4 shadow-2xs">
          <ShoppingCart className="w-14 h-14 text-[#2874F0] mx-auto" />
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#212121]">
              Your Cartlane Cart is empty!
            </h1>
            <p className="text-xs sm:text-sm text-[#878787] max-w-md mx-auto">
              Explore our top deals on Blanc Eau De Toilette, Activated Charcoal Face Wash, Argan Beard Oil, and Gift Kits.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-[#2874F0] hover:bg-[#1E5BC6] text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-xs"
            >
              Shop Now
            </Link>
            <Link
              to="/offers"
              className="inline-block px-6 py-3 bg-white border border-[#E0E0E0] text-[#212121] text-xs font-bold uppercase tracking-wider rounded-xs"
            >
              View Coupons
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: FLIPKART "MY CART" ITEM LIST + PLACE ORDER FOOTER */}
          <div className="lg:col-span-8 space-y-3">
            {/* Delivery Address / Free Shipping Header Bar */}
            <div className="p-3.5 sm:p-4 bg-white border border-[#E0E0E0] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-[#212121]">
                <MapPin className="w-4 h-4 text-[#2874F0] shrink-0" />
                <span>
                  Deliver to: <strong>All India Serviceable PIN Codes</strong>
                </span>
              </div>
              <div className="text-xs">
                {amountForFreeShipping > 0 ? (
                  <span className="text-[#212121]">
                    Add{' '}
                    <strong className="font-mono-tabular text-[#2874F0]">
                      ₹{amountForFreeShipping.toLocaleString('en-IN')}
                    </strong>{' '}
                    more for <strong className="text-[#388E3C]">FREE Delivery</strong>
                  </span>
                ) : (
                  <span className="text-[#388E3C] font-bold">
                    ✓ Eligible for FREE Express Delivery
                  </span>
                )}
              </div>
            </div>

            {/* Cart Items Container */}
            <div className="bg-white border border-[#E0E0E0] rounded-xs divide-y divide-[#F0F0F0] shadow-2xs">
              {lineItems.map(
                ({
                  cartItem,
                  product,
                  unitPrice,
                  compareAtPrice,
                  sku,
                  availableStock,
                  lineSubtotal,
                }) => (
                  <div
                    key={`${cartItem.productId}_${cartItem.variantLabel}`}
                    className="p-4 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Link
                          to={`/products/${product.slug}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1.5 border border-[#F0F0F0] shrink-0 overflow-hidden"
                        >
                          <img
                            src={getOptimizedImageUrl(product.mainImage, 240)}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </Link>
                        <div className="space-y-1">
                          <Link
                            to={`/products/${product.slug}`}
                            className="text-sm sm:text-base font-bold text-[#212121] hover:text-[#2874F0] line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-[#878787]">
                            Pack: {cartItem.variantLabel} · Seller: Cartlane Retail{' '}
                            <span className="text-[#2874F0] font-bold italic ml-1">
                              🛡️ Assured
                            </span>
                          </p>
                          <div className="flex items-baseline flex-wrap gap-2 font-mono-tabular pt-1">
                            {compareAtPrice > unitPrice && (
                              <span className="text-xs text-[#878787] line-through">
                                ₹{(compareAtPrice * cartItem.quantity).toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="text-base sm:text-lg font-extrabold text-[#212121]">
                              ₹{lineSubtotal.toLocaleString('en-IN')}
                            </span>
                            {compareAtPrice > unitPrice && (
                              <span className="text-xs font-extrabold text-[#388E3C]">
                                {product.discountPercent}% Off
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-[#212121] sm:text-right">
                        <p>
                          Delivery in <strong>{settings.estimatedDeliveryDays}</strong> |{' '}
                          <span className="text-[#388E3C] font-bold">Free</span>{' '}
                          <span className="text-[#878787] line-through">₹69</span>
                        </p>
                      </div>
                    </div>

                    {/* Flipkart Circular Quantity Stepper + REMOVE Action */}
                    <div className="flex items-center gap-6 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              cartItem.productId,
                              cartItem.variantLabel,
                              cartItem.quantity - 1
                            )
                          }
                          className="w-7 h-7 rounded-full border border-[#C2C2C2] flex items-center justify-center text-[#212121] hover:border-[#212121]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 h-7 border border-[#E0E0E0] flex items-center justify-center text-xs font-mono-tabular font-bold">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={cartItem.quantity >= availableStock}
                          onClick={() =>
                            updateCartQuantity(
                              cartItem.productId,
                              cartItem.variantLabel,
                              cartItem.quantity + 1
                            )
                          }
                          className="w-7 h-7 rounded-full border border-[#C2C2C2] flex items-center justify-center text-[#212121] hover:border-[#212121] disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(cartItem.productId, cartItem.variantLabel)
                        }
                        className="text-xs font-extrabold uppercase text-[#212121] hover:text-[#2874F0]"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Bottom Sticky Place Order Bar (Desktop) */}
              <div className="hidden lg:flex p-4 bg-white items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <Link
                  to="/products"
                  className="text-xs font-bold text-[#2874F0] hover:underline"
                >
                  ← Continue Shopping
                </Link>
                <Link
                  to="/checkout"
                  className="px-10 py-3.5 bg-[#FB641B] hover:bg-[#E85812] text-white text-sm font-extrabold uppercase tracking-wider rounded-xs shadow-sm"
                >
                  PLACE ORDER
                </Link>
              </div>
            </div>

            {/* Frequently Bought Together / Add-ons */}
            {recommendedAddons.length > 0 && (
              <div className="p-4 sm:p-5 bg-white border border-[#E0E0E0] rounded-xs space-y-3 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#212121]">
                  Frequently Bought Together
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendedAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="p-2.5 border border-[#E0E0E0] rounded-xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={getOptimizedImageUrl(addon.mainImage, 120)}
                          alt={addon.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 object-contain bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/products/${addon.slug}`}
                            className="text-xs font-bold text-[#212121] hover:text-[#2874F0] line-clamp-1"
                          >
                            {addon.name}
                          </Link>
                          <p className="text-xs font-mono-tabular font-extrabold text-[#388E3C]">
                            ₹{addon.price}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart(addon.id, addon.variants?.[0]?.label || 'Standard', 1, false)
                        }
                        className="shrink-0 px-2.5 py-1.5 bg-[#FF9F00] hover:bg-[#FB641B] text-white text-[10px] font-bold uppercase rounded-xs"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: FLIPKART "PRICE DETAILS" CARD */}
          <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-24">
            {/* Coupons Box */}
            <div className="bg-white border border-[#E0E0E0] rounded-xs p-4 space-y-3 shadow-2xs">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#878787] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#388E3C]" />
                <span>Apply Privilege Coupon</span>
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyCouponCode(couponInput);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter Coupon (e.g. ROYAL15)"
                  className="flex-1 bg-[#F8F9FA] border border-[#E0E0E0] px-3 py-2 text-xs font-mono-tabular uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2874F0] text-white text-xs font-bold uppercase rounded-xs"
                >
                  Apply
                </button>
              </form>
              {couponError && <p className="text-xs text-red-600">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-xs text-[#388E3C] font-bold">
                  ✓ Coupon {appliedCoupon.code} applied (-₹
                  {couponDiscount.toLocaleString('en-IN')})
                </p>
              )}

              {coupons.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  {coupons.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCouponInput(c.code);
                        applyCouponCode(c.code);
                      }}
                      className="block w-full text-left p-2 bg-[#F8F9FA] border border-dashed border-[#C2C2C2] hover:border-[#2874F0] text-xs rounded-xs transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tabular font-extrabold text-[#2874F0]">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-[#388E3C]">
                          Tap to Apply
                        </span>
                      </div>
                      <p className="text-[11px] text-[#878787] mt-0.5">{c.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Official Flipkart PRICE DETAILS Card */}
            <div className="bg-white border border-[#E0E0E0] rounded-xs shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#F0F0F0]">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#878787]">
                  Price Details
                </h2>
              </div>

              <div className="p-5 space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between text-[#212121]">
                  <span>
                    Price ({lineItems.reduce((s, i) => s + i.cartItem.quantity, 0)} items)
                  </span>
                  <span className="font-mono-tabular">
                    ₹{totalMrp.toLocaleString('en-IN')}
                  </span>
                </div>

                {productSavings > 0 && (
                  <div className="flex justify-between text-[#212121]">
                    <span>Discount</span>
                    <span className="font-mono-tabular text-[#388E3C] font-semibold">
                      − ₹{productSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#212121]">
                    <span>Coupons for you ({appliedCoupon?.code})</span>
                    <span className="font-mono-tabular text-[#388E3C] font-semibold">
                      − ₹{couponDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#212121]">
                  <span>Delivery Charges</span>
                  <span className="font-mono-tabular">
                    {shippingFee === 0 ? (
                      <>
                        <span className="text-[#878787] line-through mr-1">₹69</span>
                        <span className="text-[#388E3C] font-bold">Free</span>
                      </>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-[#212121] py-3.5 border-y border-dashed border-[#E0E0E0]">
                  <span>Total Amount</span>
                  <span className="font-mono-tabular">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-xs font-extrabold text-[#388E3C]">
                  You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
                </p>
              </div>
            </div>

            <div className="p-3 flex items-center gap-2.5 text-xs text-[#878787]">
              <ShieldCheck className="w-6 h-6 text-[#878787] shrink-0" />
              <span>
                Safe and Secure Payments. Easy returns. 100% Authentic Cartlane products.
              </span>
            </div>
          </div>

          {/* STICKY MOBILE BOTTOM PLACE ORDER BAR (lg:hidden) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0E0E0] px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <div>
              {totalMrp > finalPayable && (
                <p className="text-[11px] font-mono-tabular text-[#878787] line-through">
                  ₹{totalMrp.toLocaleString('en-IN')}
                </p>
              )}
              <p className="font-mono-tabular text-base font-extrabold text-[#212121]">
                ₹{finalPayable.toLocaleString('en-IN')}
              </p>
            </div>
            <Link
              to="/checkout"
              className="min-h-[42px] px-7 bg-[#FB641B] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs inline-flex items-center justify-center"
            >
              Place Order
            </Link>
          </div>
        </div>
      )}
    </main>
  );
};

export const CheckoutPage: React.FC = () => {
  const {
    user,
    userProfile,
    cart,
    cartTotals,
    couponCode,
    coupons,
    settings,
    addresses,
    saveCustomerAddress,
    clearCart,
    loginWithGoogle,
    showToast,
  } = useStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      fullName: userProfile?.displayName || user?.displayName || '',
      email: userProfile?.email || user?.email || '',
      phone: userProfile?.phone || '',
      house: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
      landmark: '',
      deliveryInstructions: '',
      saveAddress: true,
    },
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
      reset({
        fullName: def.fullName,
        email: def.email || userProfile?.email || user?.email || '',
        phone: def.phone,
        house: def.house,
        street: def.street,
        city: def.city,
        state: def.state,
        pinCode: def.pinCode,
        landmark: def.landmark || '',
        deliveryInstructions: '',
        saveAddress: false,
      });
    } else if (userProfile) {
      reset((prev) => ({
        ...prev,
        fullName: prev.fullName || userProfile.displayName,
        email: prev.email || userProfile.email,
        phone: prev.phone || userProfile.phone || '',
      }));
    }
  }, [addresses, userProfile]);

  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    const found = addresses.find((a) => a.id === addrId);
    if (found) {
      reset({
        fullName: found.fullName,
        email: found.email || userProfile?.email || user?.email || '',
        phone: found.phone,
        house: found.house,
        street: found.street,
        city: found.city,
        state: found.state,
        pinCode: found.pinCode,
        landmark: found.landmark || '',
        deliveryInstructions: '',
        saveAddress: false,
      });
    }
  };

  const activeUid = user?.uid || userProfile?.uid || '';
  const activeEmail = userProfile?.email || user?.email || '';
  const activeName = userProfile?.displayName || user?.displayName || '';

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!activeUid) {
      showToast('Please sign in with Email & Password or Google to place your order.', 'info');
      return;
    }
    if (!settings.codEnabled) {
      setOrderError('Cash on Delivery is currently disabled by store settings.');
      return;
    }

    setSubmitting(true);
    setOrderError(null);

    try {
      if (values.saveAddress) {
        await saveCustomerAddress({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          house: values.house,
          street: values.street,
          city: values.city,
          state: values.state,
          pinCode: values.pinCode,
          landmark: values.landmark,
          isDefault: addresses.length === 0,
        });
      }

      const order = await placeOrderTransaction({
        uid: activeUid,
        checkoutData: values,
        cartItems: cart,
        couponCode,
        coupons,
        settings,
      });

      await clearCart();
      showToast(`Order ${order.id} confirmed!`);
      navigate(`/account/orders/${order.id}`);
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : 'Unable to complete order. Please verify stock.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartTotals.lineItems.length === 0) {
    return (
      <main className="max-w-[1440px] mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-[#212121]">
          Your Cartlane cart is empty
        </h1>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-widest rounded-xs"
        >
          Shop Products
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-4 pb-32 md:py-8">
      {!activeUid ? (
        <div className="max-w-xl mx-auto bg-white border border-[#E0E0E0] rounded-xs overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#2874F0] text-white flex items-center gap-3">
            <span className="w-6 h-6 bg-white text-[#2874F0] text-xs font-extrabold flex items-center justify-center rounded-xs">
              1
            </span>
            <h1 className="text-sm font-extrabold uppercase tracking-wider">
              LOGIN OR SIGNUP TO CHECKOUT
            </h1>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-[#212121] leading-relaxed">
              Sign in with your Email &amp; Password or create an account below to unlock Cash on Delivery checkout and live shipment tracking.
            </p>
            <EmailAuthCard compact />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
        >
          {/* LEFT COLUMN: FLIPKART 4-STEP CHECKOUT ACCORDION */}
          <div className="lg:col-span-8 space-y-3">
            {/* STEP 1: LOGIN VERIFIED */}
            <div className="bg-white border border-[#E0E0E0] rounded-xs p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#F1F3F6] text-[#2874F0] text-xs font-extrabold flex items-center justify-center rounded-xs shrink-0">
                  1
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase text-[#878787] flex items-center gap-1.5">
                    <span>LOGIN</span>
                    <Check className="w-4 h-4 text-[#2874F0]" />
                  </p>
                  <p className="text-xs font-bold text-[#212121] mt-0.5">
                    {activeName} ·{' '}
                    <span className="font-normal text-[#878787]">{activeEmail}</span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#388E3C] uppercase">
                Verified
              </span>
            </div>

            {/* STEP 2: DELIVERY ADDRESS */}
            <div className="bg-white border border-[#E0E0E0] rounded-xs overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-[#2874F0] text-white flex items-center gap-3">
                <span className="w-6 h-6 bg-white text-[#2874F0] text-xs font-extrabold flex items-center justify-center rounded-xs">
                  2
                </span>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                  DELIVERY ADDRESS
                </h2>
              </div>

              <div className="p-4 sm:p-6 space-y-5">
                {addresses.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold uppercase text-[#878787]">
                      Saved Addresses
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr.id)}
                          className={`p-3.5 text-left border rounded-xs transition-colors ${
                            selectedAddressId === addr.id
                              ? 'border-[#2874F0] bg-[#E3F2FD]/30'
                              : 'border-[#E0E0E0] bg-white hover:border-[#2874F0]'
                          }`}
                        >
                          <p className="text-xs font-extrabold text-[#212121]">
                            {addr.fullName} · {addr.phone}
                          </p>
                          <p className="text-xs text-[#555555] mt-1 line-clamp-2">
                            {addr.house}, {addr.street}, {addr.city}, {addr.state} -{' '}
                            <strong>{addr.pinCode}</strong>
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">
                      Full Name *
                    </label>
                    <input
                      {...register('fullName')}
                      className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#2874F0]"
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">
                      10-digit mobile number *
                    </label>
                    <input
                      {...register('phone')}
                      placeholder="9876543210"
                      className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs font-mono-tabular rounded-xs focus:outline-none focus:border-[#2874F0]"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">
                      Pincode (6 digits) *
                    </label>
                    <input
                      {...register('pinCode')}
                      maxLength={6}
                      placeholder="110001"
                      className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs font-mono-tabular rounded-xs focus:outline-none focus:border-[#2874F0]"
                    />
                    {errors.pinCode && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {errors.pinCode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">
                      Email Address *
                    </label>
                    <input
                      {...register('email')}
                      className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#2874F0]"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212121] mb-1">
                    Flat, House no., Building, Company, Apartment *
                  </label>
                  <input
                    {...register('house')}
                    className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#2874F0]"
                  />
                  {errors.house && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.house.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212121] mb-1">
                    Area, Street, Sector, Village *
                  </label>
                  <input
                    {...register('street')}
                    className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#2874F0]"
                  />
                  {errors.street && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">
                      City / District / Town *
                    </label>
                    <input
                      {...register('city')}
                      className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#2874F0]"
                    />
                    {errors.city && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">
                      State *
                    </label>
                    <input
                      {...register('state')}
                      className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#2874F0]"
                    />
                    {errors.state && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      {...register('landmark')}
                      className="w-full border border-[#D0D0D0] px-3 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="save-addr"
                    type="checkbox"
                    {...register('saveAddress')}
                    className="w-4 h-4 accent-[#2874F0]"
                  />
                  <label htmlFor="save-addr" className="text-xs text-[#212121]">
                    Save this address for faster future checkout
                  </label>
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT OPTIONS */}
            <div className="bg-white border border-[#E0E0E0] rounded-xs overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-[#2874F0] text-white flex items-center gap-3">
                <span className="w-6 h-6 bg-white text-[#2874F0] text-xs font-extrabold flex items-center justify-center rounded-xs">
                  3
                </span>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                  PAYMENT OPTIONS
                </h2>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="p-4 border-2 border-[#2874F0] bg-[#E3F2FD]/25 rounded-xs flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked
                      readOnly
                      className="mt-1 w-4 h-4 accent-[#2874F0]"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-[#212121]">
                        Cash on Delivery (Pay via Cash or UPI at Doorstep)
                      </p>
                      <p className="text-xs text-[#555555] mt-0.5">
                        Zero extra COD handling charges. Pay upon receiving your sealed Cartlane order.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#388E3C] shrink-0">
                    SELECTED
                  </span>
                </div>

                {orderError && (
                  <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{orderError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 py-4 bg-[#FB641B] hover:bg-[#E85812] disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xs shadow-sm transition-colors"
                >
                  {submitting
                    ? 'CONFIRMING ORDER...'
                    : `CONFIRM COD ORDER · ₹${cartTotals.finalPayable.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PRICE DETAILS SUMMARY */}
          <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-24">
            <div className="bg-white border border-[#E0E0E0] rounded-xs shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#F0F0F0]">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#878787]">
                  Order Summary ({cartTotals.lineItems.length} Items)
                </h2>
              </div>

              <div className="p-5 space-y-3">
                <div className="divide-y divide-[#F0F0F0] max-h-60 overflow-y-auto pr-1">
                  {cartTotals.lineItems.map(({ cartItem, product, lineSubtotal }) => (
                    <div
                      key={`${cartItem.productId}_${cartItem.variantLabel}`}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={getOptimizedImageUrl(product.mainImage, 100)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-contain bg-white border border-[#F0F0F0] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#212121] truncate">{product.name}</p>
                          <p className="text-[#878787]">
                            {cartItem.variantLabel} × {cartItem.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono-tabular font-bold text-[#212121] shrink-0">
                        ₹{lineSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs border-t border-[#F0F0F0] pt-3">
                  <div className="flex justify-between text-[#212121]">
                    <span>Items Subtotal</span>
                    <span className="font-mono-tabular">
                      ₹{cartTotals.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {cartTotals.couponDiscount > 0 && (
                    <div className="flex justify-between text-[#388E3C] font-semibold">
                      <span>Coupon ({cartTotals.appliedCoupon?.code})</span>
                      <span className="font-mono-tabular">
                        − ₹{cartTotals.couponDiscount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#212121]">
                    <span>Delivery Charges</span>
                    <span className="font-mono-tabular text-[#388E3C] font-bold">
                      {cartTotals.shippingFee === 0 ? 'FREE' : `₹${cartTotals.shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[#212121] pt-3 border-t border-dashed border-[#E0E0E0]">
                    <span>Total Payable</span>
                    <span className="font-mono-tabular">
                      ₹{cartTotals.finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STICKY MOBILE BOTTOM CHECKOUT BAR (lg:hidden) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0E0E0] px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#878787]">
                Payable on Delivery
              </p>
              <p className="font-mono-tabular text-base font-extrabold text-[#212121]">
                ₹{cartTotals.finalPayable.toLocaleString('en-IN')}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[42px] px-6 bg-[#FB641B] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs whitespace-nowrap"
            >
              {submitting ? 'Confirming...' : 'Confirm Order'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
};

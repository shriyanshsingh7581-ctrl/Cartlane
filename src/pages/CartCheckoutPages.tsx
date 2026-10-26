import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { checkoutSchema, CheckoutFormValues } from '../schemas/validation';
import { placeOrderTransaction } from '../lib/orders';
import { getOptimizedImageUrl } from '../lib/cloudinary';

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

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / Math.max(1, settings.freeShippingThreshold)) * 100)
  );

  // Recommend 3 low-ticket routine add-ons not yet in the cart
  const recommendedAddons = useMemo(() => {
    const inCartIds = new Set(lineItems.map((li) => li.product.id));
    return products
      .filter((p) => !inCartIds.has(p.id) && p.stock > 0)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
  }, [products, lineItems]);

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-32 md:py-12 space-y-8 sm:space-y-10">
      <div className="border-b border-[#E5E0D8] pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
            Cartlane Grooming Bag
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#141413]">
            Review Your Selections ({lineItems.reduce((sum, i) => sum + i.cartItem.quantity, 0)})
          </h1>
        </div>
        <Link
          to="/products"
          className="text-xs font-semibold uppercase tracking-wider text-[#141413] hover:text-[#8C6239] underline underline-offset-4"
        >
          ← Continue Shopping
        </Link>
      </div>

      {lineItems.length === 0 ? (
        <div className="py-16 sm:py-20 px-4 text-center bg-[#F3EFEA] border border-[#E5E0D8] space-y-5">
          <ShoppingBag className="w-12 h-12 text-[#8C6239] mx-auto" />
          <div className="space-y-2">
            <h2 className="font-serif-display text-3xl font-bold text-[#141413]">
              Your Cartlane bag is empty
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] max-w-md mx-auto">
              Explore our signature Blanc Eau De Toilette, Activated Charcoal Face Wash, Argan Beard Oil, or Luxury Grooming Kits to start your routine.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/products"
              className="inline-block px-7 py-3.5 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239] transition-colors"
            >
              Explore Bestsellers
            </Link>
            <Link
              to="/offers"
              className="inline-block px-6 py-3.5 bg-white border border-[#141413] text-[#141413] text-xs font-semibold uppercase tracking-widest hover:bg-[#F3EFEA] transition-colors"
            >
              View Coupons &amp; Deals
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Itemized List + Routine Add-ons */}
          <div className="lg:col-span-8 space-y-6">
            {/* Free Shipping Progress Bar */}
            <div className="p-4 bg-[#F3EFEA] border border-[#E5E0D8] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                {amountForFreeShipping > 0 ? (
                  <span className="text-[#141413] font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#8C6239] shrink-0" />
                    <span>
                      Add{' '}
                      <strong className="font-mono-tabular text-[#8C6239]">
                        ₹{amountForFreeShipping.toLocaleString('en-IN')}
                      </strong>{' '}
                      more for <strong>FREE Insured Delivery</strong> (Free above ₹
                      {settings.freeShippingThreshold})
                    </span>
                  </span>
                ) : (
                  <span className="text-emerald-900 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Unlocked! Your order qualifies for FREE Express Shipping across India.
                    </span>
                  </span>
                )}
                <span className="font-mono-tabular text-[11px] font-bold text-[#8C6239]">
                  {freeShippingProgress}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#E5E0D8] overflow-hidden">
                <div
                  className="h-full bg-[#8C6239] transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="divide-y divide-[#E5E0D8] border border-[#E5E0D8] bg-white px-4 sm:px-6">
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
                    className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Link
                        to={`/products/${product.slug}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F3EFEA] border border-[#E5E0D8] shrink-0 overflow-hidden"
                      >
                        <img
                          src={getOptimizedImageUrl(product.mainImage, 240)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="space-y-1 min-w-0 flex-1">
                        <Link
                          to={`/products/${product.slug}`}
                          className="text-sm sm:text-base font-semibold text-[#141413] hover:text-[#8C6239] line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[11px] text-[#78716C] font-mono-tabular">
                          Pack: {cartItem.variantLabel} · SKU: {sku}
                        </p>
                        <div className="flex items-baseline gap-2 font-mono-tabular">
                          <span className="text-xs sm:text-sm font-bold text-[#141413]">
                            ₹{unitPrice.toLocaleString('en-IN')}
                          </span>
                          {compareAtPrice > unitPrice && (
                            <span className="text-[11px] text-[#78716C] line-through">
                              ₹{compareAtPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ECE7DF]">
                      <div className="inline-flex items-center border border-[#D6D3D1] bg-[#FAF8F5]">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              cartItem.productId,
                              cartItem.variantLabel,
                              cartItem.quantity - 1
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center text-[#141413] hover:bg-[#E5E0D8]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3.5 text-xs font-mono-tabular font-semibold">
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
                          className="w-9 h-9 flex items-center justify-center text-[#141413] hover:bg-[#E5E0D8] disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[85px] font-mono-tabular">
                        <p className="text-sm sm:text-base font-bold text-[#141413]">
                          ₹{lineSubtotal.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(cartItem.productId, cartItem.variantLabel)
                        }
                        aria-label="Remove item"
                        className="p-2 text-[#78716C] hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Complete Your Grooming Routine Upsell Strip */}
            {recommendedAddons.length > 0 && (
              <div className="p-4 sm:p-6 bg-[#FAF8F5] border border-[#E5E0D8] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8C6239]" />
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#141413]">
                      Complete Your Grooming Routine
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#78716C]">Quick 1-Tap Add</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendedAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="p-3 bg-white border border-[#E5E0D8] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getOptimizedImageUrl(addon.mainImage, 120)}
                          alt={addon.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover bg-[#F3EFEA] shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/products/${addon.slug}`}
                            className="text-xs font-semibold text-[#141413] hover:text-[#8C6239] line-clamp-1"
                          >
                            {addon.name}
                          </Link>
                          <p className="text-xs font-mono-tabular font-bold text-[#8C6239]">
                            ₹{addon.price}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            productId: addon.id,
                            variantLabel: addon.variants[0]?.label || 'Standard',
                            quantity: 1,
                          })
                        }
                        className="shrink-0 px-3 py-2 bg-[#141413] hover:bg-[#8C6239] text-white text-[10px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary & Privilege Coupons */}
          <div className="lg:col-span-4 bg-[#F3EFEA] border border-[#E5E0D8] p-5 sm:p-8 space-y-6 lg:sticky lg:top-28">
            <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
              Order Summary
            </h2>

            {/* Coupon Form */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#8C6239]" />
                <span>Privilege Coupon Code</span>
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
                  placeholder="Enter code (e.g. ROYAL15)"
                  className="flex-1 bg-white border border-[#D6D3D1] px-3 py-2.5 text-xs font-mono-tabular uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#8C6239] transition-colors"
                >
                  Apply
                </button>
              </form>
              {couponError && <p className="text-xs text-red-700">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-xs text-emerald-800 font-semibold">
                  ✓ Applied {appliedCoupon.code}: Saved ₹
                  {couponDiscount.toLocaleString('en-IN')}
                </p>
              )}

              {/* Available Coupons Helper */}
              {coupons.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">
                    Tap to Apply Storefront Coupon:
                  </p>
                  {coupons.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCouponInput(c.code);
                        applyCouponCode(c.code);
                      }}
                      className="block w-full text-left p-2.5 bg-white border border-[#E5E0D8] hover:border-[#8C6239] text-xs transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tabular font-bold text-[#8C6239]">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-mono-tabular uppercase text-[#141413] font-semibold">
                          Tap to Apply
                        </span>
                      </div>
                      <p className="text-[11px] text-[#57534E] mt-0.5">{c.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2.5 text-sm border-t border-[#E5E0D8] pt-4">
              <div className="flex justify-between text-[#57534E]">
                <span>Bag Subtotal</span>
                <span className="font-mono-tabular">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {productSavings > 0 && (
                <div className="flex justify-between text-[#8C6239]">
                  <span>MRP Discount Savings</span>
                  <span className="font-mono-tabular">
                    -₹{productSavings.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span className="font-mono-tabular">
                    -₹{couponDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#57534E]">
                <span>Insured Shipping</span>
                <span className="font-mono-tabular font-semibold">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#141413] pt-3 border-t border-[#E5E0D8]">
                <span>Total Payable</span>
                <span className="font-mono-tabular">
                  ₹{finalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full py-4 text-center bg-[#141413] hover:bg-[#8C6239] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 space-y-1.5 text-[11px] text-[#57534E]">
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8C6239] shrink-0" />
                <span>100% Authentic Cartlane Formulations · Cash on Delivery Available</span>
              </p>
            </div>
          </div>

          {/* STICKY MOBILE BOTTOM CART CHECKOUT BAR (lg:hidden) */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E5E0D8] px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#78716C]">
                Total Payable ({lineItems.length} items)
              </p>
              <p className="font-mono-tabular text-base font-bold text-[#141413]">
                ₹{finalPayable.toLocaleString('en-IN')}
              </p>
            </div>
            <Link
              to="/checkout"
              className="min-h-[44px] px-6 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
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

  // Pre-fill when user profile or default saved address loads
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

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!user) {
      showToast('Please sign in with Google to place your order.', 'info');
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
        uid: user.uid,
        checkoutData: values,
        cartItems: cart,
        couponCode,
        coupons,
        settings,
      });

      await clearCart();
      showToast(`Order ${order.id} confirmed.`);
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
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Your Cartlane bag is empty
        </h1>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
        >
          Browse Formulations
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-32 md:py-12 space-y-8 sm:space-y-10">
      <div className="border-b border-[#E5E0D8] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
            Cartlane Verified Dispatch Checkout
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#141413]">
            Shipping &amp; Order Confirmation
          </h1>
        </div>
        <Link
          to="/cart"
          className="text-xs font-semibold uppercase tracking-wider text-[#141413] underline underline-offset-4"
        >
          ← Back to Bag
        </Link>
      </div>

      {/* Authentication Gate */}
      {!user ? (
        <div className="p-6 sm:p-8 bg-[#F3EFEA] border border-[#E5E0D8] max-w-xl space-y-4">
          <div className="flex items-center gap-2.5 text-[#141413]">
            <Lock className="w-5 h-5 text-[#8C6239]" />
            <h2 className="font-serif-display text-2xl font-bold">
              Sign in with Google to Complete Your Order
            </h2>
          </div>
          <p className="text-xs text-[#57534E] leading-relaxed">
            To protect your order history, enable real-time shipment tracking, and verify inventory reservation, please authenticate with your Google account.
          </p>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="px-6 py-3.5 bg-[#141413] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239] transition-colors"
          >
            Continue with Google Sign-In
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* Left: Shipping Details & Payment Method */}
          <div className="lg:col-span-7 space-y-8">
            {/* Saved Addresses Selector */}
            {addresses.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#141413]">
                  Select a Saved Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={`p-4 text-left border transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-[#141413] bg-[#F3EFEA]'
                          : 'border-[#E5E0D8] bg-white hover:border-[#8C6239]'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#141413]">{addr.fullName}</p>
                      <p className="text-xs text-[#57534E] mt-1 line-clamp-2">
                        {addr.house}, {addr.street}, {addr.city}, {addr.state} -{' '}
                        {addr.pinCode}
                      </p>
                      <p className="text-[11px] font-mono-tabular text-[#78716C] mt-1">
                        Phone: {addr.phone}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address Form */}
            <div className="p-5 sm:p-8 bg-white border border-[#E5E0D8] space-y-5">
              <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
                Delivery Recipient &amp; Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#141413] mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName')}
                    className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-red-700 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#141413] mb-1">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-700 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#141413] mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="9876543210"
                    className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs font-mono-tabular"
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-700 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#141413] mb-1">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    {...register('pinCode')}
                    maxLength={6}
                    placeholder="110001"
                    className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs font-mono-tabular"
                  />
                  {errors.pinCode && (
                    <p className="text-[11px] text-red-700 mt-1">{errors.pinCode.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#141413] mb-1">
                  House / Flat / Building / Apartment *
                </label>
                <input
                  {...register('house')}
                  className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
                />
                {errors.house && (
                  <p className="text-[11px] text-red-700 mt-1">{errors.house.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#141413] mb-1">
                  Street, Sector &amp; Locality *
                </label>
                <input
                  {...register('street')}
                  className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
                />
                {errors.street && (
                  <p className="text-[11px] text-red-700 mt-1">{errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#141413] mb-1">
                    City *
                  </label>
                  <input
                    {...register('city')}
                    className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
                  />
                  {errors.city && (
                    <p className="text-[11px] text-red-700 mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#141413] mb-1">
                    State *
                  </label>
                  <input
                    {...register('state')}
                    className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
                  />
                  {errors.state && (
                    <p className="text-[11px] text-red-700 mt-1">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#141413] mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    {...register('landmark')}
                    className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#141413] mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  {...register('deliveryInstructions')}
                  placeholder="Gate security code, preferred delivery hours..."
                  className="w-full border border-[#D6D3D1] px-3.5 py-2.5 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="save-addr"
                  type="checkbox"
                  {...register('saveAddress')}
                  className="w-4 h-4 accent-[#141413]"
                />
                <label htmlFor="save-addr" className="text-xs text-[#57534E]">
                  Save this address to my Cartlane account for future orders
                </label>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="p-5 sm:p-8 bg-white border border-[#E5E0D8] space-y-4">
              <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
                Payment Method
              </h2>

              <div className="p-4 border border-[#141413] bg-[#FAF8F5] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#141413]">
                    Cash on Delivery (Pay on Doorstep Arrival)
                  </p>
                  <p className="text-xs text-[#57534E]">
                    Pay in cash or UPI directly to the courier partner upon receiving your sealed Cartlane parcel.
                  </p>
                </div>
                <span className="text-xs font-mono-tabular font-semibold text-[#8C6239] shrink-0">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Right: Authoritative Order Summary */}
          <div className="lg:col-span-5 bg-[#F3EFEA] border border-[#E5E0D8] p-5 sm:p-8 space-y-6 lg:sticky lg:top-28">
            <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
              Authoritative Order Breakdown
            </h2>

            <div className="divide-y divide-[#E5E0D8] max-h-72 overflow-y-auto pr-1">
              {cartTotals.lineItems.map(({ cartItem, product, lineSubtotal }) => (
                <div
                  key={`${cartItem.productId}_${cartItem.variantLabel}`}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getOptimizedImageUrl(product.mainImage, 100)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 object-cover bg-white border border-[#E5E0D8] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#141413] truncate">{product.name}</p>
                      <p className="text-[#78716C]">
                        {cartItem.variantLabel} × {cartItem.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-tabular font-semibold text-[#141413] shrink-0">
                    ₹{lineSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-[#E5E0D8] pt-4">
              <div className="flex justify-between text-[#57534E]">
                <span>Items Subtotal</span>
                <span className="font-mono-tabular">
                  ₹{cartTotals.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {cartTotals.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Privilege Coupon ({cartTotals.appliedCoupon?.code})</span>
                  <span className="font-mono-tabular">
                    -₹{cartTotals.couponDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#57534E]">
                <span>Shipping Fee</span>
                <span className="font-mono-tabular">
                  {cartTotals.shippingFee === 0
                    ? 'COMPLIMENTARY'
                    : `₹${cartTotals.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#141413] pt-3 border-t border-[#E5E0D8]">
                <span>Payable on Delivery</span>
                <span className="font-mono-tabular">
                  ₹{cartTotals.finalPayable.toLocaleString('en-IN')}
                </span>
              </div>
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
              className="w-full py-4 bg-[#141413] hover:bg-[#8C6239] disabled:opacity-50 text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              {submitting
                ? 'Reserving Stock & Placing Order...'
                : `Place COD Order · ₹${cartTotals.finalPayable.toLocaleString('en-IN')}`}
            </button>

            <div className="pt-2 space-y-2 text-[11px] text-[#57534E]">
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8C6239] shrink-0" />
                <span>
                  Inventory and pricing are verified transactionally in Firestore before order confirmation.
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8C6239] shrink-0" />
                <span>
                  Estimated delivery: {settings.estimatedDeliveryDays} · {settings.returnWindowDays}-day return policy.
                </span>
              </p>
            </div>
          </div>

          {/* STICKY MOBILE BOTTOM CHECKOUT BAR (lg:hidden) */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E5E0D8] px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#78716C]">
                Payable on Delivery (COD)
              </p>
              <p className="font-mono-tabular text-base font-bold text-[#141413]">
                ₹{cartTotals.finalPayable.toLocaleString('en-IN')}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-6 bg-[#141413] hover:bg-[#8C6239] disabled:opacity-50 text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest active:scale-[0.98] transition-all whitespace-nowrap"
            >
              {submitting ? 'Placing Order...' : 'Place COD Order'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
};

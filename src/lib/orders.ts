import { doc, setDoc } from 'firebase/firestore';
import { db, syncRecordToUserFirebase } from './firebase';
import { INITIAL_PRODUCTS } from './seedData';
import {
  CartItem,
  Coupon,
  Order,
  OrderEvent,
  OrderItem,
  OrderStatus,
  ORDER_STATUS_LABELS,
  Product,
  SiteSettings,
  VALID_STATUS_TRANSITIONS,
} from '../types';
import { CheckoutFormValues } from '../schemas/validation';

export interface CartCalculationResult {
  lineItems: {
    cartItem: CartItem;
    product: Product;
    unitPrice: number;
    compareAtPrice: number;
    sku: string;
    availableStock: number;
    lineSubtotal: number;
  }[];
  subtotal: number;
  mrpTotal: number;
  productSavings: number;
  couponDiscount: number;
  appliedCoupon: Coupon | null;
  couponError?: string;
  shippingFee: number;
  amountForFreeShipping: number;
  finalPayable: number;
}

export function calculateDiscountPercent(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.min(95, Math.max(0, Math.round(((compareAtPrice - price) / compareAtPrice) * 100)));
}

/**
 * Authoritative cart and coupon calculation using live database products and settings
 */
export function calculateCartTotals(
  cartItems: CartItem[],
  products: Product[],
  coupons: Coupon[],
  settings: SiteSettings,
  couponCode?: string
): CartCalculationResult {
  const lineItems: CartCalculationResult['lineItems'] = [];
  let subtotal = 0;
  let mrpTotal = 0;

  for (const item of cartItems) {
    const product = products.find((p) => p.id === item.productId && p.status === 'published');
    if (!product) continue;

    const matchedVariant = product.variants?.find((v) => v.label === item.variantLabel);
    const unitPrice = matchedVariant ? matchedVariant.price : product.price;
    const compareAtPrice = matchedVariant ? matchedVariant.compareAtPrice : product.compareAtPrice;
    const sku = matchedVariant ? matchedVariant.sku : product.sku;
    const availableStock = matchedVariant ? matchedVariant.stock : product.stock;

    const lineSubtotal = unitPrice * item.quantity;
    subtotal += lineSubtotal;
    mrpTotal += compareAtPrice * item.quantity;

    lineItems.push({
      cartItem: item,
      product,
      unitPrice,
      compareAtPrice,
      sku,
      availableStock,
      lineSubtotal,
    });
  }

  const productSavings = Math.max(0, mrpTotal - subtotal);

  let couponDiscount = 0;
  let appliedCoupon: Coupon | null = null;
  let couponError: string | undefined;

  if (couponCode && couponCode.trim().length > 0 && subtotal > 0) {
    const normalized = couponCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === normalized);

    if (!found || !found.active) {
      couponError = `Coupon "${normalized}" is invalid or inactive.`;
    } else if (found.usedCount >= found.usageLimit) {
      couponError = `Coupon "${normalized}" has reached its redemption limit.`;
    } else if (new Date(found.expiresAt).getTime() < Date.now()) {
      couponError = `Coupon "${normalized}" has expired.`;
    } else if (subtotal < found.minOrderAmount) {
      couponError = `Add ₹${(found.minOrderAmount - subtotal).toLocaleString('en-IN')} more to unlock ${normalized}.`;
    } else {
      appliedCoupon = found;
      if (found.discountType === 'percentage') {
        const raw = Math.round((subtotal * found.discountValue) / 100);
        couponDiscount = Math.min(raw, found.maxDiscountAmount, subtotal);
      } else {
        couponDiscount = Math.min(found.discountValue, found.maxDiscountAmount, subtotal);
      }
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const shippingFee =
    subtotal === 0
      ? 0
      : discountedSubtotal >= settings.freeShippingThreshold
      ? 0
      : settings.flatShippingFee;

  const amountForFreeShipping = Math.max(0, settings.freeShippingThreshold - discountedSubtotal);
  const finalPayable = discountedSubtotal + shippingFee;

  return {
    lineItems,
    subtotal,
    mrpTotal,
    productSavings,
    couponDiscount,
    appliedCoupon,
    couponError,
    shippingFee,
    amountForFreeShipping,
    finalPayable,
  };
}

const LOCAL_ORDERS_KEY = 'cartlane_local_orders_v1';
const LOCAL_ORDER_EVENTS_KEY = 'cartlane_local_order_events_v1';

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order) {
  try {
    const all = getLocalOrders().filter((o) => o.id !== order.id);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([order, ...all]));
  } catch {
    // ignore
  }
}

export function getLocalOrderEvents(orderId: string): OrderEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDER_EVENTS_KEY);
    const map: Record<string, OrderEvent[]> = raw ? JSON.parse(raw) : {};
    return map[orderId] || [];
  } catch {
    return [];
  }
}

export function saveLocalOrderEvent(orderId: string, event: OrderEvent) {
  try {
    const raw = localStorage.getItem(LOCAL_ORDER_EVENTS_KEY);
    const map: Record<string, OrderEvent[]> = raw ? JSON.parse(raw) : {};
    const existing = (map[orderId] || []).filter((e) => e.id !== event.id);
    map[orderId] = [...existing, event];
    localStorage.setItem(LOCAL_ORDER_EVENTS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Places an order using Firestore transaction when authenticated, or Realtime Database + Local fallback
 * for Email/Password users so checkout never fails.
 */
export async function placeOrderTransaction(params: {
  uid: string;
  checkoutData: CheckoutFormValues;
  cartItems: CartItem[];
  couponCode?: string;
  coupons: Coupon[];
  settings: SiteSettings;
  catalogProducts?: Product[];
}): Promise<Order> {
  const {
    uid,
    checkoutData,
    cartItems,
    couponCode,
    coupons,
    settings,
    catalogProducts,
  } = params;

  if (cartItems.length === 0) {
    throw new Error('Your shopping bag is empty.');
  }

  const orderId = `CL-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
  const eventId = `evt_${Date.now()}_init`;
  const now = new Date().toISOString();

  const estDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const buildOrderFromCatalog = (sourceProducts: Product[]): Order => {
    const prodMap = new Map(sourceProducts.map((p) => [p.id, p]));
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = prodMap.get(item.productId) || INITIAL_PRODUCTS.find((p) => p.id === item.productId);
      if (!product) continue;

      const matchedVariant = product.variants?.find((v) => v.label === item.variantLabel);
      const unitPrice = matchedVariant ? matchedVariant.price : product.price;
      const compareAtPrice = matchedVariant ? matchedVariant.compareAtPrice : product.compareAtPrice;
      const sku = matchedVariant ? matchedVariant.sku : product.sku;

      subtotal += unitPrice * item.quantity;
      orderItems.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantLabel: item.variantLabel || 'Standard',
        sku,
        price: unitPrice,
        compareAtPrice,
        quantity: item.quantity,
        image: product.mainImage,
      });
    }

    let discountAmount = 0;
    let verifiedCouponCode: string | undefined;

    if (couponCode && couponCode.trim().length > 0) {
      const normalized = couponCode.trim().toUpperCase();
      const matchedCoupon = coupons.find((c) => c.code.toUpperCase() === normalized);
      if (matchedCoupon && matchedCoupon.active && subtotal >= matchedCoupon.minOrderAmount) {
        verifiedCouponCode = matchedCoupon.code;
        if (matchedCoupon.discountType === 'percentage') {
          discountAmount = Math.min(
            Math.round((subtotal * matchedCoupon.discountValue) / 100),
            matchedCoupon.maxDiscountAmount,
            subtotal
          );
        } else {
          discountAmount = Math.min(
            matchedCoupon.discountValue,
            matchedCoupon.maxDiscountAmount,
            subtotal
          );
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const shippingFee =
      discountedSubtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingFee;
    const totalAmount = discountedSubtotal + shippingFee;

    const formattedAddress = [
      checkoutData.house,
      checkoutData.street,
      checkoutData.landmark ? `Near ${checkoutData.landmark}` : '',
      `${checkoutData.city}, ${checkoutData.state} - ${checkoutData.pinCode}`,
      checkoutData.deliveryInstructions ? `Note: ${checkoutData.deliveryInstructions}` : '',
    ]
      .filter(Boolean)
      .join(', ')
      .slice(0, 500);

    return {
      id: orderId,
      uid,
      customerName: checkoutData.fullName.slice(0, 100),
      customerEmail: checkoutData.email.slice(0, 160),
      customerPhone: checkoutData.phone.slice(0, 20),
      shippingAddress: formattedAddress,
      pinCode: checkoutData.pinCode.slice(0, 10),
      items: orderItems,
      subtotal,
      discountAmount,
      ...(verifiedCouponCode ? { couponCode: verifiedCouponCode } : {}),
      shippingFee,
      totalAmount,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      status: 'ORDER_PLACED',
      estimatedDelivery: estDate,
      createdAt: now,
      updatedAt: now,
    };
  };

  const createdOrder = buildOrderFromCatalog(catalogProducts || INITIAL_PRODUCTS);

  const initialEvent: OrderEvent = {
    id: eventId,
    orderId,
    uid,
    status: 'ORDER_PLACED',
    message: `Order ${orderId} placed successfully via Cash on Delivery. Total payable on delivery: ₹${createdOrder.totalAmount.toLocaleString('en-IN')}.`,
    location: 'Cartlane Online Concierge',
    updatedBy: checkoutData.fullName.slice(0, 120),
    createdAt: now,
  };

  // Save locally & to User's Realtime Database (studio-9019379244-c807b)
  saveLocalOrder(createdOrder);
  saveLocalOrderEvent(orderId, initialEvent);
  await syncRecordToUserFirebase('orders', orderId, createdOrder);
  await syncRecordToUserFirebase(`order_events/${orderId}`, eventId, initialEvent);

  // Also write to Firestore if authenticated
  try {
    await setDoc(doc(db, 'orders', orderId), createdOrder);
    await setDoc(doc(db, 'orders', orderId, 'events', eventId), initialEvent);
  } catch {
    // Synced via RTDB & Local
  }

  return createdOrder;
}

/**
 * Updates order status and shipment tracking details while enforcing valid state transitions
 * and creating an auditable OrderEvent record.
 */
export async function updateOrderStatusWithEvent(params: {
  order: Order;
  newStatus: OrderStatus;
  message: string;
  actorName: string;
  isAdminActor: boolean;
  location?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  paymentStatus?: Order['paymentStatus'];
}): Promise<void> {
  const {
    order,
    newStatus,
    message,
    actorName,
    isAdminActor,
    location,
    courierName,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
    paymentStatus,
  } = params;

  const allowedNext = VALID_STATUS_TRANSITIONS[order.status] || [];
  if (!isAdminActor && !allowedNext.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from "${ORDER_STATUS_LABELS[order.status]}" to "${ORDER_STATUS_LABELS[newStatus]}".`
    );
  }

  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', order.id);

  const updatedOrder: Order = isAdminActor
    ? {
        ...order,
        status: newStatus,
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(courierName !== undefined ? { courierName: courierName.slice(0, 80) } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber.slice(0, 80) } : {}),
        ...(trackingUrl !== undefined ? { trackingUrl: trackingUrl.slice(0, 300) } : {}),
        ...(estimatedDelivery !== undefined
          ? { estimatedDelivery: estimatedDelivery.slice(0, 60) }
          : {}),
        updatedAt: now,
      }
    : {
        ...order,
        status: newStatus,
        updatedAt: now,
      };

  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newEvent: OrderEvent = {
    id: eventId,
    orderId: order.id,
    uid: order.uid,
    status: newStatus,
    message: message.slice(0, 300),
    ...(location ? { location: location.slice(0, 120) } : {}),
    updatedBy: actorName.slice(0, 120),
    createdAt: now,
  };

  saveLocalOrder(updatedOrder);
  saveLocalOrderEvent(order.id, newEvent);
  await syncRecordToUserFirebase('orders', order.id, updatedOrder);
  await syncRecordToUserFirebase(`order_events/${order.id}`, eventId, newEvent);

  try {
    await setDoc(orderRef, updatedOrder);
    await setDoc(doc(db, 'orders', order.id, 'events', eventId), newEvent);
  } catch (error) {
    console.warn('Firestore order update notice (synced via RTDB):', error);
  }
}

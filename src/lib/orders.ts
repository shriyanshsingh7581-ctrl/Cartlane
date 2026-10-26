import { doc, runTransaction, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from './firebase';
import {
  CartItem,
  Coupon,
  OperationType,
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

/**
 * Places an order using a Firestore transaction that re-reads authoritative product prices/stock,
 * decrements inventory safely, increments coupon usage, writes the order document, and logs the initial OrderEvent.
 */
export async function placeOrderTransaction(params: {
  uid: string;
  checkoutData: CheckoutFormValues;
  cartItems: CartItem[];
  couponCode?: string;
  coupons: Coupon[];
  settings: SiteSettings;
}): Promise<Order> {
  const { uid, checkoutData, cartItems, couponCode, coupons, settings } = params;

  if (cartItems.length === 0) {
    throw new Error('Your shopping bag is empty.');
  }

  const orderId = `AV-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
  const eventId = `evt_${Date.now()}_init`;
  const now = new Date().toISOString();

  // Calculate estimated delivery date (4 days from now)
  const estDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  try {
    const createdOrder = await runTransaction(db, async (transaction) => {
      // 1. Read all product docs in transaction
      const uniqueProductIds = Array.from(new Set(cartItems.map((i) => i.productId)));
      const productSnaps = await Promise.all(
        uniqueProductIds.map((pid) => transaction.get(doc(db, 'products', pid)))
      );

      const productMap = new Map<string, Product>();
      for (const snap of productSnaps) {
        if (snap.exists()) {
          productMap.set(snap.id, snap.data() as Product);
        }
      }

      const orderItems: OrderItem[] = [];
      let subtotal = 0;
      const stockDeductions = new Map<string, number>();

      for (const item of cartItems) {
        const product = productMap.get(item.productId);
        if (!product || product.status !== 'published') {
          throw new Error(`One or more items in your bag are no longer available.`);
        }

        const matchedVariant = product.variants?.find((v) => v.label === item.variantLabel);
        const unitPrice = matchedVariant ? matchedVariant.price : product.price;
        const compareAtPrice = matchedVariant ? matchedVariant.compareAtPrice : product.compareAtPrice;
        const sku = matchedVariant ? matchedVariant.sku : product.sku;

        const currentDeduction = stockDeductions.get(product.id) || 0;
        const totalRequestedForProduct = currentDeduction + item.quantity;

        if (product.stock < totalRequestedForProduct) {
          throw new Error(
            `Insufficient inventory for "${product.name}". Only ${product.stock} unit(s) remaining in stock.`
          );
        }

        stockDeductions.set(product.id, totalRequestedForProduct);
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

      // 2. Validate coupon inside transaction if supplied
      let discountAmount = 0;
      let verifiedCouponCode: string | undefined;

      if (couponCode && couponCode.trim().length > 0) {
        const normalized = couponCode.trim().toUpperCase();
        const matchedCoupon = coupons.find((c) => c.code.toUpperCase() === normalized);
        if (matchedCoupon && matchedCoupon.active && subtotal >= matchedCoupon.minOrderAmount) {
          const couponRef = doc(db, 'coupons', matchedCoupon.id);
          const couponSnap = await transaction.get(couponRef);
          if (couponSnap.exists()) {
            const liveCoupon = couponSnap.data() as Coupon;
            if (liveCoupon.active && liveCoupon.usedCount < liveCoupon.usageLimit) {
              verifiedCouponCode = liveCoupon.code;
              if (liveCoupon.discountType === 'percentage') {
                discountAmount = Math.min(
                  Math.round((subtotal * liveCoupon.discountValue) / 100),
                  liveCoupon.maxDiscountAmount,
                  subtotal
                );
              } else {
                discountAmount = Math.min(
                  liveCoupon.discountValue,
                  liveCoupon.maxDiscountAmount,
                  subtotal
                );
              }
              transaction.update(couponRef, {
                usedCount: liveCoupon.usedCount + 1,
                updatedAt: now,
              });
            }
          }
        }
      }

      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const shippingFee =
        discountedSubtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingFee;
      const totalAmount = discountedSubtotal + shippingFee;

      // 3. Decrement product stock
      for (const [productId, qtyToDeduct] of stockDeductions.entries()) {
        const prod = productMap.get(productId)!;
        const newStock = Math.max(0, prod.stock - qtyToDeduct);
        transaction.update(doc(db, 'products', productId), {
          stock: newStock,
          updatedAt: now,
        });
      }

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

      const orderDoc: Order = {
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

      transaction.set(doc(db, 'orders', orderId), orderDoc);
      return orderDoc;
    });

    // 4. Write the initial chronological OrderEvent after the order document is committed
    const initialEvent: OrderEvent = {
      id: eventId,
      orderId,
      uid,
      status: 'ORDER_PLACED',
      message: `Order ${orderId} placed successfully via Cash on Delivery. Total payable on delivery: ₹${createdOrder.totalAmount.toLocaleString('en-IN')}.`,
      location: 'Atelier Vanguard Online Concierge',
      updatedBy: checkoutData.fullName.slice(0, 120),
      createdAt: now,
    };

    await setDoc(doc(db, 'orders', orderId, 'events', eventId), initialEvent);

    return createdOrder;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
    }
    throw error;
  }
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
  if (isAdminActor && order.status !== newStatus && !allowedNext.includes(newStatus)) {
    throw new Error(
      `Invalid lifecycle transition: "${ORDER_STATUS_LABELS[order.status]}" cannot transition directly to "${ORDER_STATUS_LABELS[newStatus]}". Allowed next stages: ${
        allowedNext.map((s) => ORDER_STATUS_LABELS[s]).join(', ') || 'None (Terminal State)'
      }.`
    );
  }

  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', order.id);

  try {
    if (isAdminActor) {
      const updatedOrder: Order = {
        ...order,
        status: newStatus,
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(courierName !== undefined ? { courierName: courierName.slice(0, 80) } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber.slice(0, 80) } : {}),
        ...(trackingUrl !== undefined ? { trackingUrl: trackingUrl.slice(0, 300) } : {}),
        ...(estimatedDelivery !== undefined ? { estimatedDelivery: estimatedDelivery.slice(0, 60) } : {}),
        updatedAt: now,
      };
      await setDoc(orderRef, updatedOrder);
    } else {
      // Customer cancellation / return request: only mutate status and updatedAt per security rule
      const customerUpdatedOrder: Order = {
        ...order,
        status: newStatus,
        updatedAt: now,
      };
      await setDoc(orderRef, customerUpdatedOrder);
    }

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

    await setDoc(doc(db, 'orders', order.id, 'events', eventId), newEvent);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
  }
}

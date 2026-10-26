export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface GalleryImage {
  url: string;
  publicId?: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  label: string; // e.g., "50 ml", "100 ml"
  price: number;
  compareAtPrice: number;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory?: string;
  concern?: string;
  price: number;
  compareAtPrice: number;
  discountPercent: number;
  sku: string;
  stock: number;
  mainImage: string;
  mainImagePublicId?: string;
  imageAlt: string;
  galleryImages?: GalleryImage[];
  variants?: ProductVariant[];
  highlights?: string[];
  ingredients?: string;
  usageInstructions?: string;
  ratingAvg?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  status: 'published' | 'draft' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  publicId?: string;
  placement: 'hero' | 'promo' | 'collection';
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLATION_REQUESTED'
  | 'CANCELLED'
  | 'DELIVERY_ATTEMPT_FAILED'
  | 'DELAYED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_PICKED_UP'
  | 'REFUND_PROCESSING'
  | 'REFUNDED'
  | 'RETURNED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ORDER_PLACED: 'Order Placed',
  ORDER_CONFIRMED: 'Order Confirmed',
  PROCESSING: 'Processing at Atelier',
  PACKED: 'Quality Checked & Packed',
  SHIPPED: 'Dispatched via Courier',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLATION_REQUESTED: 'Cancellation Requested',
  CANCELLED: 'Cancelled',
  DELIVERY_ATTEMPT_FAILED: 'Delivery Attempt Failed',
  DELAYED: 'In Transit — Delayed',
  RETURN_REQUESTED: 'Return Requested',
  RETURN_APPROVED: 'Return Approved',
  RETURN_PICKED_UP: 'Return Picked Up',
  REFUND_PROCESSING: 'Refund Processing',
  REFUNDED: 'Refunded',
  RETURNED: 'Returned',
};

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  ORDER_PLACED: ['ORDER_CONFIRMED', 'PROCESSING', 'CANCELLATION_REQUESTED', 'CANCELLED'],
  ORDER_CONFIRMED: ['PROCESSING', 'PACKED', 'CANCELLATION_REQUESTED', 'CANCELLED'],
  PROCESSING: ['PACKED', 'DELAYED', 'CANCELLATION_REQUESTED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'DELAYED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELAYED', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_ATTEMPT_FAILED', 'DELAYED'],
  DELIVERY_ATTEMPT_FAILED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  DELAYED: ['PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  DELIVERED: ['RETURN_REQUESTED'],
  CANCELLATION_REQUESTED: ['CANCELLED', 'PROCESSING'],
  CANCELLED: ['REFUND_PROCESSING', 'REFUNDED'],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'DELIVERED'],
  RETURN_APPROVED: ['RETURN_PICKED_UP'],
  RETURN_PICKED_UP: ['RETURNED', 'REFUND_PROCESSING'],
  RETURNED: ['REFUND_PROCESSING', 'REFUNDED'],
  REFUND_PROCESSING: ['REFUNDED'],
  REFUNDED: [],
};

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  variantLabel: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  uid: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  pinCode: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  status: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  uid: string;
  status: OrderStatus;
  message: string;
  location?: string;
  updatedBy: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  uid: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  uid: string;
  fullName: string;
  email?: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  landmark?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  productId: string;
  uid: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantLabel: string;
  quantity: number;
}

export interface CartDoc {
  uid: string;
  items: CartItem[];
  couponCode?: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  brandName: string;
  announcementText: string;
  announcementEnabled: boolean;
  primaryColor?: string;
  accentColor?: string;
  freeShippingThreshold: number;
  flatShippingFee: number;
  codEnabled: boolean;
  estimatedDeliveryDays: string;
  returnWindowDays: number;
  supportEmail: string;
  supportPhone: string;
  updatedAt: string;
}

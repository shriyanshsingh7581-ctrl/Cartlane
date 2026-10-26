import { z } from 'zod';

export const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const SLUG_REGEX = /^[a-z0-9\-]+$/;
export const PINCODE_REGEX = /^[0-9]{6}$/;
export const COUPON_CODE_REGEX = /^[A-Z0-9_\-]+$/;

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address').max(160).optional().or(z.literal('')),
  phone: z.string().min(10, 'Enter a valid 10-digit mobile number').max(15),
  house: z.string().min(1, 'House / Flat / Building is required').max(160),
  street: z.string().min(2, 'Street / Locality is required').max(200),
  city: z.string().min(2, 'City is required').max(80),
  state: z.string().min(2, 'State is required').max(80),
  pinCode: z.string().regex(PINCODE_REGEX, 'PIN code must be exactly 6 digits'),
  landmark: z.string().max(160).optional().or(z.literal('')),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Valid email is required').max(160),
  phone: z.string().min(10, '10-digit mobile number is required').max(15),
  house: z.string().min(1, 'House / Building is required').max(160),
  street: z.string().min(2, 'Street and locality are required').max(200),
  city: z.string().min(2, 'City is required').max(80),
  state: z.string().min(2, 'State is required').max(80),
  pinCode: z.string().regex(PINCODE_REGEX, 'Valid 6-digit Indian PIN code is required'),
  landmark: z.string().max(160).optional().or(z.literal('')),
  deliveryInstructions: z.string().max(250).optional().or(z.literal('')),
  saveAddress: z.boolean().default(true),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(140),
  slug: z.string().min(2).max(140).regex(SLUG_REGEX, 'Lowercase letters, numbers, and hyphens only'),
  shortDescription: z.string().min(5, 'Short description is required').max(280),
  description: z.string().min(10, 'Full description is required').max(4000),
  category: z.string().min(2, 'Category is required').max(60),
  subcategory: z.string().max(60).optional().or(z.literal('')),
  concern: z.string().max(60).optional().or(z.literal('')),
  price: z.coerce.number().min(1, 'Selling price must be greater than 0'),
  compareAtPrice: z.coerce.number().min(1, 'Compare-at MRP must be >= selling price'),
  sku: z.string().min(2, 'SKU is required').max(64),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  mainImage: z.string().min(5, 'Main product image is required').max(1500),
  mainImagePublicId: z.string().max(240).optional().or(z.literal('')),
  imageAlt: z.string().min(2, 'Image alt text is required').max(180),
  ingredients: z.string().max(1500).optional().or(z.literal('')),
  usageInstructions: z.string().max(1500).optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
  seoTitle: z.string().max(120).optional().or(z.literal('')),
  seoDescription: z.string().max(240).optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const couponFormSchema = z.object({
  code: z.string().min(3).max(32).regex(COUPON_CODE_REGEX, 'Uppercase letters, numbers, hyphens only'),
  description: z.string().min(3).max(200),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(1),
  minOrderAmount: z.coerce.number().min(0),
  maxDiscountAmount: z.coerce.number().min(1),
  usageLimit: z.coerce.number().min(1),
  active: z.boolean().default(true),
  expiresAt: z.string().min(4).max(40),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;

export const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  title: z.string().min(2, 'Headline is required').max(120),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

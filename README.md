# Atelier Vanguard — Men's Grooming E-Commerce & Complete Admin Panel

A full-featured, responsive men's grooming e-commerce storefront and administrator control center inspired by the layout, product hierarchy, and shopping experience of `themancompany.com`, built with an original configurable brand identity (**Atelier Vanguard**).

---

## 1. Architecture & Key Capabilities

### Storefront Experience
- **Responsive Campaign Hero & Quantitative Proof Strip**: Split-screen campaign showcase, predictive catalog search bar, and dismissible announcement banner.
- **Catalog & Collections (`/products`, `/collections`, `/collections/[slug]`, `/search`)**: Filter by grooming vertical (Fine Fragrances, Face & Skincare, Beard Apothecary, Hair & Scalp, Shave & Precision, Luxury Coffrets), concern, price slider, in-stock status, and sort order.
- **Product Detail Page (`/products/[slug]`)**: Sticky image gallery with full-screen lightbox zoom, contiguous purchase module, volume/edition variant selector, 6-digit Indian PIN code delivery & COD checker, botanical ingredients, usage rituals, and verified customer reviews.
- **Persistent Bag & Checkout (`/cart`, `/checkout`)**: Real-time free-shipping threshold bar, privilege coupon validation (`VANGUARD20`, `GENTLEMAN150`, `COFFRET400`), saved shipping address selector, Zod form validation, and transaction-safe inventory deduction.
- **Flipkart-Style Order Tracking (`/account/orders/[orderId]`, `/track-order`)**: 7 primary fulfillment stages (`Order Placed` → `Order Confirmed` → `Processing` → `Packed` → `Shipped` → `Out for Delivery` → `Delivered`) plus exception workflows (`Cancellation Requested`, `Cancelled`, `Delayed`, `Delivery Attempt Failed`, `Return Requested`, `Return Approved`, `Return Picked Up`, `Refund Processing`, `Refunded`, `Returned`) backed by chronological audit events in `/orders/{orderId}/events/{eventId}`.

### Administrator Dashboard (`/admin/*`)
- Protected by Firebase Authentication and Firestore Security Rules (`isAdmin()` verified against `/admins/{uid}` and bootstrap admin email).
- **Executive Overview (`/admin`)**: Real-time revenue, orders awaiting action, registered customer count, published formulations, low-stock alerts, and one-click catalog seeding.
- **Product & Cloudinary Media Management (`/admin/products`, `/admin/products/new`, `/admin/products/[productId]`)**: Full CRUD with live Cloudinary image uploads, progress bar, preview, and responsive image transformation (`f_auto,q_auto,c_limit`).
- **Inventory Matrix (`/admin/inventory`)**: Rapid stock replenishment and zero-stock controls.
- **Order Fulfillment & Tracking Controller (`/admin/orders`, `/admin/orders/[orderId]`)**: Enforce valid lifecycle state transitions, assign Courier Partner, AWB Tracking ID, Tracking URL, Estimated Delivery Date, and append timestamped events.
- **Storefront Customization (`/admin/banners`, `/admin/coupons`, `/admin/settings`)**: Update brand name, announcement bar, hero banners, privilege coupons, and shipping thresholds live without redeploying.

---

## 2. Cloudinary Configuration & Verification

The project is pre-configured in `.env.example` and `src/lib/cloudinary.ts` with:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dxeuzdwkz"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="Uttam Charitable"
```

### Important Verification Step in Cloudinary Dashboard:
1. Log in to your Cloudinary Console (`https://console.cloudinary.com/`) and verify your Cloud Name is **`dxeuzdwkz`**.
2. Navigate to **Settings → Upload → Upload presets**.
3. Ensure an upload preset named **`Uttam Charitable`** (exact case and space) exists and its **Signing Mode** is set to **Unsigned** (restricted to image formats JPG, PNG, WebP, AVIF).
4. If the preset does not exist or is set to Signed, the Admin Uploader will display a clear diagnostic message explaining the exact setting to enable in your Cloudinary dashboard.

---

## 3. Firebase Setup & Security Rules

1. **Firebase Project & Authentication**:
   - Provisioned in `firebase-applet-config.json`.
   - Ensure **Google Sign-In** is enabled in **Firebase Console → Authentication → Sign-in method**.
   - Add your local (`localhost`) and production Vercel domain (`*.vercel.app`) under **Authentication → Settings → Authorized domains**.
2. **Database Security Rules**:
   - Firestore Zero-Trust Security Rules are located in `firestore.rules` (validated with `@firebase/eslint-plugin-security-rules` and audited against the 12 adversarial payloads in `security_spec.md` and `firestore.rules.test.ts`).
   - Realtime Database equivalent rules and indexes are provided in `database.rules.json` and `database.indexes.json`.

---

## 4. Local Development & Vercel Deployment Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Validate Security Rules & Build**:
   ```bash
   npx eslint firestore.rules
   npm run build
   ```
4. **Deploy to Vercel**:
   - Push this repository to GitHub (never commit private service account keys).
   - Import the repository in **Vercel Dashboard → Add New Project**.
   - Configure the environment variables from `.env.example` (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxeuzdwkz`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=Uttam Charitable`, and your Firebase keys).
   - Click **Deploy** and add the resulting `.vercel.app` domain to Firebase Authentication → Authorized Domains.

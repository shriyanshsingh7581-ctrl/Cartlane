# Security Specification — Atelier Vanguard E-Commerce

## 1. Data Invariants
1. **Default Deny**: Any path not explicitly matched is rejected (`allow read, write: if false`).
2. **PII Isolation**: `/users/{uid}` and `/users/{uid}/addresses/{addressId}` contain customer PII (`email`, `phone`, `house`, `street`, `pinCode`). Read and write access is strictly isolated to `isOwner(uid) || isAdmin()`. Blanket `isSignedIn()` reads are forbidden.
3. **Catalog Integrity**: Public users can read published `/products/{productId}`, `/categories/{categoryId}`, `/banners/{bannerId}`, `/coupons/{couponId}`, `/reviews/{reviewId}`, and `/settings/{settingId}`. Only verified administrators (`isAdmin()`) can create, update, or delete catalog items, prices, stock, banners, coupons, and settings.
4. **Privilege Escalation Prevention**: Customers cannot write to `/admins/{uid}` to promote themselves to administrator. Admin status is determined strictly via `/admins/$(request.auth.uid)` or verified bootstrap admin email (`singhshriyansh51@gmail.com` with `email_verified == true`).
5. **Order Ownership & State Integrity**: An order in `/orders/{orderId}` can only be created by the authenticated user where `incoming().uid == request.auth.uid` and initial status is `'ORDER_PLACED'`. Customers can only read orders where `resource.data.uid == request.auth.uid`. Customers can only update an order to request cancellation (`'CANCELLATION_REQUESTED'`) or return (`'RETURN_REQUESTED'`) using strict `affectedKeys().hasOnly(['status', 'updatedAt'])`. Terminal states (`'CANCELLED'`, `'REFUNDED'`, `'RETURNED'`) lock customer updates.
6. **Subcollection Master Gate**: Order tracking events at `/orders/{orderId}/events/{eventId}` verify parent `/orders/{orderId}` ownership (`get(...).data.uid == request.auth.uid`) or `isAdmin()`.
7. **Strict Validation Blueprints & Size Bounds**: Every string field enforces `.size() <= maxLength` and IDs enforce `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on User Profile**: Authenticated user sends `{ uid: 'u1', displayName: 'John', email: 'j@example.com', createdAt: '...', updatedAt: '...', isAdmin: true }` to `/users/u1`. Rejected by `hasOnly`.
2. **Cross-User PII Read**: Authenticated user `u2` attempts `get(/users/u1)`. Rejected by `isOwner(uid) || isAdmin()`.
3. **Unverified Admin Email Spoof**: Attacker with `email: 'singhshriyansh51@gmail.com'` and `email_verified: false` attempts to update `/products/p1`. Rejected by `request.auth.token.email_verified == true`.
4. **Self-Promotion to Admin**: User `u1` attempts `create(/admins/u1, { uid: 'u1', email: 'u1@test.com', createdAt: '...' })`. Rejected (`allow write: if false` on `/admins/{uid}`).
5. **Catalog Price Tampering**: Customer `u1` attempts `update(/products/p1, { price: 1 })`. Rejected by `isAdmin()`.
6. **Order Identity Spoofing**: User `u1` creates `/orders/o1` with `uid: 'u2'`. Rejected by `data.uid == request.auth.uid`.
7. **Order Status Shortcutting by Customer**: User `u1` updates `/orders/o1` with `{ status: 'DELIVERED' }` or `{ paymentStatus: 'PAID' }`. Rejected by action-based update gate (`affectedKeys().hasOnly(['status', 'updatedAt'])` and allowed customer transition states).
8. **Terminal Order Mutation**: User `u1` attempts to update an order whose `existing().status == 'CANCELLED'`. Rejected by terminal state lock.
9. **ID Poisoning Attack**: User attempts to create `/users/u1/addresses/invalid$id!with@spaces` or a 500-char ID. Rejected by `isValidId(addressId)`.
10. **Denial-of-Wallet Oversized String**: User submits a 10,000-character `comment` in `/reviews/r1`. Rejected by `data.comment.size() <= 1000`.
11. **Unauthorized Order List Scraping**: User `u1` runs an unconstrained `list` query on `/orders` without filtering `where('uid', '==', 'u1')`. Rejected by `resource.data.uid == request.auth.uid`.
12. **Orphaned Order Event Write**: User `u2` attempts to write an event to `/orders/o1/events/e1` where `o1` belongs to `u1`. Rejected by Master Gate parent `get()` check.

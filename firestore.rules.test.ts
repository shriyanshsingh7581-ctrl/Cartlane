/**
 * Firestore Security Rules Verification Suite — "Dirty Dozen" Red Team Payloads
 * Verifies that all 12 adversarial payloads defined in security_spec.md return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on User Profile',
    operation: 'create',
    path: '/users/user_1',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: {
      uid: 'user_1',
      displayName: 'Arjun Mehta',
      email: 'user1@example.com',
      createdAt: '2026-10-25T00:00:00Z',
      updatedAt: '2026-10-25T00:00:00Z',
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Cross-User PII Read',
    operation: 'get',
    path: '/users/user_1',
    auth: { uid: 'user_2', email: 'user2@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Admin Email Spoof',
    operation: 'update',
    path: '/products/prod_1',
    auth: { uid: 'attacker_1', email: 'singhshriyansh51@gmail.com', email_verified: false },
    payload: { price: 1 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Self-Promotion to Admin',
    operation: 'create',
    path: '/admins/user_1',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: { uid: 'user_1', email: 'user1@example.com', createdAt: '2026-10-25T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Catalog Price Tampering by Customer',
    operation: 'update',
    path: '/products/prod_1',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: { price: 10 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Order Identity Spoofing',
    operation: 'create',
    path: '/orders/ord_1',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: { uid: 'user_2', status: 'ORDER_PLACED' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Order Status Shortcutting by Customer',
    operation: 'update',
    path: '/orders/ord_1',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: { status: 'DELIVERED', paymentStatus: 'PAID' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Terminal Order Mutation',
    operation: 'update',
    path: '/orders/ord_cancelled',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: { status: 'ORDER_PLACED', updatedAt: '2026-10-25T01:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'ID Poisoning Attack on Address Path',
    operation: 'create',
    path: '/users/user_1/addresses/bad$id!spaces',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: { id: 'bad$id!spaces', uid: 'user_1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Denial-of-Wallet Oversized Review String',
    operation: 'create',
    path: '/reviews/rev_1',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'rev_1',
      productId: 'prod_1',
      uid: 'user_1',
      authorName: 'Arjun',
      rating: 5,
      title: 'Great',
      comment: 'x'.repeat(2000),
      verifiedPurchase: true,
      createdAt: '2026-10-25T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthorized Order List Scraping',
    operation: 'list',
    path: '/orders',
    auth: { uid: 'user_2', email: 'user2@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Orphaned Order Event Write by Non-Owner',
    operation: 'create',
    path: '/orders/ord_1/events/evt_2',
    auth: { uid: 'user_2', email: 'user2@example.com', email_verified: true },
    payload: {
      id: 'evt_2',
      orderId: 'ord_1',
      uid: 'user_2',
      status: 'SHIPPED',
      message: 'Fake shipment event',
      updatedBy: 'user_2',
      createdAt: '2026-10-25T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];

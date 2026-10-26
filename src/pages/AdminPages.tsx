import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Boxes,
  ExternalLink,
  FolderKanban,
  Image as ImageIcon,
  MessageSquare,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Settings,
  ShieldAlert,
  TicketPercent,
  Trash2,
  Truck,
  Users,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { OrderTimeline } from '../components/OrderTimeline';
import { BOOTSTRAP_ADMIN_EMAIL, db, handleFirestoreError } from '../lib/firebase';
import {
  calculateDiscountPercent,
  updateOrderStatusWithEvent,
} from '../lib/orders';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import {
  Banner,
  Category,
  Coupon,
  OperationType,
  Order,
  OrderEvent,
  OrderStatus,
  ORDER_STATUS_LABELS,
  Product,
  SiteSettings,
  UserProfile,
  VALID_STATUS_TRANSITIONS,
} from '../types';

const ADMIN_NAV_LINKS = [
  { to: '/admin', label: 'Overview', icon: BarChart3 },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: FolderKanban },
  { to: '/admin/orders', label: 'Orders & Tracking', icon: Truck },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/banners', label: 'Banners & Homepage', icon: ImageIcon },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/settings', label: 'Store & Shipping', icon: Settings },
];

export const AdminLoginPage: React.FC = () => {
  const { user, isAdmin, loginWithGoogle } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin]);

  return (
    <main className="min-h-screen bg-[#141413] text-[#FAF8F5] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1F1E1C] border border-[#3F3B36] p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#D4AF7A] font-semibold">
            Restricted Security Perimeter
          </p>
          <h1 className="font-serif-display text-3xl font-bold text-[#FAF8F5]">
            Administrator Authentication
          </h1>
          <p className="text-xs text-[#A8A29E] leading-relaxed">
            Access to catalog pricing, Cloudinary media management, order fulfillment transitions, and customer records is strictly verified against Firestore Security Rules and the verified administrator identity ({BOOTSTRAP_ADMIN_EMAIL}).
          </p>
        </div>

        {user && !isAdmin && (
          <div className="p-4 bg-red-950/60 border border-red-800 text-xs text-red-200 space-y-1">
            <p className="font-bold uppercase tracking-wider">
              Unauthorized Account ({user.email})
            </p>
            <p>
              Your signed-in Google account is not in the `/admins` allowlist and does not match the verified store owner email. Self-promotion is blocked by Firestore rules.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full py-3.5 bg-[#8C6239] hover:bg-[#734f2c] text-white text-xs font-semibold uppercase tracking-widest transition-colors"
        >
          Authenticate with Google Admin Account
        </button>

        <div className="pt-4 border-t border-[#292524] flex justify-between text-xs text-[#A8A29E]">
          <Link to="/" className="hover:text-white">
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </main>
  );
};

export const AdminPortal: React.FC = () => {
  const {
    user,
    userProfile,
    isAdmin,
    authReady,
    isDatabaseLive,
    allAdminProducts,
    categories,
    banners,
    coupons,
    reviews,
    settings,
    seedCatalogToFirestore,
    showToast,
    logout,
  } = useStore();

  const location = useLocation();
  const navigate = useNavigate();
  const { productId, orderId } = useParams<{ productId?: string; orderId?: string }>();

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allCustomers, setAllCustomers] = useState<UserProfile[]>([]);
  const [syncingSeed, setSyncingSeed] = useState(false);

  // Subscribe to all orders and all users when verified admin is active
  useEffect(() => {
    if (!authReady || !isAdmin) return;

    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Order)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setAllOrders(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as UserProfile)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setAllCustomers(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, [authReady, isAdmin]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs uppercase tracking-widest text-[#78716C]">
        Verifying Administrator Credentials...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-[#141413] text-[#FAF8F5] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#1F1E1C] border border-[#3F3B36] p-8 space-y-5">
          <div className="flex items-center gap-3 text-[#D4AF7A]">
            <ShieldAlert className="w-6 h-6" />
            <h1 className="font-serif-display text-3xl font-bold text-white">
              Administrator Access Required
            </h1>
          </div>
          <p className="text-xs text-[#A8A29E] leading-relaxed">
            This route is protected by role-based access control and Firestore security rules. Please sign in with the authorized administrator account ({BOOTSTRAP_ADMIN_EMAIL}) to manage products, Cloudinary uploads, and orders.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/admin/login"
              className="px-6 py-3 bg-[#8C6239] text-white text-xs font-semibold uppercase tracking-widest"
            >
              Go to Admin Login
            </Link>
            <Link
              to="/"
              className="px-6 py-3 border border-[#4D463E] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleSyncCatalog = async () => {
    setSyncingSeed(true);
    try {
      await seedCatalogToFirestore();
    } finally {
      setSyncingSeed(false);
    }
  };

  const path = location.pathname;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row">
      {/* Left Admin Sidebar */}
      <aside className="w-full lg:w-64 bg-[#141413] text-[#E7E5E4] shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#292524]">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/admin"
                className="font-serif-display text-xl font-bold tracking-wider text-white block"
              >
                {settings.brandName}
              </Link>
              <p className="text-[11px] uppercase tracking-widest text-[#D4AF7A] mt-0.5">
                Administrator Console
              </p>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {ADMIN_NAV_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/admin'
                  ? path === '/admin'
                  : path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#8C6239] text-white font-semibold'
                      : 'text-[#A8A29E] hover:text-white hover:bg-[#1F1E1C]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-[#292524] space-y-3 text-xs">
          <Link
            to="/"
            className="flex items-center justify-between text-[#D4AF7A] hover:underline"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <p className="text-[11px] font-mono-tabular text-[#78716C] truncate">
            Admin: {user.email}
          </p>
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 border border-[#3F3B36] text-[#A8A29E] hover:text-white text-xs uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 md:p-10 max-w-[1360px] space-y-8 overflow-x-hidden">
        {/* Database Sync Banner if not yet written to Firestore */}
        {!isDatabaseLive && (
          <div className="p-4 bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-amber-950">
              <p className="font-bold uppercase tracking-wider">
                Initial Catalog Preview Active
              </p>
              <p className="mt-0.5">
                Click &ldquo;Write Initial Catalog to Firestore&rdquo; to persist all default products, categories, banners, coupons, and settings into your live Firestore database.
              </p>
            </div>
            <button
              type="button"
              disabled={syncingSeed}
              onClick={handleSyncCatalog}
              className="px-4 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              {syncingSeed ? 'Syncing...' : 'Write Initial Catalog to Firestore'}
            </button>
          </div>
        )}

        {/* Route Dispatcher */}
        {path === '/admin' && (
          <AdminOverviewSection
            orders={allOrders}
            customers={allCustomers}
            products={allAdminProducts}
            onSeed={handleSyncCatalog}
            syncingSeed={syncingSeed}
          />
        )}

        {path === '/admin/products' && (
          <AdminProductsListSection
            products={allAdminProducts}
            onEdit={(id) => navigate(`/admin/products/${id}`)}
            onCreate={() => navigate('/admin/products/new')}
            showToast={showToast}
          />
        )}

        {(path === '/admin/products/new' ||
          (path.startsWith('/admin/products/') && productId)) && (
          <AdminProductEditorSection
            productId={path === '/admin/products/new' ? undefined : productId}
            products={allAdminProducts}
            categories={categories}
            onBack={() => navigate('/admin/products')}
            showToast={showToast}
          />
        )}

        {path === '/admin/inventory' && (
          <AdminInventorySection
            products={allAdminProducts}
            showToast={showToast}
          />
        )}

        {(path === '/admin/categories' || path === '/admin/collections') && (
          <AdminCategoriesSection
            categories={categories}
            showToast={showToast}
          />
        )}

        {path === '/admin/orders' && !orderId && (
          <AdminOrdersListSection
            orders={allOrders}
            onSelectOrder={(id) => navigate(`/admin/orders/${id}`)}
          />
        )}

        {path.startsWith('/admin/orders/') && orderId && (
          <AdminOrderDetailSection
            orderId={orderId}
            orders={allOrders}
            adminName={userProfile?.displayName || user.email || 'Admin'}
            onBack={() => navigate('/admin/orders')}
            showToast={showToast}
          />
        )}

        {path === '/admin/customers' && (
          <AdminCustomersSection
            customers={allCustomers}
            orders={allOrders}
          />
        )}

        {(path === '/admin/banners' || path === '/admin/homepage') && (
          <AdminBannersSection
            banners={banners}
            showToast={showToast}
          />
        )}

        {path === '/admin/coupons' && (
          <AdminCouponsSection
            coupons={coupons}
            showToast={showToast}
          />
        )}

        {path === '/admin/reviews' && (
          <AdminReviewsSection
            reviews={reviews}
            products={allAdminProducts}
            showToast={showToast}
          />
        )}

        {(path === '/admin/settings' || path === '/admin/shipping') && (
          <AdminSettingsSection
            settings={settings}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
};

/* ============================================================================
 * 1. ADMIN OVERVIEW DASHBOARD
 * ==========================================================================*/
const AdminOverviewSection: React.FC<{
  orders: Order[];
  customers: UserProfile[];
  products: Product[];
  onSeed: () => void;
  syncingSeed: boolean;
}> = ({ orders, customers, products, onSeed, syncingSeed }) => {
  const awaitingProcessing = orders.filter((o) =>
    ['ORDER_PLACED', 'ORDER_CONFIRMED', 'PROCESSING', 'CANCELLATION_REQUESTED', 'RETURN_REQUESTED'].includes(
      o.status
    )
  ).length;

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const lowStockProducts = products.filter((p) => p.stock <= 20);

  const eligibleRevenue = orders
    .filter((o) => !['CANCELLED', 'REFUNDED', 'RETURNED'].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
            Executive Command Center
          </p>
          <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-[#141413]">
            Storefront &amp; Fulfillment Telemetry
          </h1>
        </div>
        <button
          type="button"
          disabled={syncingSeed}
          onClick={onSeed}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#141413] text-xs font-semibold uppercase tracking-wider text-[#141413] hover:bg-[#141413] hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingSeed ? 'animate-spin' : ''}`} />
          <span>Sync Default Catalog to Firestore</span>
        </button>
      </div>

      {/* 6 Real Database KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#E5E0D8]">
          <p className="text-xs uppercase tracking-wider text-[#78716C]">
            Confirmed Order Revenue
          </p>
          <p className="font-mono-tabular text-3xl font-bold text-[#141413] mt-2">
            ₹{eligibleRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#57534E] mt-1">
            Excludes cancelled or refunded orders ({orders.length} total orders)
          </p>
        </div>

        <div className="p-6 bg-white border border-[#E5E0D8]">
          <p className="text-xs uppercase tracking-wider text-[#78716C]">
            Orders Awaiting Action
          </p>
          <p className="font-mono-tabular text-3xl font-bold text-[#8C6239] mt-2">
            {awaitingProcessing}
          </p>
          <p className="text-xs text-[#57534E] mt-1">
            Placed, confirmed, or awaiting cancellation/return review
          </p>
        </div>

        <div className="p-6 bg-white border border-[#E5E0D8]">
          <p className="text-xs uppercase tracking-wider text-[#78716C]">
            Registered Customers
          </p>
          <p className="font-mono-tabular text-3xl font-bold text-[#141413] mt-2">
            {customers.length}
          </p>
          <p className="text-xs text-[#57534E] mt-1">
            Authenticated Google profiles in `/users`
          </p>
        </div>

        <div className="p-6 bg-white border border-[#E5E0D8]">
          <p className="text-xs uppercase tracking-wider text-[#78716C]">
            Published Formulations
          </p>
          <p className="font-mono-tabular text-3xl font-bold text-[#141413] mt-2">
            {publishedCount} / {products.length}
          </p>
          <p className="text-xs text-[#57534E] mt-1">
            Live products visible on storefront
          </p>
        </div>

        <div className="p-6 bg-white border border-[#E5E0D8]">
          <p className="text-xs uppercase tracking-wider text-[#78716C]">
            Low-Stock Alerts (≤ 20 units)
          </p>
          <p className="font-mono-tabular text-3xl font-bold text-[#141413] mt-2">
            {lowStockProducts.length}
          </p>
          <p className="text-xs text-[#57534E] mt-1">
            SKUs requiring replenishment soon
          </p>
        </div>

        <div className="p-6 bg-white border border-[#E5E0D8] flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#78716C]">
              Quick Actions
            </p>
            <p className="text-sm font-semibold text-[#141413] mt-1">
              Add New Formulation or Inspect Orders
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Link
              to="/admin/products/new"
              className="px-3.5 py-2 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider"
            >
              + New Product
            </Link>
            <Link
              to="/admin/orders"
              className="px-3.5 py-2 border border-[#141413] text-[#141413] text-xs font-semibold uppercase tracking-wider"
            >
              Manage Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-[#E5E0D8] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
            Recent Customer Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold uppercase tracking-wider text-[#8C6239] hover:underline"
          >
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-[#78716C] py-6">
            No live customer orders recorded yet. Place a test order from the storefront to inspect real-time order tracking and fulfillment controls.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E0D8] text-[#78716C] uppercase tracking-wider">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4 text-right">Total</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DF]">
                {orders.slice(0, 8).map((ord) => (
                  <tr key={ord.id}>
                    <td className="py-3 pr-4 font-mono-tabular font-bold text-[#141413]">
                      {ord.id}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-[#141413]">{ord.customerName}</span>
                      <span className="block text-[#78716C]">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3 pr-4 font-mono-tabular text-[#57534E]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-[#8C6239]">
                      {ORDER_STATUS_LABELS[ord.status]}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono-tabular font-bold">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="underline font-semibold text-[#141413]"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. ADMIN PRODUCTS LIST & EDITOR (WITH CLOUDINARY UPLOADER)
 * ==========================================================================*/
const AdminProductsListSection: React.FC<{
  products: Product[];
  onEdit: (id: string) => void;
  onCreate: () => void;
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ products, onEdit, onCreate, showToast }) => {
  const handleStatusChange = async (product: Product, nextStatus: Product['status']) => {
    const updated: Product = {
      ...product,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'products', product.id), updated);
      showToast(`Updated "${product.name}" status to ${nextStatus}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${product.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
            Catalog Management
          </p>
          <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
            Products ({products.length})
          </h1>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Formulation</span>
        </button>
      </div>

      <div className="bg-white border border-[#E5E0D8] overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5E0D8] bg-[#F3EFEA] text-[#57534E] uppercase tracking-wider">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">SKU</th>
              <th className="p-4 text-right">Price / MRP</th>
              <th className="p-4 text-right">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE7DF]">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-[#FAF8F5]">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={getOptimizedImageUrl(prod.mainImage, 120)}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover bg-[#F3EFEA] border border-[#E5E0D8] shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-[#141413]">{prod.name}</p>
                    <p className="text-[11px] text-[#78716C]">/{prod.slug}</p>
                  </div>
                </td>
                <td className="p-4 capitalize text-[#57534E]">
                  {prod.category.replace('-', ' ')}
                </td>
                <td className="p-4 font-mono-tabular text-[#57534E]">{prod.sku}</td>
                <td className="p-4 text-right font-mono-tabular">
                  <span className="font-bold text-[#141413]">₹{prod.price}</span>
                  <span className="block text-[11px] text-[#78716C] line-through">
                    ₹{prod.compareAtPrice}
                  </span>
                </td>
                <td className="p-4 text-right font-mono-tabular font-semibold">
                  {prod.stock}
                </td>
                <td className="p-4">
                  <select
                    value={prod.status}
                    onChange={(e) =>
                      handleStatusChange(prod, e.target.value as Product['status'])
                    }
                    className="border border-[#D6D3D1] bg-white px-2 py-1 text-xs uppercase font-semibold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button
                    type="button"
                    onClick={() => onEdit(prod.id)}
                    className="font-semibold text-[#141413] underline"
                  >
                    Edit &amp; Media
                  </button>
                  <Link
                    to={`/products/${prod.slug}`}
                    className="text-[#8C6239] hover:underline"
                  >
                    Preview
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminProductEditorSection: React.FC<{
  productId?: string;
  products: Product[];
  categories: Category[];
  onBack: () => void;
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ productId, products, categories, onBack, showToast }) => {
  const existing = products.find((p) => p.id === productId);

  const [name, setName] = useState(existing?.name || '');
  const [slug, setSlug] = useState(existing?.slug || '');
  const [shortDescription, setShortDescription] = useState(
    existing?.shortDescription || ''
  );
  const [description, setDescription] = useState(existing?.description || '');
  const [category, setCategory] = useState(
    existing?.category || categories[0]?.slug || 'fragrance'
  );
  const [subcategory, setSubcategory] = useState(existing?.subcategory || '');
  const [concern, setConcern] = useState(existing?.concern || '');
  const [price, setPrice] = useState<number>(existing?.price || 599);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(
    existing?.compareAtPrice || 799
  );
  const [sku, setSku] = useState(existing?.sku || 'AV-NEW-001');
  const [stock, setStock] = useState<number>(existing?.stock ?? 50);
  const [mainImage, setMainImage] = useState(existing?.mainImage || '');
  const [mainImagePublicId, setMainImagePublicId] = useState(
    existing?.mainImagePublicId || ''
  );
  const [imageAlt, setImageAlt] = useState(existing?.imageAlt || '');
  const [galleryImages, setGalleryImages] = useState(
    existing?.galleryImages || []
  );
  const [highlightsText, setHighlightsText] = useState(
    (existing?.highlights || []).join('\n')
  );
  const [ingredients, setIngredients] = useState(existing?.ingredients || '');
  const [usageInstructions, setUsageInstructions] = useState(
    existing?.usageInstructions || ''
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(existing?.isFeatured));
  const [isBestseller, setIsBestseller] = useState(Boolean(existing?.isBestseller));
  const [isNewArrival, setIsNewArrival] = useState(Boolean(existing?.isNewArrival));
  const [status, setStatus] = useState<Product['status']>(
    existing?.status || 'published'
  );
  const [saving, setSaving] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!existing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
      if (!imageAlt) setImageAlt(val);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !mainImage.trim()) {
      showToast('Name, slug, and main product image are required.', 'error');
      return;
    }
    const safeCompareAt = Math.max(price, compareAtPrice);
    const discountPercent = calculateDiscountPercent(price, safeCompareAt);
    const id = existing?.id || `prod_${Date.now()}`;
    const now = new Date().toISOString();

    const record: Product = {
      id,
      slug: slug.trim().slice(0, 140),
      name: name.trim().slice(0, 140),
      shortDescription: shortDescription.trim().slice(0, 280),
      description: description.trim().slice(0, 4000),
      category: category.slice(0, 60),
      ...(subcategory.trim() ? { subcategory: subcategory.trim().slice(0, 60) } : {}),
      ...(concern.trim() ? { concern: concern.trim().slice(0, 60) } : {}),
      price: Number(price),
      compareAtPrice: Number(safeCompareAt),
      discountPercent,
      sku: sku.trim().slice(0, 64),
      stock: Math.max(0, Number(stock)),
      mainImage: mainImage.trim().slice(0, 1500),
      ...(mainImagePublicId ? { mainImagePublicId: mainImagePublicId.slice(0, 240) } : {}),
      imageAlt: (imageAlt.trim() || name.trim()).slice(0, 180),
      galleryImages: galleryImages.slice(0, 12),
      variants: existing?.variants || [
        {
          id: `v_${id}_std`,
          label: 'Standard Edition',
          price: Number(price),
          compareAtPrice: Number(safeCompareAt),
          sku: sku.trim().slice(0, 64),
          stock: Math.max(0, Number(stock)),
        },
      ],
      highlights: highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12),
      ...(ingredients.trim() ? { ingredients: ingredients.trim().slice(0, 1500) } : {}),
      ...(usageInstructions.trim()
        ? { usageInstructions: usageInstructions.trim().slice(0, 1500) }
        : {}),
      ratingAvg: existing?.ratingAvg ?? 4.8,
      reviewCount: existing?.reviewCount ?? 1,
      isFeatured,
      isBestseller,
      isNewArrival,
      status,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    setSaving(true);
    try {
      await setDoc(doc(db, 'products', id), record);
      showToast(`Saved product "${record.name}" to Firestore.`);
      onBack();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 border border-[#D6D3D1] bg-white flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
              {existing ? `Editing ${existing.id}` : 'Create New Product'}
            </p>
            <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
              {existing ? existing.name : 'New Grooming Formulation'}
            </h1>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239]"
        >
          {saving ? 'Saving to Firestore...' : 'Save Product'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Core Fields */}
        <div className="lg:col-span-7 bg-white border border-[#E5E0D8] p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Product Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                URL Slug *
              </label>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Short Description (Card Subtitle) *
            </label>
            <input
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Detailed Formulation Narrative *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-[#D6D3D1] p-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Category Vertical
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Subcategory
              </label>
              <input
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Eau De Parfum"
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Grooming Concern
              </label>
              <input
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="e.g. Oil Control"
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Compare-At MRP (₹)
              </label>
              <input
                type="number"
                required
                min={1}
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                SKU Code
              </label>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Available Stock
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Highlights (One bullet per line)
            </label>
            <textarea
              rows={3}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              className="w-full border border-[#D6D3D1] p-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Botanical Ingredients
              </label>
              <textarea
                rows={3}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full border border-[#D6D3D1] p-3 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Application / Usage Instructions
              </label>
              <textarea
                rows={3}
                value={usageInstructions}
                onChange={(e) => setUsageInstructions(e.target.value)}
                className="w-full border border-[#D6D3D1] p-3 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right: Cloudinary Image Management & Flags */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5E0D8] p-6 space-y-4">
            <h2 className="font-serif-display text-xl font-bold text-[#141413]">
              Cloudinary Product Photography
            </h2>

            <CloudinaryUploader
              label="Primary Product Image"
              currentUrl={mainImage}
              currentPublicId={mainImagePublicId}
              onUploaded={({ url, publicId }) => {
                setMainImage(url);
                setMainImagePublicId(publicId);
                showToast('Primary image uploaded to Cloudinary.');
              }}
            />

            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Or Direct Image URL / Data URI
              </label>
              <input
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Image Accessibility Alt Text *
              </label>
              <input
                required
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
              />
            </div>

            {/* Additional Gallery Uploader */}
            <div className="pt-3 border-t border-[#ECE7DF] space-y-3">
              <CloudinaryUploader
                label="Add Gallery Thumbnail Image"
                currentUrl=""
                onUploaded={({ url, publicId, width, height }) => {
                  setGalleryImages((prev) => [
                    ...prev,
                    { url, publicId, alt: name || 'Gallery view', width, height },
                  ]);
                  showToast('Added image to product gallery.');
                }}
              />
              {galleryImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {galleryImages.map((g, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 border border-[#D6D3D1] bg-[#F3EFEA]"
                    >
                      <img
                        src={getOptimizedImageUrl(g.url, 120)}
                        alt={g.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-700 text-white text-[10px] flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E5E0D8] p-6 space-y-4">
            <h2 className="font-serif-display text-xl font-bold text-[#141413]">
              Visibility &amp; Merchandising Flags
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#141413] mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Product['status'])}
                className="w-full border border-[#D6D3D1] px-3 py-2 text-xs bg-white"
              >
                <option value="published">Published (Live on Storefront)</option>
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <span>Featured Formulation</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                />
                <span>Bestseller Tag</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                />
                <span>New Release Tag</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

/* ============================================================================
 * 3. ADMIN INVENTORY SECTION
 * ==========================================================================*/
const AdminInventorySection: React.FC<{
  products: Product[];
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ products, showToast }) => {
  const handleQuickStockUpdate = async (product: Product, newStock: number) => {
    const clamped = Math.max(0, newStock);
    try {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        stock: clamped,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Stock for "${product.name}" updated to ${clamped}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${product.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5E0D8] pb-6">
        <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
          Warehouse &amp; Stock Control
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Live Inventory Matrix
        </h1>
      </div>

      <div className="bg-white border border-[#E5E0D8] overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5E0D8] bg-[#F3EFEA] uppercase text-[#57534E]">
              <th className="p-4">SKU</th>
              <th className="p-4">Formulation</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Quick Replenish</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE7DF]">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-mono-tabular font-semibold">{p.sku}</td>
                <td className="p-4 font-medium text-[#141413]">{p.name}</td>
                <td className="p-4 font-mono-tabular">
                  <span
                    className={`font-bold ${
                      p.stock === 0
                        ? 'text-red-700'
                        : p.stock <= 20
                        ? 'text-amber-700'
                        : 'text-emerald-800'
                    }`}
                  >
                    {p.stock} units
                  </span>
                </td>
                <td className="p-4">
                  {p.stock === 0 ? (
                    <span className="text-red-700 font-semibold">Out of Stock</span>
                  ) : p.stock <= 20 ? (
                    <span className="text-amber-800 inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                    </span>
                  ) : (
                    <span className="text-emerald-800">Healthy</span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuickStockUpdate(p, p.stock + 25)}
                    className="px-3 py-1.5 border border-[#141413] text-[#141413] font-mono-tabular hover:bg-[#141413] hover:text-white"
                  >
                    +25 Units
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStockUpdate(p, 0)}
                    className="px-3 py-1.5 border border-red-800 text-red-800 hover:bg-red-50"
                  >
                    Mark 0
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. ADMIN CATEGORIES SECTION
 * ==========================================================================*/
const AdminCategoriesSection: React.FC<{
  categories: Category[];
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ categories, showToast }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(categories[0]?.image || '');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    const id = `cat_${Date.now()}`;
    const now = new Date().toISOString();
    const record: Category = {
      id,
      name: name.trim().slice(0, 80),
      slug: slug.trim().toLowerCase().slice(0, 100),
      description: description.trim().slice(0, 400),
      image: image.slice(0, 1500),
      order: categories.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, 'categories', id), record);
      setName('');
      setSlug('');
      setDescription('');
      showToast(`Category "${record.name}" created.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${id}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Categories &amp; Collections ({categories.length})
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 bg-white border border-[#E5E0D8] flex gap-4 items-center"
            >
              <img
                src={getOptimizedImageUrl(cat.image, 160)}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-cover bg-[#F3EFEA] shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-[#141413]">{cat.name}</p>
                <p className="text-xs font-mono-tabular text-[#78716C]">
                  /collections/{cat.slug}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleAddCategory}
        className="lg:col-span-5 bg-white border border-[#E5E0D8] p-6 space-y-4 self-start"
      >
        <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
          Add Category Vertical
        </h2>
        <input
          required
          placeholder="Category Name (e.g. Body Care)"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
          }}
          className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
        />
        <input
          required
          placeholder="Slug (e.g. body-care)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
        />
        <textarea
          required
          rows={3}
          placeholder="Category Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-[#D6D3D1] p-3 text-xs"
        />
        <CloudinaryUploader
          label="Category Cover Image"
          currentUrl={image}
          onUploaded={({ url }) => setImage(url)}
        />
        <button
          type="submit"
          className="w-full py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
        >
          Save Category
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 5. ADMIN ORDERS LIST & ORDER FULFILLMENT / TRACKING CONTROLLER
 * ==========================================================================*/
const AdminOrdersListSection: React.FC<{
  orders: Order[];
  onSelectOrder: (id: string) => void;
}> = ({ orders, onSelectOrder }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQ, setSearchQ] = useState('');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
        );
      }
      return true;
    });
  }, [orders, statusFilter, searchQ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
            Fulfillment &amp; Courier Dispatch
          </p>
          <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
            Customer Orders ({filtered.length})
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search Order ID, name, phone..."
            className="bg-white border border-[#D6D3D1] px-3 py-2 text-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#D6D3D1] px-3 py-2 text-xs"
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#E5E0D8] overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5E0D8] bg-[#F3EFEA] uppercase text-[#57534E]">
              <th className="p-4">Order ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer &amp; PIN</th>
              <th className="p-4">Current Status</th>
              <th className="p-4">Payment</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE7DF]">
            {filtered.map((ord) => (
              <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                <td className="p-4 font-mono-tabular font-bold text-[#141413]">
                  {ord.id}
                </td>
                <td className="p-4 font-mono-tabular text-[#57534E]">
                  {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="p-4">
                  <p className="font-semibold text-[#141413]">{ord.customerName}</p>
                  <p className="text-[#78716C] font-mono-tabular">
                    {ord.customerPhone} · PIN {ord.pinCode}
                  </p>
                </td>
                <td className="p-4 font-semibold text-[#8C6239]">
                  {ORDER_STATUS_LABELS[ord.status]}
                </td>
                <td className="p-4 font-mono-tabular">
                  {ord.paymentMethod} · {ord.paymentStatus}
                </td>
                <td className="p-4 text-right font-mono-tabular font-bold">
                  ₹{ord.totalAmount.toLocaleString('en-IN')}
                </td>
                <td className="p-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectOrder(ord.id)}
                    className="px-3.5 py-1.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#8C6239]"
                  >
                    Update &amp; Track
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminOrderDetailSection: React.FC<{
  orderId: string;
  orders: Order[];
  adminName: string;
  onBack: () => void;
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ orderId, orders, adminName, onBack, showToast }) => {
  const order = orders.find((o) => o.id === orderId);
  const [events, setEvents] = useState<OrderEvent[]>([]);

  const allowedTransitions = useMemo(
    () => (order ? VALID_STATUS_TRANSITIONS[order.status] || [] : []),
    [order?.status]
  );

  const [nextStatus, setNextStatus] = useState<OrderStatus>(
    allowedTransitions[0] || order?.status || 'ORDER_CONFIRMED'
  );
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>(
    order?.paymentStatus || 'PENDING'
  );
  const [courierName, setCourierName] = useState(order?.courierName || '');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(order?.trackingUrl || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order?.estimatedDelivery || ''
  );
  const [locationNote, setLocationNote] = useState('Gurugram Fulfillment Hub');
  const [eventMessage, setEventMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    const nextList = VALID_STATUS_TRANSITIONS[order.status] || [];
    setNextStatus(nextList[0] || order.status);
    setPaymentStatus(order.paymentStatus);
    setCourierName(order.courierName || '');
    setTrackingNumber(order.trackingNumber || '');
    setTrackingUrl(order.trackingUrl || '');
    setEstimatedDelivery(order.estimatedDelivery || '');
  }, [order?.id, order?.status]);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(
      collection(db, 'orders', orderId, 'events'),
      (snap) => {
        setEvents(snap.docs.map((d) => d.data() as OrderEvent));
      }
    );
    return () => unsub();
  }, [orderId]);

  if (!order) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="underline text-xs">
          ← Back to Orders
        </button>
        <p className="text-sm">Order {orderId} not found.</p>
      </div>
    );
  }

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const defaultMsg =
        eventMessage.trim() ||
        `Order updated to "${ORDER_STATUS_LABELS[nextStatus]}"${
          courierName ? ` via ${courierName} (AWB: ${trackingNumber})` : ''
        }.`;

      await updateOrderStatusWithEvent({
        order,
        newStatus: nextStatus,
        message: defaultMsg,
        actorName: adminName,
        isAdminActor: true,
        location: locationNote,
        courierName,
        trackingNumber,
        trackingUrl,
        estimatedDelivery,
        paymentStatus,
      });

      setEventMessage('');
      showToast(`Order ${order.id} updated to ${ORDER_STATUS_LABELS[nextStatus]}.`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update order status.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 border border-[#D6D3D1] bg-white flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
              Order Fulfillment &amp; Audit Controller
            </p>
            <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
              Order #{order.id}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#141413] text-xs font-semibold uppercase tracking-wider"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Packing Slip</span>
        </button>
      </div>

      {/* Admin Status & Courier Dispatch Form */}
      <form
        onSubmit={handleUpdateOrder}
        className="bg-white border border-[#E5E0D8] p-6 space-y-5"
      >
        <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
          Record Verified Status Transition &amp; Courier Metadata
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Current Stage: {ORDER_STATUS_LABELS[order.status]} → Next Valid Stage
            </label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs bg-white font-semibold"
            >
              <option value={order.status}>
                Keep Current ({ORDER_STATUS_LABELS[order.status]})
              </option>
              {allowedTransitions.map((st) => (
                <option key={st} value={st}>
                  Transition to: {ORDER_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value as Order['paymentStatus'])
              }
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs bg-white"
            >
              <option value="PENDING">PENDING (COD Uncollected)</option>
              <option value="PAID">PAID (Collected on Delivery)</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Estimated Delivery Date
            </label>
            <input
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="e.g. Thu, 29 Oct 2026"
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Courier Partner Name
            </label>
            <input
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="e.g. BlueDart Priority / Delhivery"
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              AWB / Tracking ID
            </label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. BD892341092IN"
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              External Tracking URL (Optional)
            </label>
            <input
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Scan Location / Hub
            </label>
            <input
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Audit Event Message (Visible on Customer Timeline)
            </label>
            <input
              value={eventMessage}
              onChange={(e) => setEventMessage(e.target.value)}
              placeholder="e.g. Package quality-checked, sealed in rigid coffret, and handed over to BlueDart."
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239]"
        >
          {saving ? 'Recording Event...' : 'Save Order Update & Append Audit Event'}
        </button>
      </form>

      {/* Live Timeline Preview */}
      <OrderTimeline order={order} events={events} />
    </div>
  );
};

/* ============================================================================
 * 6. ADMIN CUSTOMERS SECTION
 * ==========================================================================*/
const AdminCustomersSection: React.FC<{
  customers: UserProfile[];
  orders: Order[];
}> = ({ customers, orders }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5E0D8] pb-6">
        <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
          Role-Based Customer Directory
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Registered Customers ({customers.length})
        </h1>
      </div>

      <div className="bg-white border border-[#E5E0D8] overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5E0D8] bg-[#F3EFEA] uppercase text-[#57534E]">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Registered</th>
              <th className="p-4 text-right">Orders Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE7DF]">
            {customers.map((c) => {
              const userOrderCount = orders.filter((o) => o.uid === c.uid).length;
              return (
                <tr key={c.uid}>
                  <td className="p-4 font-semibold text-[#141413]">
                    {c.displayName}
                  </td>
                  <td className="p-4 font-mono-tabular text-[#57534E]">{c.email}</td>
                  <td className="p-4 font-mono-tabular text-[#57534E]">
                    {c.phone || '—'}
                  </td>
                  <td className="p-4 font-mono-tabular text-[#78716C]">
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4 text-right font-mono-tabular font-bold">
                    {userOrderCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================================
 * 7. ADMIN BANNERS & HOMEPAGE SECTION
 * ==========================================================================*/
const AdminBannersSection: React.FC<{
  banners: Banner[];
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ banners, showToast }) => {
  const [editingBanner, setEditingBanner] = useState<Banner>(
    banners[0] || {
      id: 'banner_hero_1',
      title: '',
      subtitle: '',
      ctaText: 'Explore Collection',
      ctaLink: '/products',
      image: '',
      placement: 'hero',
      active: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const record: Banner = {
      ...editingBanner,
      title: editingBanner.title.slice(0, 140),
      subtitle: editingBanner.subtitle.slice(0, 280),
      ctaText: editingBanner.ctaText.slice(0, 50),
      ctaLink: editingBanner.ctaLink.slice(0, 200),
      image: editingBanner.image.slice(0, 1500),
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, 'banners', record.id), record);
      showToast(`Banner "${record.title}" saved to Firestore.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `banners/${record.id}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 space-y-4">
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Homepage &amp; Promotional Banners
        </h1>
        {banners.map((b) => (
          <div
            key={b.id}
            onClick={() => setEditingBanner(b)}
            className={`cursor-pointer p-4 border bg-white flex gap-4 items-center ${
              editingBanner.id === b.id ? 'border-[#141413]' : 'border-[#E5E0D8]'
            }`}
          >
            <img
              src={getOptimizedImageUrl(b.image, 200)}
              alt={b.title}
              referrerPolicy="no-referrer"
              className="w-24 h-16 object-cover bg-[#141413] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-[#8C6239] font-semibold">
                {b.placement} Banner
              </p>
              <p className="text-sm font-bold text-[#141413] truncate">{b.title}</p>
              <p className="text-xs text-[#57534E] truncate">{b.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSaveBanner}
        className="lg:col-span-6 bg-white border border-[#E5E0D8] p-6 space-y-4"
      >
        <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
          Edit Banner ({editingBanner.id})
        </h2>
        <div>
          <label className="block text-xs font-semibold mb-1">Headline *</label>
          <input
            required
            value={editingBanner.title}
            onChange={(e) =>
              setEditingBanner({ ...editingBanner, title: e.target.value })
            }
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Subtitle *</label>
          <textarea
            required
            rows={3}
            value={editingBanner.subtitle}
            onChange={(e) =>
              setEditingBanner({ ...editingBanner, subtitle: e.target.value })
            }
            className="w-full border border-[#D6D3D1] p-3 text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">CTA Label</label>
            <input
              required
              value={editingBanner.ctaText}
              onChange={(e) =>
                setEditingBanner({ ...editingBanner, ctaText: e.target.value })
              }
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">CTA Route</label>
            <input
              required
              value={editingBanner.ctaLink}
              onChange={(e) =>
                setEditingBanner({ ...editingBanner, ctaLink: e.target.value })
              }
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
            />
          </div>
        </div>

        <CloudinaryUploader
          label="Banner Visual (Cloudinary Upload)"
          currentUrl={editingBanner.image}
          currentPublicId={editingBanner.publicId}
          onUploaded={({ url, publicId }) =>
            setEditingBanner({ ...editingBanner, image: url, publicId })
          }
        />

        <button
          type="submit"
          className="w-full py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
        >
          Save Banner Changes
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 8. ADMIN COUPONS SECTION
 * ==========================================================================*/
const AdminCouponsSection: React.FC<{
  coupons: Coupon[];
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ coupons, showToast }) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderAmount, setMinOrderAmount] = useState(799);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(400);
  const [usageLimit, setUsageLimit] = useState(500);
  const [expiresAt, setExpiresAt] = useState('2027-12-31');

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) return;
    const id = `cpn_${cleanCode.toLowerCase()}`;
    const now = new Date().toISOString();
    const record: Coupon = {
      id,
      code: cleanCode.slice(0, 32),
      description: description.trim().slice(0, 200),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscountAmount: Number(maxDiscountAmount),
      usageLimit: Number(usageLimit),
      usedCount: 0,
      active: true,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, 'coupons', id), record);
      setCode('');
      setDescription('');
      showToast(`Coupon ${record.code} saved.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `coupons/${id}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Privilege Coupons ({coupons.length})
        </h1>
        <div className="space-y-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-white border border-[#E5E0D8] flex items-center justify-between"
            >
              <div>
                <p className="font-mono-tabular font-bold text-sm text-[#141413]">
                  {c.code} ({c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`})
                </p>
                <p className="text-xs text-[#57534E]">{c.description}</p>
                <p className="text-[11px] font-mono-tabular text-[#78716C] mt-1">
                  Min Order: ₹{c.minOrderAmount} · Redeemed: {c.usedCount}/{c.usageLimit}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 uppercase">
                {c.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleCreateCoupon}
        className="lg:col-span-5 bg-white border border-[#E5E0D8] p-6 space-y-4 self-start"
      >
        <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
          Create New Coupon
        </h2>
        <input
          required
          placeholder="Coupon Code (e.g. ROYAL25)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular uppercase"
        />
        <input
          required
          placeholder="Description (e.g. 25% off on orders above ₹1,299)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as 'percentage' | 'fixed')
            }
            className="border border-[#D6D3D1] px-3 py-2 text-xs bg-white"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
          <input
            type="number"
            required
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            placeholder="Value"
            className="border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] uppercase text-[#78716C]">
              Min Order ₹
            </label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(Number(e.target.value))}
              className="w-full border border-[#D6D3D1] px-2 py-1.5 text-xs font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-[#78716C]">
              Max Cap ₹
            </label>
            <input
              type="number"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
              className="w-full border border-[#D6D3D1] px-2 py-1.5 text-xs font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-[#78716C]">
              Usage Limit
            </label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
              className="w-full border border-[#D6D3D1] px-2 py-1.5 text-xs font-mono-tabular"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#57534E] mb-1">Expiry Date</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
        >
          Save Coupon
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 9. ADMIN REVIEWS MODERATION SECTION
 * ==========================================================================*/
const AdminReviewsSection: React.FC<{
  reviews: { id: string; productId: string; authorName: string; rating: number; title: string; comment: string; createdAt: string }[];
  products: Product[];
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ reviews, products, showToast }) => {
  const handleDeleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
      showToast('Review removed.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
        Customer Reviews ({reviews.length})
      </h1>
      <div className="space-y-4">
        {reviews.map((rev) => {
          const prod = products.find((p) => p.id === rev.productId);
          return (
            <div
              key={rev.id}
              className="p-5 bg-white border border-[#E5E0D8] flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-xs font-mono-tabular text-[#8C6239] font-semibold">
                  {'★'.repeat(rev.rating)} · {rev.authorName} on{' '}
                  {prod?.name || rev.productId}
                </p>
                <p className="text-sm font-bold text-[#141413]">{rev.title}</p>
                <p className="text-xs text-[#57534E]">{rev.comment}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteReview(rev.id)}
                className="text-xs text-red-700 hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 10. ADMIN STORE CUSTOMIZATION & SHIPPING SETTINGS
 * ==========================================================================*/
const AdminSettingsSection: React.FC<{
  settings: SiteSettings;
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ settings, showToast }) => {
  const [formState, setFormState] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updated: SiteSettings = {
      ...formState,
      id: 'global',
      brandName: formState.brandName.slice(0, 80),
      announcementText: formState.announcementText.slice(0, 240),
      freeShippingThreshold: Number(formState.freeShippingThreshold),
      flatShippingFee: Number(formState.flatShippingFee),
      returnWindowDays: Number(formState.returnWindowDays),
      estimatedDeliveryDays: formState.estimatedDeliveryDays.slice(0, 60),
      supportEmail: formState.supportEmail.slice(0, 120),
      supportPhone: formState.supportPhone.slice(0, 30),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'settings', 'global'), updated);
      showToast('Storefront & shipping settings updated live in Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/global');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="max-w-3xl bg-white border border-[#E5E0D8] p-6 md:p-8 space-y-6"
    >
      <div className="border-b border-[#E5E0D8] pb-4">
        <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
          Live Storefront Configuration
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Brand Identity, Announcement &amp; Shipping Rules
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#141413] mb-1">
            Brand Wordmark
          </label>
          <input
            required
            value={formState.brandName}
            onChange={(e) =>
              setFormState({ ...formState, brandName: e.target.value })
            }
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 pt-5">
          <input
            id="ann-enabled"
            type="checkbox"
            checked={formState.announcementEnabled}
            onChange={(e) =>
              setFormState({
                ...formState,
                announcementEnabled: e.target.checked,
              })
            }
          />
          <label htmlFor="ann-enabled" className="text-xs font-semibold">
            Enable Top Announcement Bar
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#141413] mb-1">
          Top Announcement Bar Text
        </label>
        <input
          required
          value={formState.announcementText}
          onChange={(e) =>
            setFormState({ ...formState, announcementText: e.target.value })
          }
          className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#ECE7DF]">
        <div>
          <label className="block text-xs font-semibold text-[#141413] mb-1">
            Free Shipping Threshold (₹)
          </label>
          <input
            type="number"
            required
            min={0}
            value={formState.freeShippingThreshold}
            onChange={(e) =>
              setFormState({
                ...formState,
                freeShippingThreshold: Number(e.target.value),
              })
            }
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#141413] mb-1">
            Flat Shipping Fee (₹)
          </label>
          <input
            type="number"
            required
            min={0}
            value={formState.flatShippingFee}
            onChange={(e) =>
              setFormState({
                ...formState,
                flatShippingFee: Number(e.target.value),
              })
            }
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#141413] mb-1">
            Return Eligibility Window (Days)
          </label>
          <input
            type="number"
            required
            min={0}
            value={formState.returnWindowDays}
            onChange={(e) =>
              setFormState({
                ...formState,
                returnWindowDays: Number(e.target.value),
              })
            }
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#141413] mb-1">
            Estimated Delivery Range
          </label>
          <input
            required
            value={formState.estimatedDeliveryDays}
            onChange={(e) =>
              setFormState({
                ...formState,
                estimatedDeliveryDays: e.target.value,
              })
            }
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 pt-5">
          <input
            id="cod-toggle"
            type="checkbox"
            checked={formState.codEnabled}
            onChange={(e) =>
              setFormState({ ...formState, codEnabled: e.target.checked })
            }
          />
          <label htmlFor="cod-toggle" className="text-xs font-semibold">
            Enable Cash on Delivery (COD) at Checkout
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#ECE7DF]">
        <div>
          <label className="block text-xs font-semibold text-[#141413] mb-1">
            Concierge Support Email
          </label>
          <input
            required
            value={formState.supportEmail}
            onChange={(e) =>
              setFormState({ ...formState, supportEmail: e.target.value })
            }
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#141413] mb-1">
            Concierge Support Phone
          </label>
          <input
            required
            value={formState.supportPhone}
            onChange={(e) =>
              setFormState({ ...formState, supportPhone: e.target.value })
            }
            className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239]"
      >
        {saving ? 'Saving Settings...' : 'Save Storefront & Shipping Settings'}
      </button>
    </form>
  );
};

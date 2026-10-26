import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { onValue, ref as rtdbRef } from 'firebase/database';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Boxes,
  CheckCircle2,
  Database,
  ExternalLink,
  FolderKanban,
  Image as ImageIcon,
  KeyRound,
  Lock,
  Mail,
  MessageSquare,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Trash2,
  Truck,
  Users,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { OrderTimeline } from '../components/OrderTimeline';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  checkUserRtdbStatus,
  db,
  rtdb,
  USER_FIREBASE_CONFIG,
} from '../lib/firebase';
import {
  calculateDiscountPercent,
  getLocalOrderEvents,
  getLocalOrders,
  updateOrderStatusWithEvent,
} from '../lib/orders';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import {
  Banner,
  Category,
  Coupon,
  Order,
  OrderEvent,
  OrderStatus,
  ORDER_STATUS_LABELS,
  Product,
  Review,
  SiteSettings,
  UserProfile,
  VALID_STATUS_TRANSITIONS,
} from '../types';

const UPLOADED_FRONT_POSTER =
  '/assets/aistudio/file_000000003fa4821191761d6e8721cedc_8068ff0c.png';

const ADMIN_NAV_LINKS = [
  { to: '/admin', label: 'Dashboard Overview', icon: BarChart3 },
  { to: '/admin/banners', label: 'Banners & Front Poster', icon: ImageIcon },
  { to: '/admin/products', label: 'Products Catalog', icon: Package },
  { to: '/admin/inventory', label: 'Stock & Inventory', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: FolderKanban },
  { to: '/admin/orders', label: 'Orders & Dispatch', icon: Truck },
  { to: '/admin/coupons', label: 'Coupons & Offers', icon: TicketPercent },
  { to: '/admin/reviews', label: 'Customer Reviews', icon: MessageSquare },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/settings', label: 'Store & Firebase', icon: Settings },
];

export const AdminLoginPage: React.FC = () => {
  const {
    loginWithEmail,
    loginWithGoogle,
    enableAdminSession,
  } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@cartlane.in');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleEmailAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await loginWithEmail(email || 'admin@cartlane.in', password || 'admin123');
      enableAdminSession();
      navigate('/admin');
    } finally {
      setBusy(false);
    }
  };

  const handleInstantAdminAccess = () => {
    enableAdminSession();
    navigate('/admin');
  };

  return (
    <main className="min-h-screen bg-[#F1F3F6] flex items-center justify-center p-4 md:p-6">
      <div className="max-w-3xl w-full bg-white rounded-sm fk-card-shadow overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-[#E0E0E0]">
        {/* Left Flipkart Seller Hub Blue Panel */}
        <div className="md:col-span-5 bg-[#2874F0] text-white p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FFE500]">
              <Sparkles className="w-3.5 h-3.5 fill-[#FFE500]" />
              <span>Cartlane Seller Hub</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug">
              Admin Console &amp; Full Store Control
            </h1>
            <p className="text-xs text-white/85 leading-relaxed">
              Control front hero banners, products, pricing, inventory, categories, coupons, reviews, orders, and store settings in real time.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-white/20 space-y-1.5 text-[11px] text-white/90">
            <p className="font-bold text-[#FFE500] uppercase tracking-wider">
              Connected Firebase Config
            </p>
            <p className="font-mono-tabular truncate">
              Project: {USER_FIREBASE_CONFIG.projectId}
            </p>
            <p className="font-mono-tabular truncate">
              Region: asia-southeast1 (RTDB)
            </p>
          </div>
        </div>

        {/* Right Login Actions */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#212121]">
                Admin Login (Email &amp; Password)
              </h2>
              <p className="text-xs text-[#878787] mt-0.5">
                Sign in with your admin email &amp; password or open the Admin Console with 1 click.
              </p>
            </div>

            <form onSubmit={handleEmailAdminLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cartlane.in"
                    className="w-full border border-[#D0D0D0] rounded-sm pl-9 pr-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full border border-[#D0D0D0] rounded-sm pl-9 pr-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 px-4 bg-[#FB641B] hover:bg-[#e85812] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{busy ? 'Opening Admin Panel...' : 'Login with Email & Open Admin'}</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleInstantAdminAccess}
                className="py-2.5 px-3 bg-[#388E3C] hover:bg-[#2E7D32] text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Direct Admin</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await loginWithGoogle();
                  enableAdminSession();
                  navigate('/admin');
                }}
                className="py-2.5 px-3 bg-[#2874F0] hover:bg-[#1C5FD4] text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Admin Login</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
            <Link to="/" className="text-[#2874F0] font-bold hover:underline">
              ← Back to Cartlane Storefront
            </Link>
            <span className="text-[#878787] font-mono-tabular">Seller Hub Admin</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export const AdminPortal: React.FC = () => {
  const {
    user,
    userProfile,
    isDatabaseLive,
    allAdminProducts,
    categories,
    banners,
    coupons,
    reviews,
    settings,
    seedCatalogToFirestore,
    upsertProduct,
    removeProduct,
    upsertCategory,
    removeCategory,
    upsertBanner,
    removeBanner,
    upsertCoupon,
    removeCoupon,
    upsertReview,
    removeReview,
    saveSiteSettings,
    showToast,
  } = useStore();

  const location = useLocation();
  const navigate = useNavigate();
  const { productId, orderId } = useParams<{ productId?: string; orderId?: string }>();

  const [fsOrders, setFsOrders] = useState<Order[]>([]);
  const [rtdbOrders, setRtdbOrders] = useState<Order[]>([]);
  const [localOrders, setLocalOrders] = useState<Order[]>(() => getLocalOrders());
  const [fsCustomers, setFsCustomers] = useState<UserProfile[]>([]);
  const [rtdbCustomers, setRtdbCustomers] = useState<UserProfile[]>([]);
  const [syncingSeed, setSyncingSeed] = useState(false);
  const [rtdbStatus, setRtdbStatus] = useState<{
    connected: boolean;
    projectId: string;
    databaseURL: string;
    message: string;
  }>({
    connected: true,
    projectId: USER_FIREBASE_CONFIG.projectId,
    databaseURL: USER_FIREBASE_CONFIG.databaseURL,
    message: 'Connected to studio-9019379244-c807b Realtime Database',
  });

  useEffect(() => {
    checkUserRtdbStatus().then(setRtdbStatus);
    setLocalOrders(getLocalOrders());
  }, [location.pathname]);

  // Subscribe to Realtime Database orders & users (studio-9019379244-c807b)
  useEffect(() => {
    const unsubRtdbOrders = onValue(
      rtdbRef(rtdb, 'orders'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, Order>;
          setRtdbOrders(Object.values(val));
        }
      },
      () => {}
    );

    const unsubRtdbUsers = onValue(
      rtdbRef(rtdb, 'users'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, UserProfile>;
          setRtdbCustomers(Object.values(val));
        }
      },
      () => {}
    );

    return () => {
      unsubRtdbOrders();
      unsubRtdbUsers();
    };
  }, []);

  // Subscribe to Firestore orders & users when authenticated
  useEffect(() => {
    if (!user) return;

    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Order);
        setFsOrders(list);
      },
      () => {}
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as UserProfile);
        setFsCustomers(list);
      },
      () => {}
    );

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, [user]);

  const allOrders = useMemo(() => {
    const map = new Map<string, Order>();
    for (const o of localOrders) if (o?.id) map.set(o.id, o);
    for (const o of fsOrders) if (o?.id) map.set(o.id, o);
    for (const o of rtdbOrders) if (o?.id) map.set(o.id, o);
    return Array.from(map.values()).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  }, [localOrders, fsOrders, rtdbOrders]);

  const allCustomers = useMemo(() => {
    const map = new Map<string, UserProfile>();
    if (userProfile?.uid) map.set(userProfile.uid, userProfile);
    for (const u of fsCustomers) if (u?.uid) map.set(u.uid, u);
    for (const u of rtdbCustomers) if (u?.uid) map.set(u.uid, u);
    return Array.from(map.values()).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  }, [userProfile, fsCustomers, rtdbCustomers]);

  const handleSyncCatalog = async () => {
    setSyncingSeed(true);
    try {
      await seedCatalogToFirestore();
      const status = await checkUserRtdbStatus();
      setRtdbStatus(status);
    } finally {
      setSyncingSeed(false);
    }
  };

  const path = location.pathname;

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex flex-col">
      {/* Top Flipkart Seller Hub Blue Header */}
      <header className="bg-[#2874F0] text-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex flex-col leading-none">
              <span className="text-lg md:text-xl font-extrabold italic tracking-tight text-white">
                {settings.brandName || 'Cartlane'}
              </span>
              <span className="text-[10px] font-bold italic text-[#FFE500] flex items-center gap-1">
                Seller Hub <span className="text-white not-italic">Admin Panel</span>
                <Sparkles className="w-2.5 h-2.5 fill-[#FFE500] text-[#FFE500]" />
              </span>
            </Link>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] bg-white/15 px-2.5 py-1 rounded-sm font-mono-tabular">
              <Database className="w-3 h-3 text-[#FFE500]" />
              <span>Firebase: {USER_FIREBASE_CONFIG.projectId}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={syncingSeed}
              onClick={handleSyncCatalog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE500] text-[#212121] text-[11px] font-bold uppercase tracking-wider rounded-sm hover:bg-[#f5dc00] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSeed ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {syncingSeed ? 'Syncing Firebase...' : 'Sync All to Firebase'}
              </span>
              <span className="sm:hidden">{syncingSeed ? '...' : 'Sync DB'}</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#2874F0] text-[11px] font-bold uppercase tracking-wider rounded-sm hover:bg-white/90 transition-colors"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        {/* Left Seller Hub Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-[#172337] text-white shrink-0 flex flex-col justify-between">
          <div className="p-2.5 lg:p-4">
            <p className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-[#878787] px-3 pb-2">
              Complete Store Control
            </p>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
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
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#2874F0] text-white shadow-sm'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden lg:block p-4 border-t border-white/10 space-y-2 text-[11px] text-white/75">
            <div className="flex items-center gap-1.5 text-[#FFE500] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Firebase RTDB Live</span>
            </div>
            <p className="font-mono-tabular text-[10px] text-white/60 break-all">
              {USER_FIREBASE_CONFIG.databaseURL}
            </p>
            <p className="font-mono-tabular text-[10px] text-white/80 truncate pt-1">
              Admin: {userProfile?.email || user?.email || BOOTSTRAP_ADMIN_EMAIL}
            </p>
          </div>
        </aside>

        {/* Main Admin Workspace */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 space-y-6 overflow-x-hidden">
          {/* Quick Control Bar */}
          <div className="bg-white border border-[#E0E0E0] rounded-sm p-4 fk-card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2874F0]">
                  Admin Control Center · {USER_FIREBASE_CONFIG.projectId}
                </span>
                <span className="text-[11px] text-[#388E3C] font-bold">
                  · {isDatabaseLive ? 'Live Sync Active' : rtdbStatus.message}
                </span>
              </div>
              <p className="text-xs text-[#565656]">
                Every change to Banners, Products, Prices, Stock, Categories, Coupons, Orders, and Settings updates the storefront immediately.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                to="/admin/banners"
                className="px-3.5 py-2 bg-[#FB641B] hover:bg-[#e85812] text-white text-xs font-bold uppercase tracking-wider rounded-sm"
              >
                Manage Front Banner
              </Link>
              <Link
                to="/admin/products/new"
                className="px-3.5 py-2 bg-[#2874F0] hover:bg-[#1C5FD4] text-white text-xs font-bold uppercase tracking-wider rounded-sm"
              >
                + Add Product
              </Link>
            </div>
          </div>

          {/* Route Dispatcher */}
          {path === '/admin' && (
            <AdminOverviewSection
              orders={allOrders}
              customers={allCustomers}
              products={allAdminProducts}
              banners={banners}
              coupons={coupons}
              onSeed={handleSyncCatalog}
              syncingSeed={syncingSeed}
            />
          )}

          {path === '/admin/products' && (
            <AdminProductsListSection
              products={allAdminProducts}
              onEdit={(id) => navigate(`/admin/products/${id}`)}
              onCreate={() => navigate('/admin/products/new')}
              onUpsert={upsertProduct}
              onRemove={removeProduct}
            />
          )}

          {(path === '/admin/products/new' ||
            (path.startsWith('/admin/products/') && productId)) && (
            <AdminProductEditorSection
              productId={path === '/admin/products/new' ? undefined : productId}
              products={allAdminProducts}
              categories={categories}
              onBack={() => navigate('/admin/products')}
              onUpsert={upsertProduct}
              showToast={showToast}
            />
          )}

          {path === '/admin/inventory' && (
            <AdminInventorySection
              products={allAdminProducts}
              onUpsert={upsertProduct}
            />
          )}

          {(path === '/admin/categories' || path === '/admin/collections') && (
            <AdminCategoriesSection
              categories={categories}
              onUpsert={upsertCategory}
              onRemove={removeCategory}
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
              adminName={
                userProfile?.displayName || user?.email || 'Cartlane Store Admin'
              }
              onBack={() => navigate('/admin/orders')}
              onOrderUpdated={() => setLocalOrders(getLocalOrders())}
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
              onUpsert={upsertBanner}
              onRemove={removeBanner}
              showToast={showToast}
            />
          )}

          {path === '/admin/coupons' && (
            <AdminCouponsSection
              coupons={coupons}
              onUpsert={upsertCoupon}
              onRemove={removeCoupon}
            />
          )}

          {path === '/admin/reviews' && (
            <AdminReviewsSection
              reviews={reviews}
              products={allAdminProducts}
              onUpsert={upsertReview}
              onRemove={removeReview}
            />
          )}

          {(path === '/admin/settings' || path === '/admin/shipping') && (
            <AdminSettingsSection
              settings={settings}
              onSave={saveSiteSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
};

/* ============================================================================
 * 1. ADMIN OVERVIEW DASHBOARD (COMPLETE CONTROL TILES + LIVE KPIs)
 * ==========================================================================*/
const AdminOverviewSection: React.FC<{
  orders: Order[];
  customers: UserProfile[];
  products: Product[];
  banners: Banner[];
  coupons: Coupon[];
  onSeed: () => void;
  syncingSeed: boolean;
}> = ({ orders, customers, products, banners, coupons, onSeed, syncingSeed }) => {
  const awaitingProcessing = orders.filter((o) =>
    [
      'ORDER_PLACED',
      'ORDER_CONFIRMED',
      'PROCESSING',
      'CANCELLATION_REQUESTED',
      'RETURN_REQUESTED',
    ].includes(o.status)
  ).length;

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const lowStockProducts = products.filter((p) => p.stock <= 20);

  const eligibleRevenue = orders
    .filter((o) => !['CANCELLED', 'REFUNDED', 'RETURNED'].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Front Banner Poster Preview Card */}
      <div className="bg-white p-5 rounded-sm fk-card-shadow grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-5 rounded-sm overflow-hidden border border-[#E0E0E0] bg-[#09358A]">
          <img
            src={banners[0]?.image || UPLOADED_FRONT_POSTER}
            alt={banners[0]?.title || 'Front Hero Banner'}
            referrerPolicy="no-referrer"
            className="w-full aspect-16/9 object-contain"
          />
        </div>
        <div className="lg:col-span-7 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#388E3C]">
            Active #1 Front Hero Banner on Homepage
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#212121]">
            {banners[0]?.title || 'Up To 50% Off Best Skincare & Grooming Products'}
          </h2>
          <p className="text-xs text-[#565656] leading-relaxed">
            {banners[0]?.subtitle ||
              'Your uploaded promotional poster is live as the #1 Front Banner on the Cartlane storefront.'}
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Link
              to="/admin/banners"
              className="px-4 py-2 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-sm"
            >
              Edit / Add Banners ({banners.length})
            </Link>
            <Link
              to="/"
              className="px-4 py-2 border border-[#2874F0] text-[#2874F0] text-xs font-bold uppercase tracking-wider rounded-sm"
            >
              View Live on Homepage →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Module Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/products"
          className="p-4 bg-white rounded-sm fk-card-shadow hover:border-[#2874F0] border border-transparent transition-all"
        >
          <Package className="w-5 h-5 text-[#2874F0]" />
          <p className="text-sm font-bold text-[#212121] mt-2">
            Products ({products.length})
          </p>
          <p className="text-[11px] text-[#878787]">Add, edit, or delete items</p>
        </Link>

        <Link
          to="/admin/banners"
          className="p-4 bg-white rounded-sm fk-card-shadow hover:border-[#2874F0] border border-transparent transition-all"
        >
          <ImageIcon className="w-5 h-5 text-[#FB641B]" />
          <p className="text-sm font-bold text-[#212121] mt-2">
            Banners ({banners.length})
          </p>
          <p className="text-[11px] text-[#878787]">Front poster &amp; hero slides</p>
        </Link>

        <Link
          to="/admin/orders"
          className="p-4 bg-white rounded-sm fk-card-shadow hover:border-[#2874F0] border border-transparent transition-all"
        >
          <Truck className="w-5 h-5 text-[#388E3C]" />
          <p className="text-sm font-bold text-[#212121] mt-2">
            Orders ({orders.length})
          </p>
          <p className="text-[11px] text-[#878787]">Dispatch &amp; live tracking</p>
        </Link>

        <Link
          to="/admin/coupons"
          className="p-4 bg-white rounded-sm fk-card-shadow hover:border-[#2874F0] border border-transparent transition-all"
        >
          <TicketPercent className="w-5 h-5 text-[#2874F0]" />
          <p className="text-sm font-bold text-[#212121] mt-2">
            Coupons ({coupons.length})
          </p>
          <p className="text-[11px] text-[#878787]">Discount codes &amp; offers</p>
        </Link>
      </div>

      {/* 6 Real Database KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-sm fk-card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-[#878787]">
            Gross Order Revenue
          </p>
          <p className="font-mono-tabular text-2xl md:text-3xl font-bold text-[#212121] mt-2">
            ₹{eligibleRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#388E3C] font-semibold mt-1">
            {orders.length} Total Orders Recorded
          </p>
        </div>

        <div className="p-5 bg-white rounded-sm fk-card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-[#878787]">
            Orders Pending Dispatch
          </p>
          <p className="font-mono-tabular text-2xl md:text-3xl font-bold text-[#FB641B] mt-2">
            {awaitingProcessing}
          </p>
          <p className="text-xs text-[#565656] mt-1">
            Placed, confirmed, or awaiting review
          </p>
        </div>

        <div className="p-5 bg-white rounded-sm fk-card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-[#878787]">
            Active Catalog Listings
          </p>
          <p className="font-mono-tabular text-2xl md:text-3xl font-bold text-[#2874F0] mt-2">
            {publishedCount} / {products.length}
          </p>
          <p className="text-xs text-[#565656] mt-1">
            Live products on Cartlane Storefront
          </p>
        </div>

        <div className="p-5 bg-white rounded-sm fk-card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-[#878787]">
            Registered Buyers
          </p>
          <p className="font-mono-tabular text-2xl font-bold text-[#212121] mt-2">
            {customers.length}
          </p>
          <p className="text-xs text-[#565656] mt-1">
            Email/Password &amp; Google accounts
          </p>
        </div>

        <div className="p-5 bg-white rounded-sm fk-card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-[#878787]">
            Low-Stock SKUs (≤ 20 units)
          </p>
          <p className="font-mono-tabular text-2xl font-bold text-[#212121] mt-2">
            {lowStockProducts.length}
          </p>
          <p className="text-xs text-[#565656] mt-1">
            <Link to="/admin/inventory" className="text-[#2874F0] font-bold hover:underline">
              Open Inventory Matrix →
            </Link>
          </p>
        </div>

        <div className="p-5 bg-white rounded-sm fk-card-shadow flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2874F0]">
              Store &amp; Firebase Sync
            </p>
            <p className="text-xs font-mono-tabular text-[#212121] font-bold mt-1">
              {USER_FIREBASE_CONFIG.projectId}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-3">
            <Link
              to="/admin/settings"
              className="px-3 py-1.5 bg-[#2874F0] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm"
            >
              Store Settings
            </Link>
            <button
              type="button"
              disabled={syncingSeed}
              onClick={onSeed}
              className="px-3 py-1.5 border border-[#D6D3D1] text-[#212121] text-[11px] font-bold uppercase tracking-wider rounded-sm cursor-pointer"
            >
              Sync Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-sm fk-card-shadow p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
          <h2 className="text-base md:text-lg font-bold text-[#212121]">
            Recent Customer Orders ({orders.length})
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-[#2874F0] hover:underline"
          >
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm font-bold text-[#212121]">
              No live customer orders yet
            </p>
            <p className="text-xs text-[#878787]">
              Place a test COD order from the storefront to inspect real-time order tracking and fulfillment controls here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E0E0E0] bg-[#F5F7FA] text-[#878787] uppercase tracking-wider">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {orders.slice(0, 8).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F9FAFC]">
                    <td className="py-3 px-3 font-mono-tabular font-bold text-[#2874F0]">
                      {ord.id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#212121]">{ord.customerName}</span>
                      <span className="block text-[#878787]">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3 font-mono-tabular text-[#565656]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#388E3C]">
                      {ORDER_STATUS_LABELS[ord.status]}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular font-bold text-[#212121]">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="px-3 py-1 bg-[#2874F0] text-white font-bold rounded-sm inline-block"
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
 * 2. ADMIN PRODUCTS LIST & EDITOR (FULL ADD / EDIT / DELETE)
 * ==========================================================================*/
const AdminProductsListSection: React.FC<{
  products: Product[];
  onEdit: (id: string) => void;
  onCreate: () => void;
  onUpsert: (product: Product) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}> = ({ products, onEdit, onCreate, onUpsert, onRemove }) => {
  const [searchQ, setSearchQ] = useState('');

  const filtered = useMemo(() => {
    if (!searchQ.trim()) return products;
    const q = searchQ.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, searchQ]);

  const handleStatusChange = async (product: Product, nextStatus: Product['status']) => {
    await onUpsert({
      ...product,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-sm fk-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
            Catalog Management
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-[#212121]">
            Products ({filtered.length})
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search SKU, name, category..."
            className="border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs w-56"
          />
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FB641B] hover:bg-[#e85812] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-sm fk-card-shadow overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E0E0E0] bg-[#F5F7FA] text-[#878787] uppercase tracking-wider">
              <th className="p-3.5">Product</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">SKU</th>
              <th className="p-3.5 text-right">Selling Price / MRP</th>
              <th className="p-3.5 text-right">Stock</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {filtered.map((prod) => (
              <tr key={prod.id} className="hover:bg-[#F9FAFC]">
                <td className="p-3.5 flex items-center gap-3">
                  <img
                    src={getOptimizedImageUrl(prod.mainImage, 120)}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain bg-[#F8F9FA] border border-[#E0E0E0] rounded-sm p-1 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-[#212121]">{prod.name}</p>
                    <p className="text-[11px] text-[#878787]">/{prod.slug}</p>
                  </div>
                </td>
                <td className="p-3.5 capitalize text-[#565656] font-medium">
                  {prod.category.replace('-', ' ')}
                </td>
                <td className="p-3.5 font-mono-tabular text-[#565656]">{prod.sku}</td>
                <td className="p-3.5 text-right font-mono-tabular">
                  <span className="font-bold text-[#212121]">₹{prod.price}</span>
                  <span className="block text-[11px] text-[#878787] line-through">
                    ₹{prod.compareAtPrice}
                  </span>
                </td>
                <td className="p-3.5 text-right font-mono-tabular font-bold text-[#212121]">
                  {prod.stock}
                </td>
                <td className="p-3.5">
                  <select
                    value={prod.status}
                    onChange={(e) =>
                      handleStatusChange(prod, e.target.value as Product['status'])
                    }
                    className="border border-[#D6D3D1] rounded-sm bg-white px-2 py-1 text-xs font-bold text-[#212121]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onEdit(prod.id)}
                    className="px-3 py-1 bg-[#2874F0] text-white font-bold rounded-sm cursor-pointer"
                  >
                    Edit
                  </button>
                  <Link
                    to={`/products/${prod.slug}`}
                    className="px-2.5 py-1 border border-[#D6D3D1] text-[#212121] font-semibold rounded-sm inline-block"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(prod.id)}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline" />
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

const AdminProductEditorSection: React.FC<{
  productId?: string;
  products: Product[];
  categories: Category[];
  onBack: () => void;
  onUpsert: (product: Product) => Promise<void>;
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ productId, products, categories, onBack, onUpsert, showToast }) => {
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
  const [sku, setSku] = useState(existing?.sku || 'CL-NEW-001');
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
      ...(mainImagePublicId
        ? { mainImagePublicId: mainImagePublicId.slice(0, 240) }
        : {}),
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
      reviewCount: existing?.reviewCount ?? 12,
      isFeatured,
      isBestseller,
      isNewArrival,
      status,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    setSaving(true);
    try {
      await onUpsert(record);
      onBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white p-5 rounded-sm fk-card-shadow flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 border border-[#D6D3D1] rounded-sm bg-white flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
              {existing ? `Editing ${existing.id}` : 'Create New Listing'}
            </p>
            <h1 className="text-xl font-bold text-[#212121]">
              {existing ? existing.name : 'New Grooming Product'}
            </h1>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#FB641B] hover:bg-[#e85812] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Core Fields */}
        <div className="lg:col-span-7 bg-white rounded-sm fk-card-shadow p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Product Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                URL Slug *
              </label>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Short Description (Card Subtitle) *
            </label>
            <input
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Detailed Product Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-[#D6D3D1] rounded-sm p-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Subcategory
              </label>
              <input
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Eau De Parfum"
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Grooming Concern
              </label>
              <input
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="e.g. Oil Control"
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                MRP (₹)
              </label>
              <input
                type="number"
                required
                min={1}
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                SKU Code
              </label>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Stock Units
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Highlights (One bullet per line)
            </label>
            <textarea
              rows={3}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              className="w-full border border-[#D6D3D1] rounded-sm p-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Key Ingredients
              </label>
              <textarea
                rows={3}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full border border-[#D6D3D1] rounded-sm p-3 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                How to Use
              </label>
              <textarea
                rows={3}
                value={usageInstructions}
                onChange={(e) => setUsageInstructions(e.target.value)}
                className="w-full border border-[#D6D3D1] rounded-sm p-3 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right: Image Management & Flags */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-sm fk-card-shadow p-6 space-y-4">
            <h2 className="text-base font-bold text-[#212121]">
              Product Photography (Cloudinary / Direct URL)
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
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Or Direct Image URL
              </label>
              <input
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Image Alt Text *
              </label>
              <input
                required
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
              />
            </div>

            {/* Additional Gallery Uploader */}
            <div className="pt-3 border-t border-[#F0F0F0] space-y-3">
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
                      className="relative w-16 h-16 border border-[#D6D3D1] rounded-sm bg-[#F8F9FA]"
                    >
                      <img
                        src={getOptimizedImageUrl(g.url, 120)}
                        alt={g.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-sm fk-card-shadow p-6 space-y-4">
            <h2 className="text-base font-bold text-[#212121]">
              Visibility &amp; Storefront Tags
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#212121] mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Product['status'])}
                className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs bg-white font-semibold"
              >
                <option value="published">Published (Live on Storefront)</option>
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2 text-xs font-medium text-[#212121]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <span>Featured Deal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                />
                <span>BESTSELLER Badge</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                />
                <span>NEW LAUNCH Badge</span>
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
  onUpsert: (product: Product) => Promise<void>;
}> = ({ products, onUpsert }) => {
  const handleQuickStockUpdate = async (product: Product, newStock: number) => {
    const clamped = Math.max(0, newStock);
    await onUpsert({
      ...product,
      stock: clamped,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-sm fk-card-shadow">
        <p className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
          Warehouse &amp; Stock Control
        </p>
        <h1 className="text-xl md:text-2xl font-bold text-[#212121]">
          Live Inventory Matrix
        </h1>
      </div>

      <div className="bg-white rounded-sm fk-card-shadow overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E0E0E0] bg-[#F5F7FA] uppercase text-[#878787]">
              <th className="p-3.5">SKU</th>
              <th className="p-3.5">Product</th>
              <th className="p-3.5">Current Stock</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Quick Replenish</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[#F9FAFC]">
                <td className="p-3.5 font-mono-tabular font-bold text-[#2874F0]">
                  {p.sku}
                </td>
                <td className="p-3.5 font-bold text-[#212121]">{p.name}</td>
                <td className="p-3.5 font-mono-tabular">
                  <span
                    className={`font-bold ${
                      p.stock === 0
                        ? 'text-red-600'
                        : p.stock <= 20
                        ? 'text-amber-600'
                        : 'text-[#388E3C]'
                    }`}
                  >
                    {p.stock} units
                  </span>
                </td>
                <td className="p-3.5">
                  {p.stock === 0 ? (
                    <span className="text-red-600 font-bold">Out of Stock</span>
                  ) : p.stock <= 20 ? (
                    <span className="text-amber-700 font-bold inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                    </span>
                  ) : (
                    <span className="text-[#388E3C] font-bold">In Stock</span>
                  )}
                </td>
                <td className="p-3.5 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuickStockUpdate(p, p.stock + 25)}
                    className="px-3 py-1.5 bg-[#2874F0] text-white font-mono-tabular font-bold rounded-sm cursor-pointer"
                  >
                    +25 Units
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStockUpdate(p, 0)}
                    className="px-3 py-1.5 border border-red-600 text-red-600 font-bold rounded-sm hover:bg-red-50 cursor-pointer"
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
 * 4. ADMIN CATEGORIES SECTION (ADD / EDIT / DELETE)
 * ==========================================================================*/
const AdminCategoriesSection: React.FC<{
  categories: Category[];
  onUpsert: (category: Category) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}> = ({ categories, onUpsert, onRemove }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(categories[0]?.image || '');

  const handleSelectEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    const id = editingId || `cat_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = categories.find((c) => c.id === editingId);
    const record: Category = {
      id,
      name: name.trim().slice(0, 80),
      slug: slug.trim().toLowerCase().slice(0, 100),
      description: description.trim().slice(0, 400),
      image: image.slice(0, 1500),
      order: existing?.order || categories.length + 1,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    await onUpsert(record);
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white p-5 rounded-sm fk-card-shadow">
          <h1 className="text-xl font-bold text-[#212121]">
            Categories &amp; Collections ({categories.length})
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 bg-white rounded-sm fk-card-shadow flex gap-3 items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={getOptimizedImageUrl(cat.image, 160)}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover bg-[#F8F9FA] rounded-sm border border-[#E0E0E0] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#212121] truncate">{cat.name}</p>
                  <p className="text-xs font-mono-tabular text-[#2874F0] truncate">
                    /collections/{cat.slug}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectEdit(cat)}
                  className="px-2.5 py-1 bg-[#2874F0] text-white text-xs font-bold rounded-sm cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(cat.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSaveCategory}
        className="lg:col-span-5 bg-white rounded-sm fk-card-shadow p-6 space-y-4 self-start"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#212121]">
            {editingId ? 'Edit Category' : 'Add Category Vertical'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName('');
                setSlug('');
                setDescription('');
              }}
              className="text-xs text-[#2874F0] font-bold hover:underline cursor-pointer"
            >
              + Create New Instead
            </button>
          )}
        </div>
        <input
          required
          placeholder="Category Name (e.g. Shaving Essentials)"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!editingId) {
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            }
          }}
          className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
        />
        <input
          required
          placeholder="Slug (e.g. shaving-essentials)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
        />
        <textarea
          required
          rows={3}
          placeholder="Category Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-[#D6D3D1] rounded-sm p-3 text-xs"
        />
        <CloudinaryUploader
          label="Category Cover Image"
          currentUrl={image}
          onUploaded={({ url }) => setImage(url)}
        />
        <input
          placeholder="Or paste Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
        />
        <button
          type="submit"
          className="w-full py-3 bg-[#FB641B] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
        >
          {editingId ? 'Update Category' : 'Save Category'}
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
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-sm fk-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
            Fulfillment &amp; Courier Dispatch
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-[#212121]">
            Customer Orders ({filtered.length})
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search Order ID, name, phone..."
            className="bg-white border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-semibold"
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

      <div className="bg-white rounded-sm fk-card-shadow overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E0E0E0] bg-[#F5F7FA] uppercase text-[#878787]">
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Customer &amp; PIN</th>
              <th className="p-3.5">Current Status</th>
              <th className="p-3.5">Payment</th>
              <th className="p-3.5 text-right">Amount</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {filtered.map((ord) => (
              <tr key={ord.id} className="hover:bg-[#F9FAFC]">
                <td className="p-3.5 font-mono-tabular font-bold text-[#2874F0]">
                  {ord.id}
                </td>
                <td className="p-3.5 font-mono-tabular text-[#565656]">
                  {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="p-3.5">
                  <p className="font-bold text-[#212121]">{ord.customerName}</p>
                  <p className="text-[#878787] font-mono-tabular">
                    {ord.customerPhone} · PIN {ord.pinCode}
                  </p>
                </td>
                <td className="p-3.5 font-bold text-[#388E3C]">
                  {ORDER_STATUS_LABELS[ord.status]}
                </td>
                <td className="p-3.5 font-mono-tabular">
                  {ord.paymentMethod} · {ord.paymentStatus}
                </td>
                <td className="p-3.5 text-right font-mono-tabular font-bold text-[#212121]">
                  ₹{ord.totalAmount.toLocaleString('en-IN')}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectOrder(ord.id)}
                    className="px-3.5 py-1.5 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
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
  onOrderUpdated: () => void;
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ orderId, orders, adminName, onBack, onOrderUpdated, showToast }) => {
  const order = orders.find((o) => o.id === orderId);
  const [events, setEvents] = useState<OrderEvent[]>(() => getLocalOrderEvents(orderId));

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
  const [locationNote, setLocationNote] = useState('Cartlane Fulfillment Hub');
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
    setEvents(getLocalOrderEvents(orderId));

    const unsubFs = onSnapshot(
      collection(db, 'orders', orderId, 'events'),
      (snap) => {
        if (!snap.empty) {
          setEvents(snap.docs.map((d) => d.data() as OrderEvent));
        }
      },
      () => {}
    );
    const unsubRtdb = onValue(
      rtdbRef(rtdb, `order_events/${orderId}`),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, OrderEvent>;
          setEvents(Object.values(val));
        }
      },
      () => {}
    );
    return () => {
      unsubFs();
      unsubRtdb();
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="space-y-4 bg-white p-6 rounded-sm fk-card-shadow">
        <button type="button" onClick={onBack} className="text-[#2874F0] font-bold text-xs">
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

      setEvents(getLocalOrderEvents(order.id));
      onOrderUpdated();
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
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-sm fk-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 border border-[#D6D3D1] rounded-sm bg-white flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
              Order Fulfillment &amp; Audit Controller
            </p>
            <h1 className="text-xl font-bold text-[#212121]">
              Order #{order.id}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#2874F0] text-[#2874F0] text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Packing Slip</span>
        </button>
      </div>

      {/* Admin Status & Courier Dispatch Form */}
      <form
        onSubmit={handleUpdateOrder}
        className="bg-white rounded-sm fk-card-shadow p-6 space-y-5"
      >
        <h2 className="text-base font-bold text-[#212121]">
          Update Order Status &amp; Courier Tracking
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Current Stage: {ORDER_STATUS_LABELS[order.status]} → Next Stage
            </label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs bg-white font-bold"
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
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value as Order['paymentStatus'])
              }
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs bg-white"
            >
              <option value="PENDING">PENDING (COD Uncollected)</option>
              <option value="PAID">PAID (Collected on Delivery)</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Estimated Delivery Date
            </label>
            <input
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="e.g. Thu, 29 Oct 2026"
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Courier Partner Name
            </label>
            <input
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="e.g. Ekart Logistics / BlueDart"
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              AWB / Tracking ID
            </label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. EKART892341092IN"
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              External Tracking URL (Optional)
            </label>
            <input
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Scan Location / Hub
            </label>
            <input
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Tracking Update Note
            </label>
            <input
              value={eventMessage}
              onChange={(e) => setEventMessage(e.target.value)}
              placeholder="e.g. Package packed and handed over to Ekart courier partner."
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#FB641B] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
        >
          {saving ? 'Saving Update...' : 'Save Order Update & Sync'}
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
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-sm fk-card-shadow">
        <p className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
          Customer Directory
        </p>
        <h1 className="text-xl md:text-2xl font-bold text-[#212121]">
          Registered Customers ({customers.length})
        </h1>
      </div>

      <div className="bg-white rounded-sm fk-card-shadow overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E0E0E0] bg-[#F5F7FA] uppercase text-[#878787]">
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Phone</th>
              <th className="p-3.5">Registered</th>
              <th className="p-3.5 text-right">Orders Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {customers.map((c) => {
              const userOrderCount = orders.filter((o) => o.uid === c.uid).length;
              return (
                <tr key={c.uid} className="hover:bg-[#F9FAFC]">
                  <td className="p-3.5 font-bold text-[#212121]">
                    {c.displayName}
                  </td>
                  <td className="p-3.5 font-mono-tabular text-[#565656]">{c.email}</td>
                  <td className="p-3.5 font-mono-tabular text-[#565656]">
                    {c.phone || '—'}
                  </td>
                  <td className="p-3.5 font-mono-tabular text-[#878787]">
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right font-mono-tabular font-bold text-[#2874F0]">
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
 * 7. ADMIN BANNERS & FRONT POSTER SECTION (ADD / EDIT / DELETE / RESTORE)
 * ==========================================================================*/
const AdminBannersSection: React.FC<{
  banners: Banner[];
  onUpsert: (banner: Banner) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  showToast: (t: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ banners, onUpsert, onRemove, showToast }) => {
  const [editingBanner, setEditingBanner] = useState<Banner>(
    banners[0] || {
      id: 'banner_hero_poster_main',
      title: 'Up To 50% Off Best Skincare & Grooming Products',
      subtitle:
        'Upgrade your daily grooming ritual with Cartlane luxury Charcoal Face Wash, Vitamin C Serum, Beard Growth Oil & Gift Kits.',
      ctaText: 'Shop Up To 50% Off',
      ctaLink: '/products',
      image: UPLOADED_FRONT_POSTER,
      placement: 'hero',
      active: true,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const handleCreateNewBanner = () => {
    const now = new Date().toISOString();
    setEditingBanner({
      id: `banner_${Date.now()}`,
      title: 'New Promotional Offer Banner',
      subtitle: 'Flat 40% Off across all Men Grooming & Fragrance Combos',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      image: UPLOADED_FRONT_POSTER,
      placement: 'hero',
      active: true,
      order: banners.length,
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleUseUploadedPoster = async () => {
    const now = new Date().toISOString();
    const posterBanner: Banner = {
      id: 'banner_hero_poster_main',
      title: 'Up To 50% Off Best Skincare & Grooming Products',
      subtitle:
        'Upgrade your daily grooming ritual with Cartlane luxury Charcoal Face Wash, Vitamin C Serum, Beard Growth Oil & Gift Kits.',
      ctaText: 'Shop Up To 50% Off',
      ctaLink: '/products',
      image: UPLOADED_FRONT_POSTER,
      placement: 'hero',
      active: true,
      order: 0,
      createdAt: now,
      updatedAt: now,
    };
    setEditingBanner(posterBanner);
    await onUpsert(posterBanner);
  };

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
      order: Number(editingBanner.order) || 0,
      updatedAt: now,
    };
    await onUpsert(record);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white p-5 rounded-sm fk-card-shadow flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#212121]">
              Front Hero &amp; Promo Banners ({banners.length})
            </h1>
            <p className="text-xs text-[#878787]">
              Order 0 appears first on the storefront homepage.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUseUploadedPoster}
              className="px-3 py-2 bg-[#388E3C] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
            >
              Set Uploaded Poster #1
            </button>
            <button
              type="button"
              onClick={handleCreateNewBanner}
              className="px-3 py-2 bg-[#FB641B] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Banner</span>
            </button>
          </div>
        </div>

        {banners.map((b) => (
          <div
            key={b.id}
            onClick={() => setEditingBanner(b)}
            className={`cursor-pointer p-4 border rounded-sm bg-white fk-card-shadow flex gap-4 items-center justify-between ${
              editingBanner.id === b.id
                ? 'border-[#2874F0] ring-1 ring-[#2874F0]'
                : 'border-[#E0E0E0]'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={getOptimizedImageUrl(b.image, 240)}
                alt={b.title}
                referrerPolicy="no-referrer"
                className="w-28 h-16 object-contain bg-[#09358A] rounded-sm shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
                  {b.placement} · Order #{b.order} · {b.active ? 'Active' : 'Hidden'}
                </p>
                <p className="text-sm font-bold text-[#212121] truncate">{b.title}</p>
                <p className="text-xs text-[#878787] truncate">{b.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(b.id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-sm shrink-0 cursor-pointer"
              title="Delete Banner"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSaveBanner}
        className="lg:col-span-6 bg-white rounded-sm fk-card-shadow p-6 space-y-4 self-start"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#212121]">
            Edit Banner ({editingBanner.id})
          </h2>
          <label className="flex items-center gap-2 text-xs font-bold text-[#212121] cursor-pointer">
            <input
              type="checkbox"
              checked={editingBanner.active}
              onChange={(e) =>
                setEditingBanner({ ...editingBanner, active: e.target.checked })
              }
            />
            <span>Active on Homepage</span>
          </label>
        </div>

        <div className="rounded-sm overflow-hidden border border-[#E0E0E0] bg-[#09358A]">
          <img
            src={editingBanner.image || UPLOADED_FRONT_POSTER}
            alt={editingBanner.title}
            referrerPolicy="no-referrer"
            className="w-full aspect-16/9 object-contain"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Placement</label>
            <select
              value={editingBanner.placement}
              onChange={(e) =>
                setEditingBanner({
                  ...editingBanner,
                  placement: e.target.value as 'hero' | 'promo',
                })
              }
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs bg-white font-semibold"
            >
              <option value="hero">Front Hero Carousel</option>
              <option value="promo">Mid-Page Promo Tile</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              Slide Order (0 = First)
            </label>
            <input
              type="number"
              value={editingBanner.order}
              onChange={(e) =>
                setEditingBanner({
                  ...editingBanner,
                  order: Number(e.target.value),
                })
              }
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Headline *</label>
          <input
            required
            value={editingBanner.title}
            onChange={(e) =>
              setEditingBanner({ ...editingBanner, title: e.target.value })
            }
            className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Subtitle *</label>
          <textarea
            required
            rows={2}
            value={editingBanner.subtitle}
            onChange={(e) =>
              setEditingBanner({ ...editingBanner, subtitle: e.target.value })
            }
            className="w-full border border-[#D6D3D1] rounded-sm p-3 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">CTA Label</label>
            <input
              required
              value={editingBanner.ctaText}
              onChange={(e) =>
                setEditingBanner({ ...editingBanner, ctaText: e.target.value })
              }
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">CTA Route</label>
            <input
              required
              value={editingBanner.ctaLink}
              onChange={(e) =>
                setEditingBanner({ ...editingBanner, ctaLink: e.target.value })
              }
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">
            Banner Image Path or URL *
          </label>
          <div className="flex gap-2">
            <input
              required
              value={editingBanner.image}
              onChange={(e) =>
                setEditingBanner({ ...editingBanner, image: e.target.value })
              }
              className="flex-1 border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
            <button
              type="button"
              onClick={() => {
                setEditingBanner({
                  ...editingBanner,
                  image: UPLOADED_FRONT_POSTER,
                });
                showToast('Selected uploaded skincare poster image.');
              }}
              className="px-3 py-2 bg-[#2874F0] text-white text-xs font-bold rounded-sm shrink-0 cursor-pointer"
            >
              Use Poster
            </button>
          </div>
        </div>

        <CloudinaryUploader
          label="Or Upload New Banner Image (Cloudinary)"
          currentUrl={editingBanner.image}
          currentPublicId={editingBanner.publicId}
          onUploaded={({ url, publicId }) =>
            setEditingBanner({ ...editingBanner, image: url, publicId })
          }
        />

        <button
          type="submit"
          className="w-full py-3 bg-[#FB641B] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
        >
          Save Banner to Storefront
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 8. ADMIN COUPONS SECTION (CREATE / TOGGLE / DELETE)
 * ==========================================================================*/
const AdminCouponsSection: React.FC<{
  coupons: Coupon[];
  onUpsert: (coupon: Coupon) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}> = ({ coupons, onUpsert, onRemove }) => {
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
    await onUpsert(record);
    setCode('');
    setDescription('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white p-5 rounded-sm fk-card-shadow">
          <h1 className="text-xl font-bold text-[#212121]">
            Promotional Coupons ({coupons.length})
          </h1>
        </div>
        <div className="space-y-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-white rounded-sm fk-card-shadow flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-mono-tabular font-bold text-sm text-[#212121]">
                  {c.code} (
                  {c.discountType === 'percentage'
                    ? `${c.discountValue}% OFF`
                    : `₹${c.discountValue} OFF`}
                  )
                </p>
                <p className="text-xs text-[#565656]">{c.description}</p>
                <p className="text-[11px] font-mono-tabular text-[#878787] mt-1">
                  Min Order: ₹{c.minOrderAmount} · Redeemed: {c.usedCount}/{c.usageLimit}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onUpsert({
                      ...c,
                      active: !c.active,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className={`px-2.5 py-1 text-xs font-bold uppercase rounded-sm cursor-pointer ${
                    c.active
                      ? 'bg-[#E8F5E9] text-[#388E3C]'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {c.active ? 'Active' : 'Paused'}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(c.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleCreateCoupon}
        className="lg:col-span-5 bg-white rounded-sm fk-card-shadow p-6 space-y-4 self-start"
      >
        <h2 className="text-lg font-bold text-[#212121]">
          Create New Coupon
        </h2>
        <input
          required
          placeholder="Coupon Code (e.g. CARTLANE25)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular uppercase"
        />
        <input
          required
          placeholder="Description (e.g. Extra 25% off on orders above ₹1,299)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as 'percentage' | 'fixed')
            }
            className="border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs bg-white"
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
            className="border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] uppercase text-[#878787] font-bold">
              Min Order ₹
            </label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(Number(e.target.value))}
              className="w-full border border-[#D6D3D1] rounded-sm px-2 py-1.5 text-xs font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-[#878787] font-bold">
              Max Cap ₹
            </label>
            <input
              type="number"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
              className="w-full border border-[#D6D3D1] rounded-sm px-2 py-1.5 text-xs font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-[#878787] font-bold">
              Usage Limit
            </label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
              className="w-full border border-[#D6D3D1] rounded-sm px-2 py-1.5 text-xs font-mono-tabular"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#212121] mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[#FB641B] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
        >
          Save Coupon
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 9. ADMIN REVIEWS MODERATION SECTION (ADD / DELETE)
 * ==========================================================================*/
const AdminReviewsSection: React.FC<{
  reviews: Review[];
  products: Product[];
  onUpsert: (review: Review) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}> = ({ reviews, products, onUpsert, onRemove }) => {
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !title.trim() || !comment.trim()) return;
    const record: Review = {
      id: `rev_${Date.now()}`,
      productId: productId || products[0]?.id || 'prod_blanc_edp',
      uid: 'admin_verified',
      authorName: authorName.trim(),
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };
    await onUpsert(record);
    setAuthorName('');
    setTitle('');
    setComment('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white p-5 rounded-sm fk-card-shadow">
          <h1 className="text-xl font-bold text-[#212121]">
            Customer Reviews ({reviews.length})
          </h1>
        </div>
        <div className="space-y-3">
          {reviews.map((rev) => {
            const prod = products.find((p) => p.id === rev.productId);
            return (
              <div
                key={rev.id}
                className="p-5 bg-white rounded-sm fk-card-shadow flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-mono-tabular text-[#388E3C] font-bold">
                    {rev.rating} ★ · {rev.authorName} on {prod?.name || rev.productId}
                  </p>
                  <p className="text-sm font-bold text-[#212121]">{rev.title}</p>
                  <p className="text-xs text-[#565656]">{rev.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(rev.id)}
                  className="text-xs text-red-600 font-bold hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleAddReview}
        className="lg:col-span-5 bg-white rounded-sm fk-card-shadow p-6 space-y-4 self-start"
      >
        <h2 className="text-lg font-bold text-[#212121]">
          Add Verified Review
        </h2>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs bg-white"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="Customer Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
          />
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs bg-white font-bold"
          >
            <option value={5}>5 ★ (Excellent)</option>
            <option value={4}>4 ★ (Good)</option>
            <option value={3}>3 ★ (Average)</option>
          </select>
        </div>
        <input
          required
          placeholder="Review Headline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
        />
        <textarea
          required
          rows={3}
          placeholder="Review Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border border-[#D6D3D1] rounded-sm p-3 text-xs"
        />
        <button
          type="submit"
          className="w-full py-3 bg-[#FB641B] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
        >
          Publish Review
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 10. ADMIN STORE CUSTOMIZATION, SHIPPING & FIREBASE CONFIG SETTINGS
 * ==========================================================================*/
const AdminSettingsSection: React.FC<{
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
}> = ({ settings, onSave }) => {
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
      await onSave(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form
        onSubmit={handleSave}
        className="lg:col-span-7 bg-white rounded-sm fk-card-shadow p-6 space-y-5"
      >
        <div className="border-b border-[#F0F0F0] pb-4">
          <p className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
            Live Storefront Configuration
          </p>
          <h1 className="text-xl font-bold text-[#212121]">
            Brand Identity, Announcement &amp; Shipping Rules
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Brand Name
            </label>
            <input
              required
              value={formState.brandName}
              onChange={(e) =>
                setFormState({ ...formState, brandName: e.target.value })
              }
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
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
            <label htmlFor="ann-enabled" className="text-xs font-bold">
              Enable Top Announcement Bar
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#212121] mb-1">
            Top Announcement Bar Text
          </label>
          <input
            required
            value={formState.announcementText}
            onChange={(e) =>
              setFormState({ ...formState, announcementText: e.target.value })
            }
            className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F0F0F0]">
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Free Shipping Above (₹)
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
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
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
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Return Window (Days)
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
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
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
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs"
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
            <label htmlFor="cod-toggle" className="text-xs font-bold">
              Enable Cash on Delivery (COD)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F0F0F0]">
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Support Email
            </label>
            <input
              required
              value={formState.supportEmail}
              onChange={(e) =>
                setFormState({ ...formState, supportEmail: e.target.value })
              }
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">
              Support Phone
            </label>
            <input
              required
              value={formState.supportPhone}
              onChange={(e) =>
                setFormState({ ...formState, supportPhone: e.target.value })
              }
              className="w-full border border-[#D6D3D1] rounded-sm px-3 py-2 text-xs font-mono-tabular"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#FB641B] text-white text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
        >
          {saving ? 'Saving Settings...' : 'Save Storefront & Shipping Settings'}
        </button>
      </form>

      {/* Right: Integrated Firebase Config Details */}
      <div className="lg:col-span-5 bg-white rounded-sm fk-card-shadow p-6 space-y-4 self-start">
        <div className="flex items-center gap-2 text-[#2874F0]">
          <Database className="w-5 h-5" />
          <h2 className="text-base font-bold text-[#212121]">
            Integrated Firebase Configuration
          </h2>
        </div>
        <p className="text-xs text-[#565656] leading-relaxed">
          Your Firebase project and Realtime Database are actively integrated with Cartlane Storefront and Seller Hub Admin Panel:
        </p>

        <div className="bg-[#172337] text-[#E0E0E0] p-4 rounded-sm font-mono-tabular text-[11px] space-y-1.5 overflow-x-auto">
          <p className="text-[#FFE500] font-bold">Active Firebase Config</p>
          <p>projectId: &quot;{USER_FIREBASE_CONFIG.projectId}&quot;</p>
          <p>authDomain: &quot;{USER_FIREBASE_CONFIG.authDomain}&quot;</p>
          <p>databaseURL: &quot;{USER_FIREBASE_CONFIG.databaseURL}&quot;</p>
          <p>storageBucket: &quot;{USER_FIREBASE_CONFIG.storageBucket}&quot;</p>
          <p>messagingSenderId: &quot;{USER_FIREBASE_CONFIG.messagingSenderId}&quot;</p>
          <p>appId: &quot;{USER_FIREBASE_CONFIG.appId}&quot;</p>
        </div>

        <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] rounded-sm text-xs text-[#2E7D32] font-semibold">
          ✓ All Admin product edits, stock updates, categories, banners, coupons, reviews, and orders sync automatically.
        </div>
      </div>
    </div>
  );
};

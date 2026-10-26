import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  Search,
  Shield,
  Tag,
  Trash2,
  Truck,
  User as UserIcon,
  XCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderTimeline } from '../components/OrderTimeline';
import { db, handleFirestoreError } from '../lib/firebase';
import { updateOrderStatusWithEvent } from '../lib/orders';
import {
  OperationType,
  Order,
  OrderEvent,
  ORDER_STATUS_LABELS,
} from '../types';
import { getOptimizedImageUrl } from '../lib/cloudinary';

export const LoginPage: React.FC = () => {
  const { user, isAdmin, loginWithGoogle } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/account');
    }
  }, [user, isAdmin]);

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-6 pb-24 md:py-14">
      <div className="grid grid-cols-1 md:grid-cols-12 border border-[#E0E0E0] bg-white rounded-xs overflow-hidden shadow-md">
        {/* Left: Iconic Flipkart Blue Login Sidebar */}
        <div className="md:col-span-5 bg-[#2874F0] text-white p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Login
            </h1>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Get access to your Orders, Wishlist, Saved Addresses, and exclusive Cartlane privilege coupons.
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-white/20 text-xs text-white/95">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FFE500] shrink-0" />
              <span>Extra 15% OFF with code ROYAL15</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FFE500] shrink-0" />
              <span>Live Order &amp; Courier Hub Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#FFE500] shrink-0" />
              <span>Synced Cart &amp; Wishlist across devices</span>
            </div>
          </div>
        </div>

        {/* Right: Sign-In Action */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8 bg-white">
          <div className="space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#2874F0]">
              Cartlane Verified Account
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#212121]">
              Continue with Google Authentication
            </h2>
            <p className="text-xs text-[#878787] leading-relaxed">
              By continuing, you agree to Cartlane&apos;s{' '}
              <Link to="/policies/terms" className="text-[#2874F0] hover:underline">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link to="/policies/privacy" className="text-[#2874F0] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-3.5 bg-[#FB641B] hover:bg-[#E85812] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xs shadow-sm transition-colors"
            >
              Sign In with Google
            </button>
          </div>

          <div className="pt-4 border-t border-[#F0F0F0] flex items-center justify-between text-xs font-bold text-[#2874F0]">
            <Link to="/track-order" className="hover:underline">
              Track an Existing Order →
            </Link>
            <Link to="/products" className="hover:underline">
              Browse Store →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export const AccountDashboardPage: React.FC = () => {
  const {
    user,
    userProfile,
    isAdmin,
    addresses,
    myOrders,
    wishlistIds,
    loginWithGoogle,
    logout,
    updateCustomerProfile,
    saveCustomerAddress,
    deleteCustomerAddress,
  } = useStore();
  const location = useLocation();

  const initialTab = location.pathname.includes('/addresses')
    ? 'addresses'
    : location.pathname.includes('/profile')
    ? 'profile'
    : 'orders';

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>(
    initialTab
  );

  useEffect(() => {
    if (location.pathname.includes('/addresses')) setActiveTab('addresses');
    else if (location.pathname.includes('/profile')) setActiveTab('profile');
    else setActiveTab('orders');
  }, [location.pathname]);

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');

  const [addrForm, setAddrForm] = useState({
    fullName: '',
    phone: '',
    house: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    landmark: '',
    isDefault: false,
  });

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  if (!user) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white border border-[#E0E0E0] rounded-xs space-y-4 shadow-2xs">
          <h1 className="text-2xl font-extrabold text-[#212121]">
            Login to view your Account
          </h1>
          <p className="text-xs text-[#878787]">
            Sign in with your Google account to manage orders, addresses, and profile settings.
          </p>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="px-8 py-3 bg-[#FB641B] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs"
          >
            Login with Google
          </button>
        </div>
      </main>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCustomerProfile(displayName, phone);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(addrForm.pinCode)) return;
    await saveCustomerAddress({
      ...addrForm,
      email: user.email || '',
    });
    setAddrForm({
      fullName: '',
      phone: '',
      house: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
      landmark: '',
      isDefault: false,
    });
  };

  return (
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-24 md:py-6 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: FLIPKART ACCOUNT SIDEBAR */}
        <aside className="lg:col-span-3 space-y-3">
          {/* Hello User Card */}
          <div className="p-4 bg-white border border-[#E0E0E0] rounded-xs flex items-center gap-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#2874F0] text-white font-extrabold text-lg flex items-center justify-center shrink-0">
              {(userProfile?.displayName || user.displayName || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#878787]">Hello,</p>
              <p className="text-sm font-extrabold text-[#212121] truncate">
                {userProfile?.displayName || user.displayName}
              </p>
              <p className="text-[11px] text-[#878787] truncate">{user.email}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white border border-[#E0E0E0] rounded-xs divide-y divide-[#F0F0F0] shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full p-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#E3F2FD]/50 text-[#2874F0]'
                  : 'text-[#212121] hover:bg-[#F8F9FA]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-[#2874F0]" />
                <span>My Orders ({myOrders.length})</span>
              </span>
              <span>›</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              className={`w-full p-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-[#E3F2FD]/50 text-[#2874F0]'
                  : 'text-[#212121] hover:bg-[#F8F9FA]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#2874F0]" />
                <span>Manage Addresses ({addresses.length})</span>
              </span>
              <span>›</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full p-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider transition-colors ${
                activeTab === 'profile'
                  ? 'bg-[#E3F2FD]/50 text-[#2874F0]'
                  : 'text-[#212121] hover:bg-[#F8F9FA]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <UserIcon className="w-4 h-4 text-[#2874F0]" />
                <span>Profile Information</span>
              </span>
              <span>›</span>
            </button>

            <Link
              to="/wishlist"
              className="w-full p-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#212121] hover:bg-[#F8F9FA]"
            >
              <span className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#FF4343]" />
                <span>My Wishlist ({wishlistIds.length})</span>
              </span>
              <span>›</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="w-full p-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#388E3C] bg-[#E8F5E9]/40 hover:bg-[#E8F5E9]"
              >
                <span className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#388E3C]" />
                  <span>Admin Seller Console</span>
                </span>
                <span>›</span>
              </Link>
            )}

            <button
              type="button"
              onClick={logout}
              className="w-full p-4 flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: ACTIVE TAB CONTENT */}
        <div className="lg:col-span-9 space-y-3">
          {/* Tab 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="p-4 bg-white border border-[#E0E0E0] rounded-xs flex items-center justify-between shadow-2xs">
                <h1 className="text-base sm:text-lg font-extrabold text-[#212121]">
                  My Orders ({myOrders.length})
                </h1>
                <Link
                  to="/track-order"
                  className="text-xs font-bold text-[#2874F0] hover:underline"
                >
                  Lookup by Order ID →
                </Link>
              </div>

              {myOrders.length === 0 ? (
                <div className="p-12 bg-white border border-[#E0E0E0] rounded-xs text-center space-y-3 shadow-2xs">
                  <p className="text-lg font-extrabold text-[#212121]">
                    You have no orders yet!
                  </p>
                  <Link
                    to="/products"
                    className="inline-block px-6 py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase rounded-xs"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                myOrders.map((ord) => (
                  <Link
                    key={ord.id}
                    to={`/account/orders/${ord.id}`}
                    className="block p-4 sm:p-5 bg-white border border-[#E0E0E0] hover:shadow-md rounded-xs transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {ord.items[0]?.image && (
                          <img
                            src={getOptimizedImageUrl(ord.items[0].image, 120)}
                            alt={ord.items[0].name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 object-contain border border-[#F0F0F0] p-1 shrink-0"
                          />
                        )}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular">
                            <span className="font-extrabold text-[#2874F0]">{ord.id}</span>
                            <span>·</span>
                            <span className="text-[#878787]">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-[#212121]">
                            {ord.items
                              .map((i) => `${i.name} (${i.variantLabel}) × ${i.quantity}`)
                              .join(', ')}
                          </p>
                          <p className="text-xs text-[#878787]">
                            Deliver to: {ord.shippingAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#F0F0F0]">
                        <div className="font-mono-tabular">
                          <p className="text-sm sm:text-base font-extrabold text-[#212121]">
                            ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-[#878787]">
                            {ord.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 bg-[#E8F5E9] text-[#388E3C] text-xs font-extrabold rounded-xs">
                            {ORDER_STATUS_LABELS[ord.status]}
                          </span>
                          <p className="text-[11px] text-[#2874F0] font-bold mt-1">
                            Track Order →
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white border border-[#E0E0E0] rounded-xs p-5 sm:p-6 space-y-6 shadow-2xs">
              <h2 className="text-lg font-extrabold text-[#212121] border-b border-[#F0F0F0] pb-3">
                Manage Addresses
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-3">
                  {addresses.length === 0 ? (
                    <p className="text-xs text-[#878787]">No saved addresses yet.</p>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 border border-[#E0E0E0] rounded-xs flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1 text-xs">
                          <p className="font-extrabold text-[#212121]">
                            {addr.fullName} &nbsp; {addr.phone}
                          </p>
                          <p className="text-[#555555]">
                            {addr.house}, {addr.street}, {addr.city}, {addr.state} -{' '}
                            <strong>{addr.pinCode}</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteCustomerAddress(addr.id)}
                          className="text-xs text-red-600 hover:underline shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={handleAddAddress}
                  className="lg:col-span-5 p-4 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xs space-y-3"
                >
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2874F0]">
                    + Add a New Address
                  </h3>
                  <input
                    required
                    placeholder="Full Name"
                    value={addrForm.fullName}
                    onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                    className="w-full bg-white border border-[#D0D0D0] px-3 py-2 text-xs rounded-xs"
                  />
                  <input
                    required
                    placeholder="10-Digit Mobile Number"
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                    className="w-full bg-white border border-[#D0D0D0] px-3 py-2 text-xs font-mono-tabular rounded-xs"
                  />
                  <input
                    required
                    placeholder="Flat / House / Building"
                    value={addrForm.house}
                    onChange={(e) => setAddrForm({ ...addrForm, house: e.target.value })}
                    className="w-full bg-white border border-[#D0D0D0] px-3 py-2 text-xs rounded-xs"
                  />
                  <input
                    required
                    placeholder="Area / Street / Locality"
                    value={addrForm.street}
                    onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                    className="w-full bg-white border border-[#D0D0D0] px-3 py-2 text-xs rounded-xs"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      required
                      placeholder="City"
                      value={addrForm.city}
                      onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                      className="bg-white border border-[#D0D0D0] px-2.5 py-2 text-xs rounded-xs"
                    />
                    <input
                      required
                      placeholder="State"
                      value={addrForm.state}
                      onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                      className="bg-white border border-[#D0D0D0] px-2.5 py-2 text-xs rounded-xs"
                    />
                    <input
                      required
                      maxLength={6}
                      placeholder="Pincode"
                      value={addrForm.pinCode}
                      onChange={(e) =>
                        setAddrForm({
                          ...addrForm,
                          pinCode: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      className="bg-white border border-[#D0D0D0] px-2.5 py-2 text-xs font-mono-tabular rounded-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-xs"
                  >
                    Save Address
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 3: Profile */}
          {activeTab === 'profile' && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white border border-[#E0E0E0] rounded-xs p-5 sm:p-6 space-y-4 shadow-2xs max-w-lg"
            >
              <h2 className="text-lg font-extrabold text-[#212121] border-b border-[#F0F0F0] pb-3">
                Personal Information
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[#878787] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border border-[#D0D0D0] px-3 py-2 text-xs rounded-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#878787] mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full border border-[#D0D0D0] px-3 py-2 text-xs font-mono-tabular rounded-xs"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-xs"
              >
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, userProfile, isAdmin, showToast } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (!orderId || !user) {
      setLoading(false);
      return;
    }

    const orderRef = doc(db, 'orders', orderId);
    const unsubOrder = onSnapshot(
      orderRef,
      (snap) => {
        if (snap.exists()) {
          setOrder(snap.data() as Order);
        } else {
          setOrder(null);
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.GET, `orders/${orderId}`);
      }
    );

    const eventsRef = collection(db, 'orders', orderId, 'events');
    const unsubEvents = onSnapshot(
      eventsRef,
      (snap) => {
        setEvents(snap.docs.map((d) => d.data() as OrderEvent));
      },
      (err) => {
        console.warn('Order events listener notice:', err.message);
      }
    );

    return () => {
      unsubOrder();
      unsubEvents();
    };
  }, [orderId, user]);

  if (loading) {
    return (
      <main className="max-w-[1440px] mx-auto px-6 py-20 text-center text-xs font-bold uppercase tracking-widest text-[#878787]">
        Loading Order &amp; Live Tracking Timeline...
      </main>
    );
  }

  if (!user || !order) {
    return (
      <main className="max-w-lg mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-[#212121]">
          Order Not Found or Access Restricted
        </h1>
        <p className="text-xs text-[#878787]">
          Only the authenticated order owner or an authorized Cartlane administrator can view this order.
        </p>
        <Link
          to="/account"
          className="inline-block px-6 py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase rounded-xs"
        >
          Back to My Orders
        </Link>
      </main>
    );
  }

  const canCancel = ['ORDER_PLACED', 'ORDER_CONFIRMED', 'PROCESSING'].includes(
    order.status
  );
  const canReturn = order.status === 'DELIVERED';

  const handleCustomerAction = async (targetStatus: 'CANCELLATION_REQUESTED' | 'RETURN_REQUESTED') => {
    setActionBusy(true);
    try {
      await updateOrderStatusWithEvent({
        order,
        newStatus: targetStatus,
        message:
          targetStatus === 'CANCELLATION_REQUESTED'
            ? 'Customer requested order cancellation prior to shipment dispatch.'
            : 'Customer requested a 7-day return pickup after delivery.',
        actorName: userProfile?.displayName || user.displayName || 'Customer',
        isAdminActor: isAdmin,
        location: 'Customer Account Portal',
      });
      showToast(
        targetStatus === 'CANCELLATION_REQUESTED'
          ? 'Cancellation request recorded.'
          : 'Return request recorded.'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed.', 'error');
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-24 md:py-6 space-y-4">
      {/* Header Card */}
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#878787]">
            <Link to="/account" className="hover:text-[#2874F0]">
              My Account
            </Link>
            <span>›</span>
            <Link to="/account/orders" className="hover:text-[#2874F0]">
              My Orders
            </Link>
            <span>›</span>
            <span className="font-mono-tabular text-[#212121]">{order.id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#212121] mt-1">
            Order #{order.id}
          </h1>
          <p className="text-xs text-[#878787] font-mono-tabular mt-0.5">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}{' '}
            · {order.paymentMethod} ({order.paymentStatus})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E0E0E0] bg-white text-xs font-bold uppercase text-[#2874F0] hover:border-[#2874F0] rounded-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Invoice</span>
          </button>

          {canCancel && (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => handleCustomerAction('CANCELLATION_REQUESTED')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-600 text-red-600 text-xs font-bold uppercase hover:bg-red-50 rounded-xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          {canReturn && (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => handleCustomerAction('RETURN_REQUESTED')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#2874F0] text-[#2874F0] text-xs font-bold uppercase hover:bg-[#E3F2FD]/30 rounded-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Flipkart-Style Timeline */}
      <OrderTimeline order={order} events={events} />

      {/* Order Items & Address Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white border border-[#E0E0E0] rounded-xs p-5 space-y-4 shadow-2xs">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#878787] border-b border-[#F0F0F0] pb-3">
            Ordered Items ({order.items.length})
          </h2>
          <div className="divide-y divide-[#F0F0F0]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={getOptimizedImageUrl(item.image, 160)}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-contain bg-white border border-[#F0F0F0] p-1"
                  />
                  <div>
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-sm font-bold text-[#212121] hover:text-[#2874F0]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#878787] font-mono-tabular">
                      Pack: {item.variantLabel} · Qty: {item.quantity} · SKU: {item.sku}
                    </p>
                  </div>
                </div>
                <span className="font-mono-tabular text-sm font-extrabold text-[#212121]">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-xs p-5 space-y-2 text-xs shadow-2xs">
            <h3 className="font-extrabold uppercase tracking-wider text-[#878787] pb-1">
              Delivery Address
            </h3>
            <p className="font-extrabold text-[#212121]">{order.customerName}</p>
            <p className="text-[#555555] leading-relaxed">{order.shippingAddress}</p>
            <p className="font-mono-tabular text-[#212121] font-semibold pt-1">
              Phone: {order.customerPhone}
            </p>
          </div>

          <div className="bg-white border border-[#E0E0E0] rounded-xs p-5 space-y-2.5 text-xs shadow-2xs">
            <h3 className="font-extrabold uppercase tracking-wider text-[#878787] pb-1">
              Price Breakup
            </h3>
            <div className="flex justify-between text-[#212121]">
              <span>Subtotal</span>
              <span className="font-mono-tabular">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-[#388E3C] font-semibold">
                <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span className="font-mono-tabular">
                  − ₹{order.discountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#212121]">
              <span>Shipping</span>
              <span className="font-mono-tabular text-[#388E3C] font-bold">
                {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#212121] pt-2.5 border-t border-dashed border-[#E0E0E0]">
              <span>Total Amount</span>
              <span className="font-mono-tabular">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export const TrackOrderLookupPage: React.FC = () => {
  const { user, myOrders, loginWithGoogle } = useStore();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const cleaned = orderIdInput.trim();
    if (!cleaned) return;
    if (!user) {
      setLookupError('Please sign in with Google so we can verify order ownership.');
      return;
    }
    try {
      const snap = await getDoc(doc(db, 'orders', cleaned));
      if (!snap.exists()) {
        setLookupError(`No order found matching ID "${cleaned}".`);
        return;
      }
      navigate(`/account/orders/${cleaned}`);
    } catch {
      setLookupError(
        `Unable to access Order "${cleaned}". Ensure the Order ID belongs to your signed-in account.`
      );
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-6 pb-24 md:py-12 space-y-6">
      <div className="bg-white border border-[#E0E0E0] rounded-xs p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider text-[#2874F0] font-extrabold">
            Flipkart-Style Real-Time Shipment Tracker
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212121]">
            Track Your Cartlane Order
          </h1>
          <p className="text-xs sm:text-sm text-[#878787]">
            Enter your Order ID (e.g., AV-...) to inspect live courier stages and delivery timestamps.
          </p>
        </div>

        <form onSubmit={handleLookup} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#878787] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter Order ID (e.g. AV-M7X89K-9B2A)"
                className="w-full border border-[#D0D0D0] pl-10 pr-4 py-3 text-xs font-mono-tabular uppercase rounded-xs focus:outline-none focus:border-[#2874F0]"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-[#FB641B] hover:bg-[#E85812] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors"
            >
              Track Order
            </button>
          </div>

          {lookupError && <p className="text-xs text-red-600 font-semibold">{lookupError}</p>}

          {!user && (
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#878787] border-t border-[#F0F0F0]">
              <span>Login to view and track your recent Cartlane orders automatically</span>
              <button
                type="button"
                onClick={loginWithGoogle}
                className="font-extrabold text-[#2874F0] hover:underline self-start sm:self-auto"
              >
                Login with Google →
              </button>
            </div>
          )}
        </form>
      </div>

      {user && myOrders.length > 0 && (
        <div className="bg-white border border-[#E0E0E0] rounded-xs p-5 sm:p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#212121]">
            Your Recent Orders
          </h2>
          <div className="divide-y divide-[#F0F0F0]">
            {myOrders.map((ord) => (
              <Link
                key={ord.id}
                to={`/account/orders/${ord.id}`}
                className="py-3.5 flex items-center justify-between hover:bg-[#F8F9FA] px-2 rounded-xs transition-colors"
              >
                <div>
                  <p className="text-xs font-mono-tabular font-extrabold text-[#2874F0]">
                    {ord.id} ·{' '}
                    <span className="text-[#388E3C]">{ORDER_STATUS_LABELS[ord.status]}</span>
                  </p>
                  <p className="text-xs text-[#212121] mt-0.5">
                    {ord.items.length} item(s) · ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#2874F0]">
                  View Timeline →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

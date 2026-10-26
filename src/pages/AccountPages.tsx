import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import {
  CheckCircle2,
  Heart,
  LogOut,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-24 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-12 border border-[#E5E0D8] bg-white overflow-hidden shadow-xs">
        {/* Left: Member Benefits Showcase */}
        <div className="md:col-span-6 bg-[#141413] text-[#FAF8F5] p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] font-semibold">
              Cartlane Gentlemen&apos;s Club
            </p>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-white leading-tight">
              Your Personal Grooming Concierge
            </h1>
            <p className="text-xs text-[#D6D3D1] leading-relaxed">
              Sign in with your Google account to unlock member-only privilege coupons, real-time Flipkart-style shipment tracking, and 1-tap address checkout.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#2C2A27] text-xs text-[#E5E0D8]">
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Instant access to ROYAL15 &amp; CHARCOAL20 member coupons</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Live chronological shipment &amp; courier hub tracking</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Cloud-synced wishlist and grooming bag across mobile &amp; desktop</span>
            </div>
          </div>
        </div>

        {/* Right: Sign-In Action */}
        <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-center space-y-6 bg-[#FAF8F5]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
              Verified Member Access
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#141413]">
              Sign In to Cartlane
            </h2>
            <p className="text-xs text-[#57534E] leading-relaxed">
              We use passwordless Google Authentication for bank-grade account security and instant verification.
            </p>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full py-4 bg-[#141413] hover:bg-[#8C6239] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            Continue with Google Sign-In
          </button>

          <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-[11px] text-[#78716C]">
            <Link to="/track-order" className="hover:text-[#141413] underline">
              Track an Existing Order
            </Link>
            <Link to="/policies/privacy" className="hover:text-[#141413] underline">
              Privacy &amp; Data Policy
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

  // Sync tab when URL route changes (/account, /account/orders, /account/addresses, /account/profile)
  useEffect(() => {
    if (location.pathname.includes('/addresses')) setActiveTab('addresses');
    else if (location.pathname.includes('/profile')) setActiveTab('profile');
    else setActiveTab('orders');
  }, [location.pathname]);

  // Profile form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');

  // New Address state
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
      <main className="max-w-lg mx-auto px-6 py-20 text-center space-y-5">
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Sign In to Your Cartlane Account
        </h1>
        <p className="text-xs text-[#57534E]">
          Please sign in with your Google account to view your profile, saved addresses, and order history.
        </p>
        <button
          type="button"
          onClick={loginWithGoogle}
          className="px-7 py-3.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
        >
          Sign In with Google
        </button>
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
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-24 md:py-12 space-y-8 sm:space-y-10">
      {/* Member Header */}
      <div className="border-b border-[#E5E0D8] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
            Cartlane Member Hub
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#141413]">
            Welcome, {userProfile?.displayName || user.displayName}
          </h1>
          <p className="text-xs font-mono-tabular text-[#78716C] mt-1">
            {user.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8C6239] text-white text-xs font-semibold uppercase tracking-wider"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#141413] text-[#141413] text-xs font-semibold uppercase tracking-wider hover:bg-[#F3EFEA]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Member KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-[#E5E0D8] space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[#78716C]">
            Total Orders
          </p>
          <p className="font-mono-tabular text-2xl font-bold text-[#141413]">
            {myOrders.length}
          </p>
        </div>
        <div className="p-4 bg-white border border-[#E5E0D8] space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[#78716C]">
            Saved Addresses
          </p>
          <p className="font-mono-tabular text-2xl font-bold text-[#141413]">
            {addresses.length}
          </p>
        </div>
        <Link
          to="/wishlist"
          className="p-4 bg-white border border-[#E5E0D8] hover:border-[#8C6239] space-y-1 transition-colors"
        >
          <p className="text-[10px] uppercase tracking-widest text-[#78716C]">
            Saved Wishlist
          </p>
          <p className="font-mono-tabular text-2xl font-bold text-[#8C6239]">
            {wishlistIds.length} Items →
          </p>
        </Link>
        <Link
          to="/offers"
          className="p-4 bg-[#141413] text-[#FAF8F5] space-y-1"
        >
          <p className="text-[10px] uppercase tracking-widest text-[#D4AF37]">
            Member Privilege Code
          </p>
          <p className="font-mono-tabular text-lg font-bold text-white">
            ROYAL15 (15% OFF)
          </p>
        </Link>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#E5E0D8] pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${
            activeTab === 'orders'
              ? 'bg-[#141413] text-white'
              : 'bg-[#F3EFEA] text-[#57534E] hover:text-[#141413]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Order History ({myOrders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${
            activeTab === 'addresses'
              ? 'bg-[#141413] text-white'
              : 'bg-[#F3EFEA] text-[#57534E] hover:text-[#141413]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${
            activeTab === 'profile'
              ? 'bg-[#141413] text-white'
              : 'bg-[#F3EFEA] text-[#57534E] hover:text-[#141413]'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="p-12 bg-[#F3EFEA] border border-[#E5E0D8] text-center space-y-3">
              <p className="font-serif-display text-2xl text-[#141413]">
                You have not placed any orders yet
              </p>
              <Link
                to="/products"
                className="inline-block px-6 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            myOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 sm:p-6 bg-white border border-[#E5E0D8] flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular">
                    <span className="font-bold text-[#141413]">{ord.id}</span>
                    <span>·</span>
                    <span className="text-[#78716C]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span className="px-2 py-0.5 bg-[#F3EFEA] font-semibold text-[#8C6239]">
                      {ORDER_STATUS_LABELS[ord.status]}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E]">
                    {ord.items.map((i) => `${i.name} (${i.variantLabel}) × ${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-[#78716C]">Delivering to: {ord.shippingAddress}</p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#ECE7DF]">
                  <div className="text-left md:text-right font-mono-tabular">
                    <p className="text-base font-bold text-[#141413]">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-[#78716C]">
                      {ord.paymentMethod} · {ord.paymentStatus}
                    </p>
                  </div>
                  <Link
                    to={`/account/orders/${ord.id}`}
                    className="px-4 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#8C6239] transition-colors whitespace-nowrap"
                  >
                    Track &amp; View →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
              Saved Shipping Addresses
            </h2>
            {addresses.length === 0 ? (
              <p className="text-xs text-[#57534E]">No saved shipping addresses yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 bg-white border border-[#E5E0D8] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-[#141413]">{addr.fullName}</p>
                      <p className="text-[#57534E]">
                        {addr.house}, {addr.street}
                      </p>
                      <p className="text-[#57534E]">
                        {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                      <p className="font-mono-tabular text-[#78716C] pt-1">
                        Phone: {addr.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCustomerAddress(addr.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-700 hover:underline self-start"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Address</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleAddAddress}
            className="lg:col-span-5 p-6 bg-[#F3EFEA] border border-[#E5E0D8] space-y-3"
          >
            <h3 className="font-serif-display text-xl font-bold text-[#141413]">
              Add New Address
            </h3>
            <input
              required
              placeholder="Recipient Full Name"
              value={addrForm.fullName}
              onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
              className="w-full bg-white border border-[#D6D3D1] px-3 py-2 text-xs"
            />
            <input
              required
              placeholder="10-Digit Mobile Number"
              value={addrForm.phone}
              onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
              className="w-full bg-white border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
            />
            <input
              required
              placeholder="House / Flat / Building"
              value={addrForm.house}
              onChange={(e) => setAddrForm({ ...addrForm, house: e.target.value })}
              className="w-full bg-white border border-[#D6D3D1] px-3 py-2 text-xs"
            />
            <input
              required
              placeholder="Street & Locality"
              value={addrForm.street}
              onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
              className="w-full bg-white border border-[#D6D3D1] px-3 py-2 text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                required
                placeholder="City"
                value={addrForm.city}
                onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                className="bg-white border border-[#D6D3D1] px-3 py-2 text-xs"
              />
              <input
                required
                placeholder="State"
                value={addrForm.state}
                onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                className="bg-white border border-[#D6D3D1] px-3 py-2 text-xs"
              />
              <input
                required
                maxLength={6}
                placeholder="PIN (6 digits)"
                value={addrForm.pinCode}
                onChange={(e) =>
                  setAddrForm({ ...addrForm, pinCode: e.target.value.replace(/\D/g, '') })
                }
                className="bg-white border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
            >
              Save Address
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Profile */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="max-w-md p-6 bg-white border border-[#E5E0D8] space-y-4"
        >
          <h2 className="font-serif-display text-2xl font-bold text-[#141413]">
            Update Personal Profile
          </h2>
          <div>
            <label className="block text-xs text-[#57534E] mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-[#57534E] mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full border border-[#D6D3D1] px-3 py-2 text-xs font-mono-tabular"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
          >
            Save Profile Changes
          </button>
        </form>
      )}
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
      <main className="max-w-[1440px] mx-auto px-6 py-20 text-center text-xs uppercase tracking-widest text-[#78716C]">
        Loading Order &amp; Chronological Tracking Log...
      </main>
    );
  }

  if (!user || !order) {
    return (
      <main className="max-w-lg mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="font-serif-display text-3xl font-bold text-[#141413]">
          Order Not Found or Access Restricted
        </h1>
        <p className="text-xs text-[#57534E]">
          For customer privacy, only the authenticated order owner or an authorized Cartlane administrator can view this order.
        </p>
        <Link
          to="/account"
          className="inline-block px-6 py-2.5 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest"
        >
          Back to My Account
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
    <main className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-24 md:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#78716C] font-mono-tabular">
            <Link to="/account" className="hover:text-[#141413] underline">
              My Orders
            </Link>
            <span>/</span>
            <span>{order.id}</span>
          </div>
          <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-[#141413] mt-1">
            Order #{order.id}
          </h1>
          <p className="text-xs text-[#57534E] font-mono-tabular mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}{' '}
            · {order.paymentMethod} ({order.paymentStatus})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D6D3D1] bg-white text-xs font-semibold uppercase tracking-wider text-[#141413] hover:border-[#141413]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Summary</span>
          </button>

          {canCancel && (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => handleCustomerAction('CANCELLATION_REQUESTED')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-800 text-red-800 text-xs font-semibold uppercase tracking-wider hover:bg-red-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Request Cancellation</span>
            </button>
          )}

          {canReturn && (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => handleCustomerAction('RETURN_REQUESTED')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#141413] text-[#141413] text-xs font-semibold uppercase tracking-wider hover:bg-[#F3EFEA]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Return</span>
            </button>
          )}
        </div>
      </div>

      {/* Flipkart-Style Timeline */}
      <OrderTimeline order={order} events={events} />

      {/* Order Items & Address Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-[#E5E0D8] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#141413] border-b border-[#ECE7DF] pb-3">
            Ordered Formulations ({order.items.length})
          </h2>
          <div className="divide-y divide-[#ECE7DF]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={getOptimizedImageUrl(item.image, 160)}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover bg-[#F3EFEA] border border-[#E5E0D8]"
                  />
                  <div>
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-sm font-semibold text-[#141413] hover:text-[#8C6239]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#78716C] font-mono-tabular">
                      Edition: {item.variantLabel} · Qty: {item.quantity} · SKU: {item.sku}
                    </p>
                  </div>
                </div>
                <span className="font-mono-tabular text-sm font-bold text-[#141413]">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F3EFEA] border border-[#E5E0D8] p-6 space-y-2 text-xs">
            <h3 className="font-semibold uppercase tracking-widest text-[#141413] pb-1">
              Delivery Destination
            </h3>
            <p className="font-bold text-[#141413]">{order.customerName}</p>
            <p className="text-[#57534E] leading-relaxed">{order.shippingAddress}</p>
            <p className="font-mono-tabular text-[#78716C] pt-1">
              Phone: {order.customerPhone} · Email: {order.customerEmail}
            </p>
          </div>

          <div className="bg-[#F3EFEA] border border-[#E5E0D8] p-6 space-y-2 text-xs">
            <h3 className="font-semibold uppercase tracking-widest text-[#141413] pb-1">
              Financial Summary
            </h3>
            <div className="flex justify-between text-[#57534E]">
              <span>Subtotal</span>
              <span className="font-mono-tabular">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span className="font-mono-tabular">
                  -₹{order.discountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#57534E]">
              <span>Shipping</span>
              <span className="font-mono-tabular">
                {order.shippingFee === 0 ? 'COMPLIMENTARY' : `₹${order.shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#141413] pt-2 border-t border-[#E5E0D8]">
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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-24 md:py-16 space-y-10">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-widest text-[#8C6239] font-semibold">
          Real-Time Order Lifecycle
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#141413]">
          Track Your Cartlane Order
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] max-w-xl mx-auto">
          Enter your Cartlane Order ID to inspect live fulfillment stages, warehouse quality checks, and courier hub timestamps.
        </p>
      </div>

      <form
        onSubmit={handleLookup}
        className="p-6 md:p-8 bg-white border border-[#E5E0D8] space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter Order ID (e.g. AV-M7X89K-9B2A)"
              className="w-full border border-[#D6D3D1] pl-10 pr-4 py-3 text-xs font-mono-tabular uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#141413] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#8C6239] transition-colors"
          >
            Track Shipment
          </button>
        </div>

        {lookupError && <p className="text-xs text-red-700">{lookupError}</p>}

        {!user && (
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#57534E] border-t border-[#ECE7DF]">
            <span>Sign in to view and track your recent Cartlane orders automatically</span>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="font-semibold text-[#141413] underline self-start sm:self-auto"
            >
              Sign In with Google →
            </button>
          </div>
        )}
      </form>

      {/* 4-Step Shipment Lifecycle Explainer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            step: '01',
            title: 'Order Confirmed',
            desc: 'Inventory reserved & verified in Firestore',
          },
          {
            step: '02',
            title: 'Quality Packed',
            desc: 'Sealed in tamper-evident Cartlane packaging',
          },
          {
            step: '03',
            title: 'In Transit',
            desc: 'Express dispatch via BlueDart / Delhivery',
          },
          {
            step: '04',
            title: 'Doorstep Delivery',
            desc: 'Pay via Cash or UPI upon parcel arrival',
          },
        ].map((item) => (
          <div
            key={item.step}
            className="p-4 bg-[#F3EFEA] border border-[#E5E0D8] space-y-1.5"
          >
            <span className="text-[11px] font-mono-tabular font-bold text-[#8C6239]">
              STAGE {item.step}
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141413]">
              {item.title}
            </h3>
            <p className="text-[11px] text-[#57534E] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {user && myOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#141413]">
            Your Recent Cartlane Orders
          </h2>
          <div className="space-y-3">
            {myOrders.map((ord) => (
              <Link
                key={ord.id}
                to={`/account/orders/${ord.id}`}
                className="p-4 bg-white border border-[#E5E0D8] hover:border-[#141413] flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="text-xs font-mono-tabular font-bold text-[#141413]">
                    {ord.id} · {ORDER_STATUS_LABELS[ord.status]}
                  </p>
                  <p className="text-xs text-[#57534E] mt-0.5">
                    {ord.items.length} item(s) · ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6239]">
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

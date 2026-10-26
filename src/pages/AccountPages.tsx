import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { get, onValue, ref as rtdbRef } from 'firebase/database';
import {
  Eye,
  EyeOff,
  Heart,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
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
import { db, rtdb } from '../lib/firebase';
import {
  getLocalOrderEvents,
  getLocalOrders,
  updateOrderStatusWithEvent,
} from '../lib/orders';
import {
  Order,
  OrderEvent,
  ORDER_STATUS_LABELS,
} from '../types';
import { getOptimizedImageUrl } from '../lib/cloudinary';

export const EmailAuthCard: React.FC<{
  onSuccess?: () => void;
  compact?: boolean;
}> = ({ onSuccess, compact = false }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email address and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      setErrorMsg('Please enter your full name to create an account.');
      return;
    }

    setBusy(true);
    try {
      const profile =
        mode === 'login'
          ? await loginWithEmail(email, password)
          : await registerWithEmail(email, password, fullName, phone);

      if (profile && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 bg-[#F1F3F6] p-1 rounded-xs border border-[#E0E0E0]">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg(null);
          }}
          className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
            mode === 'login'
              ? 'bg-[#2874F0] text-white shadow-xs'
              : 'text-[#555555] hover:text-[#212121]'
          }`}
        >
          Email Login
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMsg(null);
          }}
          className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
            mode === 'register'
              ? 'bg-[#2874F0] text-white shadow-xs'
              : 'text-[#555555] hover:text-[#212121]'
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'register' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-[#D0D0D0] focus:border-[#2874F0] rounded-xs pl-9 pr-3 py-2.5 text-xs text-[#212121] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full border border-[#D0D0D0] focus:border-[#2874F0] rounded-xs pl-9 pr-3 py-2.5 text-xs font-mono-tabular text-[#212121] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-[#D0D0D0] focus:border-[#2874F0] rounded-xs pl-9 pr-3 py-2.5 text-xs text-[#212121] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
            Password * (min 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === 'login'
                  ? 'Enter your password'
                  : 'Create a strong password (min 6 chars)'
              }
              className="w-full border border-[#D0D0D0] focus:border-[#2874F0] rounded-xs pl-9 pr-10 py-2.5 text-xs text-[#212121] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878787] hover:text-[#212121] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xs text-xs text-red-700 font-semibold">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3.5 bg-[#FB641B] hover:bg-[#E85812] disabled:opacity-60 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xs shadow-xs transition-colors cursor-pointer"
        >
          {busy
            ? mode === 'login'
              ? 'Signing In...'
              : 'Creating Account...'
            : mode === 'login'
            ? 'Login with Email & Password'
            : 'Create Cartlane Account'}
        </button>
      </form>

      <div className="relative flex items-center justify-center py-1">
        <div className="border-t border-[#E0E0E0] w-full" />
        <span className="bg-white px-3 text-[11px] font-bold uppercase text-[#878787]">
          OR
        </span>
        <div className="border-t border-[#E0E0E0] w-full" />
      </div>

      <button
        type="button"
        onClick={async () => {
          const p = await loginWithGoogle();
          if (p && onSuccess) onSuccess();
        }}
        className="w-full py-3 border border-[#2874F0] text-[#2874F0] hover:bg-[#E3F2FD]/40 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
      >
        Continue with Google Account
      </button>

      {!compact && (
        <p className="text-[11px] text-[#878787] leading-relaxed">
          New to Cartlane? If you sign in with a new email and password, your Cartlane account is automatically created and synced.
        </p>
      )}
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const { user, userProfile, isAdmin } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user || userProfile) {
      const email = (userProfile?.email || user?.email || '').toLowerCase();
      if (
        isAdmin ||
        email === 'admin@cartlane.in' ||
        email === 'singhshriyansh51@gmail.com'
      ) {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    }
  }, [user, userProfile, isAdmin, navigate]);

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-6 pb-24 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 border border-[#E0E0E0] bg-white rounded-xs overflow-hidden shadow-md">
        {/* Left: Iconic Flipkart Blue Login Sidebar */}
        <div className="md:col-span-5 bg-[#2874F0] text-white p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFE500]">
              Cartlane Official Store
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Login / Sign Up
            </h1>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Sign in with your Email &amp; Password or Google account to access your Orders, Wishlist, Saved Addresses, and exclusive Cartlane privilege coupons.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/20 text-xs text-white/95">
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

        {/* Right: Email & Password + Google Sign-In Action */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-white">
          <EmailAuthCard onSuccess={() => navigate('/account')} />

          <div className="pt-4 border-t border-[#F0F0F0] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#2874F0]">
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
    addresses,
    myOrders,
    wishlistIds,
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

  const activeEmail = userProfile?.email || user?.email || '';
  const activeName = userProfile?.displayName || user?.displayName || 'Customer';

  if (!user && !userProfile) {
    return (
      <main className="max-w-xl mx-auto px-3 sm:px-6 pt-6 pb-24 md:py-12">
        <div className="p-6 sm:p-8 bg-white border border-[#E0E0E0] rounded-xs space-y-5 shadow-xs">
          <div className="border-b border-[#F0F0F0] pb-4">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2874F0]">
              Cartlane Customer Account
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#212121]">
              Sign In with Email &amp; Password
            </h1>
          </div>
          <EmailAuthCard />
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
      email: activeEmail,
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
              {(activeName || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#878787]">Hello,</p>
              <p className="text-sm font-extrabold text-[#212121] truncate">
                {activeName}
              </p>
              <p className="text-[11px] text-[#878787] truncate">{activeEmail}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white border border-[#E0E0E0] rounded-xs divide-y divide-[#F0F0F0] shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full p-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
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
              className={`w-full p-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
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
              className={`w-full p-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
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

            <button
              type="button"
              onClick={logout}
              className="w-full p-4 flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-red-600 hover:bg-red-50 cursor-pointer"
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
                          className="text-xs text-red-600 hover:underline shrink-0 cursor-pointer"
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
                    className="w-full py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer"
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
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={activeEmail}
                  className="w-full border border-[#E0E0E0] bg-[#F8F9FA] text-[#878787] px-3 py-2 text-xs rounded-xs"
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
                className="px-6 py-2.5 bg-[#2874F0] text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer"
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
  const { user, userProfile, isAdmin, myOrders, showToast } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    // 1. Check local / context orders first for instant response
    const localFound =
      myOrders.find((o) => o.id === orderId) ||
      getLocalOrders().find((o) => o.id === orderId);
    if (localFound) {
      setOrder(localFound);
      setEvents(getLocalOrderEvents(orderId));
      setLoading(false);
    }

    // 2. Subscribe to RTDB order & events
    const unsubRtdbOrder = onValue(
      rtdbRef(rtdb, `orders/${orderId}`),
      (snap) => {
        if (snap.exists()) {
          setOrder(snap.val() as Order);
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
      }
    );

    const unsubRtdbEvents = onValue(
      rtdbRef(rtdb, `order_events/${orderId}`),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, OrderEvent>;
          setEvents(Object.values(val));
        }
      },
      () => {}
    );

    // 3. Also subscribe to Firestore if available
    const orderRef = doc(db, 'orders', orderId);
    const unsubFsOrder = onSnapshot(
      orderRef,
      (snap) => {
        if (snap.exists()) {
          setOrder(snap.data() as Order);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    const eventsRef = collection(db, 'orders', orderId, 'events');
    const unsubFsEvents = onSnapshot(
      eventsRef,
      (snap) => {
        if (!snap.empty) {
          setEvents(snap.docs.map((d) => d.data() as OrderEvent));
        }
      },
      () => {}
    );

    return () => {
      unsubRtdbOrder();
      unsubRtdbEvents();
      unsubFsOrder();
      unsubFsEvents();
    };
  }, [orderId, myOrders]);

  if (loading) {
    return (
      <main className="max-w-[1440px] mx-auto px-6 py-20 text-center text-xs font-bold uppercase tracking-widest text-[#878787]">
        Loading Order &amp; Live Tracking Timeline...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-lg mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-[#212121]">
          Order Not Found
        </h1>
        <p className="text-xs text-[#878787]">
          We could not find an order matching ID &ldquo;{orderId}&rdquo;.
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

  const handleCustomerAction = async (
    targetStatus: 'CANCELLATION_REQUESTED' | 'RETURN_REQUESTED'
  ) => {
    setActionBusy(true);
    try {
      await updateOrderStatusWithEvent({
        order,
        newStatus: targetStatus,
        message:
          targetStatus === 'CANCELLATION_REQUESTED'
            ? 'Customer requested order cancellation prior to shipment dispatch.'
            : 'Customer requested a 7-day return pickup after delivery.',
        actorName:
          userProfile?.displayName || user?.displayName || order.customerName || 'Customer',
        isAdminActor: isAdmin,
        location: 'Customer Account Portal',
      });
      setOrder({ ...order, status: targetStatus, updatedAt: new Date().toISOString() });
      setEvents(getLocalOrderEvents(order.id));
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
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E0E0E0] bg-white text-xs font-bold uppercase text-[#2874F0] hover:border-[#2874F0] rounded-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Invoice</span>
          </button>

          {canCancel && (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => handleCustomerAction('CANCELLATION_REQUESTED')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-600 text-red-600 text-xs font-bold uppercase hover:bg-red-50 rounded-xs cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#2874F0] text-[#2874F0] text-xs font-bold uppercase hover:bg-[#E3F2FD]/30 rounded-xs cursor-pointer"
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
  const { user, userProfile, myOrders } = useStore();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const cleaned = orderIdInput.trim().toUpperCase();
    if (!cleaned) return;

    // Check local orders first
    const localFound =
      myOrders.find((o) => o.id.toUpperCase() === cleaned) ||
      getLocalOrders().find((o) => o.id.toUpperCase() === cleaned);
    if (localFound) {
      navigate(`/account/orders/${localFound.id}`);
      return;
    }

    // Check RTDB
    try {
      const rtdbSnap = await get(rtdbRef(rtdb, `orders/${cleaned}`));
      if (rtdbSnap.exists()) {
        navigate(`/account/orders/${cleaned}`);
        return;
      }
    } catch {
      // continue
    }

    // Check Firestore
    try {
      const snap = await getDoc(doc(db, 'orders', cleaned));
      if (snap.exists()) {
        navigate(`/account/orders/${cleaned}`);
        return;
      }
    } catch {
      // continue
    }

    setLookupError(`No order found matching ID "${cleaned}". Please check your Order ID.`);
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
              className="px-8 py-3 bg-[#FB641B] hover:bg-[#E85812] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              Track Order
            </button>
          </div>

          {lookupError && <p className="text-xs text-red-600 font-semibold">{lookupError}</p>}

          {!user && !userProfile && (
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#878787] border-t border-[#F0F0F0]">
              <span>Login with Email &amp; Password to view all your recent Cartlane orders</span>
              <Link
                to="/login"
                className="font-extrabold text-[#2874F0] hover:underline self-start sm:self-auto"
              >
                Login / Sign Up →
              </Link>
            </div>
          )}
        </form>
      </div>

      {myOrders.length > 0 && (
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

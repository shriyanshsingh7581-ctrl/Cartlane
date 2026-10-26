import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { onValue, ref as rtdbRef } from 'firebase/database';
import {
  auth,
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  deleteRecordFromUserFirebase,
  forceSeedDatabase,
  handleFirestoreError,
  rtdb,
  seedDatabaseIfEmpty,
  signInWithGoogle,
  signOutUser,
  syncRecordToUserFirebase,
} from '../lib/firebase';
import {
  INITIAL_BANNERS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from '../lib/seedData';
import { calculateCartTotals, CartCalculationResult } from '../lib/orders';
import {
  Address,
  Banner,
  CartDoc,
  CartItem,
  Category,
  Coupon,
  OperationType,
  Order,
  Product,
  Review,
  SiteSettings,
  UserProfile,
  WishlistItem,
} from '../types';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  authReady: boolean;
  isDatabaseLive: boolean;
  products: Product[];
  allAdminProducts: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  reviews: Review[];
  settings: SiteSettings;
  cart: CartItem[];
  couponCode: string;
  cartTotals: CartCalculationResult;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  wishlistIds: string[];
  addresses: Address[];
  myOrders: Order[];
  recentlyViewedIds: string[];
  toast: ToastMessage | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  loginWithGoogle: () => Promise<UserProfile | null>;
  enableAdminSession: () => void;
  logout: () => Promise<void>;
  addToCart: (productId: string, variantLabel?: string, qty?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (productId: string, variantLabel: string, qty: number) => void;
  removeFromCart: (productId: string, variantLabel: string) => void;
  applyCouponCode: (code: string) => void;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  saveCustomerAddress: (
    addr: Omit<Address, 'id' | 'uid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<void>;
  deleteCustomerAddress: (addressId: string) => Promise<void>;
  updateCustomerProfile: (displayName: string, phone: string) => Promise<void>;
  recordProductView: (productId: string) => void;
  seedCatalogToFirestore: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const LOCAL_CART_KEY = 'av_grooming_cart_v1';
const LOCAL_COUPON_KEY = 'av_grooming_coupon_v1';
const LOCAL_RECENT_KEY = 'av_grooming_recent_v1';
const LOCAL_ADMIN_SESSION_KEY = 'cartlane_admin_session_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [authReady, setAuthReady] = useState(false);

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [rtdbProducts, setRtdbProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [rtdbCategories, setRtdbCategories] = useState<Category[]>([]);
  const [dbBanners, setDbBanners] = useState<Banner[]>([]);
  const [rtdbBanners, setRtdbBanners] = useState<Banner[]>([]);
  const [dbCoupons, setDbCoupons] = useState<Coupon[]>([]);
  const [rtdbCoupons, setRtdbCoupons] = useState<Coupon[]>([]);
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [rtdbReviews, setRtdbReviews] = useState<Review[]>([]);
  const [dbSettings, setDbSettings] = useState<SiteSettings | null>(null);
  const [rtdbSettings, setRtdbSettings] = useState<SiteSettings | null>(null);
  const [isDatabaseLive, setIsDatabaseLive] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [couponCode, setCouponCode] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_COUPON_KEY) || '';
    } catch {
      return '';
    }
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_RECENT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now(), text, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 1. Auth State Listener & Role Resolution
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      const savedAdminFlag = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY) === 'true';

      if (!firebaseUser) {
        if (!savedAdminFlag) {
          setUserProfile(null);
          setIsAdmin(false);
        } else {
          setUserProfile({
            uid: 'admin_console_owner',
            displayName: 'Cartlane Store Admin',
            email: BOOTSTRAP_ADMIN_EMAIL,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setIsAdmin(true);
        }
        setWishlistIds([]);
        setAddresses([]);
        setMyOrders([]);
        setAuthReady(true);
        return;
      }

      const emailIsAdmin =
        firebaseUser.emailVerified &&
        firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      let adminDocExists = false;
      try {
        const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
        adminDocExists = adminSnap.exists();
      } catch {
        adminDocExists = false;
      }

      const resolvedAdmin = Boolean(emailIsAdmin || adminDocExists || savedAdminFlag);
      setIsAdmin(resolvedAdmin);

      // Ensure user profile exists in /users/{uid}
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const now = new Date().toISOString();
        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as UserProfile);
        } else {
          const createdProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: (firebaseUser.displayName || 'Valued Gentleman').slice(0, 100),
            email: (firebaseUser.email || '').slice(0, 160),
            ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL.slice(0, 500) } : {}),
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(userRef, createdProfile);
          await syncRecordToUserFirebase('users', firebaseUser.uid, createdProfile);
          setUserProfile(createdProfile);
        }
      } catch (err) {
        console.warn('Could not read/initialize user profile:', err);
      }

      if (resolvedAdmin) {
        await seedDatabaseIfEmpty(true);
      }

      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // 2A. User's Firebase Realtime Database (studio-9019379244-c807b) Live Subscriptions
  useEffect(() => {
    const unsubRtdbProducts = onValue(
      rtdbRef(rtdb, 'products'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, Product>;
          const list = Object.values(val);
          setRtdbProducts(list);
          if (list.length > 0) setIsDatabaseLive(true);
        }
      },
      () => {
        // Ignore RTDB read permission notice if rules are locked
      }
    );

    const unsubRtdbCategories = onValue(
      rtdbRef(rtdb, 'categories'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, Category>;
          setRtdbCategories(Object.values(val));
        }
      },
      () => {}
    );

    const unsubRtdbBanners = onValue(
      rtdbRef(rtdb, 'banners'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, Banner>;
          setRtdbBanners(Object.values(val));
        }
      },
      () => {}
    );

    const unsubRtdbCoupons = onValue(
      rtdbRef(rtdb, 'coupons'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, Coupon>;
          setRtdbCoupons(Object.values(val));
        }
      },
      () => {}
    );

    const unsubRtdbReviews = onValue(
      rtdbRef(rtdb, 'reviews'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, Review>;
          setRtdbReviews(Object.values(val));
        }
      },
      () => {}
    );

    const unsubRtdbSettings = onValue(
      rtdbRef(rtdb, 'settings/global'),
      (snap) => {
        if (snap.exists()) {
          setRtdbSettings(snap.val() as SiteSettings);
          setIsDatabaseLive(true);
        }
      },
      () => {}
    );

    return () => {
      unsubRtdbProducts();
      unsubRtdbCategories();
      unsubRtdbBanners();
      unsubRtdbCoupons();
      unsubRtdbReviews();
      unsubRtdbSettings();
    };
  }, []);

  // 2B. Firestore Catalog Subscriptions
  useEffect(() => {
    if (!authReady) return;

    const productsQuery =
      isAdmin && user
        ? collection(db, 'products')
        : query(collection(db, 'products'), where('status', '==', 'published'));

    const unsubProducts = onSnapshot(
      productsQuery,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Product);
        setDbProducts(list);
        if (list.length > 0) setIsDatabaseLive(true);
      },
      (err) => {
        console.warn('Products listener notice:', err.message);
      }
    );

    const categoriesQuery =
      isAdmin && user
        ? collection(db, 'categories')
        : query(collection(db, 'categories'), where('order', '>=', 0));

    const unsubCategories = onSnapshot(
      categoriesQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Category)
          .sort((a, b) => a.order - b.order);
        setDbCategories(list);
      },
      (err) => {
        console.warn('Categories listener notice:', err.message);
      }
    );

    const bannersQuery =
      isAdmin && user
        ? collection(db, 'banners')
        : query(collection(db, 'banners'), where('active', '==', true));

    const unsubBanners = onSnapshot(
      bannersQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Banner)
          .sort((a, b) => a.order - b.order);
        setDbBanners(list);
      },
      (err) => {
        console.warn('Banners listener notice:', err.message);
      }
    );

    const couponsQuery =
      isAdmin && user
        ? collection(db, 'coupons')
        : query(collection(db, 'coupons'), where('active', '==', true));

    const unsubCoupons = onSnapshot(
      couponsQuery,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Coupon);
        setDbCoupons(list);
      },
      (err) => {
        console.warn('Coupons listener notice:', err.message);
      }
    );

    const reviewsQuery = query(collection(db, 'reviews'), where('rating', '>=', 1));
    const unsubReviews = onSnapshot(
      reviewsQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Review)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setDbReviews(list);
      },
      (err) => {
        console.warn('Reviews listener notice:', err.message);
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (snap) => {
        if (snap.exists()) {
          setDbSettings(snap.data() as SiteSettings);
          setIsDatabaseLive(true);
        }
      },
      (err) => {
        console.warn('Settings listener notice:', err.message);
      }
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBanners();
      unsubCoupons();
      unsubReviews();
      unsubSettings();
    };
  }, [authReady, isAdmin, user]);

  // 3. Authenticated User Subscriptions (Cart, Wishlist, Addresses, Orders)
  useEffect(() => {
    if (!authReady || !user) return;

    const uid = user.uid;

    const unsubCart = onSnapshot(
      doc(db, 'carts', uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as CartDoc;
          setCart(data.items || []);
          if (data.couponCode !== undefined) {
            setCouponCode(data.couponCode);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `carts/${uid}`)
    );

    const unsubWishlist = onSnapshot(
      collection(db, 'users', uid, 'wishlist'),
      (snap) => {
        setWishlistIds(snap.docs.map((d) => d.id));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/wishlist`)
    );

    const unsubAddresses = onSnapshot(
      collection(db, 'users', uid, 'addresses'),
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Address)
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
        setAddresses(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/addresses`)
    );

    const ordersQ = query(collection(db, 'orders'), where('uid', '==', uid));
    const unsubOrders = onSnapshot(
      ordersQ,
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Order)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setMyOrders(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
    );

    return () => {
      unsubCart();
      unsubWishlist();
      unsubAddresses();
      unsubOrders();
    };
  }, [authReady, user]);

  // Resolve active catalog (merges live RTDB + Firestore edits with the 16 authentic reference products & photos)
  const allAdminProducts = useMemo(() => {
    const combinedMap = new Map<string, Product>();
    for (const initProd of INITIAL_PRODUCTS) {
      combinedMap.set(initProd.id, initProd);
    }
    for (const p of dbProducts) {
      if (!p.mainImage?.startsWith('data:image/svg')) {
        combinedMap.set(p.id, p);
      }
    }
    for (const p of rtdbProducts) {
      if (p && p.id && !p.mainImage?.startsWith('data:image/svg')) {
        combinedMap.set(p.id, p);
      }
    }
    return Array.from(combinedMap.values());
  }, [dbProducts, rtdbProducts]);

  const products = useMemo(
    () => allAdminProducts.filter((p) => p.status === 'published'),
    [allAdminProducts]
  );

  const categories = useMemo(() => {
    const combinedMap = new Map<string, Category>();
    for (const c of INITIAL_CATEGORIES) combinedMap.set(c.id, c);
    for (const c of dbCategories) {
      if (!c.image?.startsWith('data:image/svg')) combinedMap.set(c.id, c);
    }
    for (const c of rtdbCategories) {
      if (c && c.id && !c.image?.startsWith('data:image/svg')) combinedMap.set(c.id, c);
    }
    return Array.from(combinedMap.values()).sort((a, b) => a.order - b.order);
  }, [dbCategories, rtdbCategories]);

  const banners = useMemo(() => {
    const combinedMap = new Map<string, Banner>();
    for (const b of INITIAL_BANNERS) combinedMap.set(b.id, b);
    for (const b of dbBanners) {
      if (!b.image?.startsWith('data:image/svg')) combinedMap.set(b.id, b);
    }
    for (const b of rtdbBanners) {
      if (b && b.id && !b.image?.startsWith('data:image/svg')) combinedMap.set(b.id, b);
    }
    return Array.from(combinedMap.values()).sort((a, b) => a.order - b.order);
  }, [dbBanners, rtdbBanners]);

  const coupons = useMemo(() => {
    const combinedMap = new Map<string, Coupon>();
    for (const c of INITIAL_COUPONS) combinedMap.set(c.id, c);
    for (const c of dbCoupons) combinedMap.set(c.id, c);
    for (const c of rtdbCoupons) {
      if (c && c.id) combinedMap.set(c.id, c);
    }
    return Array.from(combinedMap.values());
  }, [dbCoupons, rtdbCoupons]);

  const reviews = useMemo(() => {
    const combinedMap = new Map<string, Review>();
    for (const r of INITIAL_REVIEWS) combinedMap.set(r.id, r);
    for (const r of dbReviews) combinedMap.set(r.id, r);
    for (const r of rtdbReviews) {
      if (r && r.id) combinedMap.set(r.id, r);
    }
    return Array.from(combinedMap.values()).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  }, [dbReviews, rtdbReviews]);

  const settings = useMemo<SiteSettings>(() => {
    const activeSettings = rtdbSettings || dbSettings;
    if (!activeSettings) return INITIAL_SETTINGS;
    const isLegacyBrand =
      !activeSettings.brandName ||
      activeSettings.brandName.toLowerCase().includes('atelier vanguard');
    return {
      ...INITIAL_SETTINGS,
      ...activeSettings,
      brandName: isLegacyBrand ? 'CARTLANE' : activeSettings.brandName,
      supportEmail: activeSettings.supportEmail?.includes('ateliervanguard')
        ? 'support@cartlane.in'
        : activeSettings.supportEmail || 'support@cartlane.in',
    };
  }, [dbSettings, rtdbSettings]);

  const cartTotals = useMemo(
    () => calculateCartTotals(cart, products, coupons, settings, couponCode),
    [cart, products, coupons, settings, couponCode]
  );

  const persistCart = async (nextItems: CartItem[], nextCoupon = couponCode) => {
    setCart(nextItems);
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(nextItems));
      localStorage.setItem(LOCAL_COUPON_KEY, nextCoupon);
    } catch {
      // ignore storage errors
    }

    if (user) {
      const cartPath = `carts/${user.uid}`;
      try {
        const payload: CartDoc = {
          uid: user.uid,
          items: nextItems.slice(0, 50),
          ...(nextCoupon ? { couponCode: nextCoupon.slice(0, 32) } : {}),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'carts', user.uid), payload);
        await syncRecordToUserFirebase('carts', user.uid, payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, cartPath);
      }
    }
  };

  const addToCart = (
    productId: string,
    variantLabel?: string,
    qty = 1,
    openDrawer = true
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (prod.stock <= 0) {
      showToast(`"${prod.name}" is currently out of stock.`, 'error');
      return;
    }

    const resolvedVariant =
      variantLabel || prod.variants?.[0]?.label || 'Standard';
    const existingIndex = cart.findIndex(
      (i) => i.productId === productId && i.variantLabel === resolvedVariant
    );

    const nextCart = [...cart];
    if (existingIndex >= 0) {
      const newQty = Math.min(prod.stock, nextCart[existingIndex].quantity + qty);
      nextCart[existingIndex] = { ...nextCart[existingIndex], quantity: newQty };
    } else {
      nextCart.push({
        productId,
        variantLabel: resolvedVariant,
        quantity: Math.min(prod.stock, qty),
      });
    }

    persistCart(nextCart);
    if (openDrawer) {
      setCartDrawerOpen(true);
    } else {
      showToast(`Added ${prod.name} to your cart.`);
    }
  };

  const updateCartQuantity = (productId: string, variantLabel: string, qty: number) => {
    const prod = products.find((p) => p.id === productId);
    const maxStock = prod ? prod.stock : 99;
    if (qty <= 0) {
      removeFromCart(productId, variantLabel);
      return;
    }
    const clamped = Math.min(maxStock, qty);
    const nextCart = cart.map((item) =>
      item.productId === productId && item.variantLabel === variantLabel
        ? { ...item, quantity: clamped }
        : item
    );
    persistCart(nextCart);
  };

  const removeFromCart = (productId: string, variantLabel: string) => {
    const nextCart = cart.filter(
      (item) => !(item.productId === productId && item.variantLabel === variantLabel)
    );
    persistCart(nextCart);
  };

  const applyCouponCode = (code: string) => {
    const normalized = code.trim().toUpperCase();
    setCouponCode(normalized);
    persistCart(cart, normalized);
    if (!normalized) {
      showToast('Coupon removed.', 'info');
    }
  };

  const clearCart = async () => {
    await persistCart([], '');
    setCouponCode('');
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      showToast('Please sign in with Google to save items to your Wishlist.', 'info');
      return;
    }
    const path = `users/${user.uid}/wishlist/${productId}`;
    const ref = doc(db, 'users', user.uid, 'wishlist', productId);
    try {
      if (wishlistIds.includes(productId)) {
        await deleteDoc(ref);
        await deleteRecordFromUserFirebase(`users/${user.uid}/wishlist`, productId);
        showToast('Removed from your Wishlist.', 'info');
      } else {
        const item: WishlistItem = {
          productId,
          uid: user.uid,
          createdAt: new Date().toISOString(),
        };
        await setDoc(ref, item);
        await syncRecordToUserFirebase(`users/${user.uid}/wishlist`, productId, item);
        showToast('Saved to your Wishlist.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const saveCustomerAddress = async (
    addrInput: Omit<Address, 'id' | 'uid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (!user) throw new Error('Authentication required');
    const addressId = existingId || `addr_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = addresses.find((a) => a.id === addressId);

    const record: Address = {
      id: addressId,
      uid: user.uid,
      fullName: addrInput.fullName.slice(0, 100),
      ...(addrInput.email ? { email: addrInput.email.slice(0, 160) } : {}),
      phone: addrInput.phone.slice(0, 15),
      house: addrInput.house.slice(0, 160),
      street: addrInput.street.slice(0, 200),
      city: addrInput.city.slice(0, 80),
      state: addrInput.state.slice(0, 80),
      pinCode: addrInput.pinCode.slice(0, 6),
      ...(addrInput.landmark ? { landmark: addrInput.landmark.slice(0, 160) } : {}),
      isDefault: addrInput.isDefault,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const path = `users/${user.uid}/addresses/${addressId}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'addresses', addressId), record);
      await syncRecordToUserFirebase(`users/${user.uid}/addresses`, addressId, record);
      showToast('Shipping address saved.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const deleteCustomerAddress = async (addressId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/addresses/${addressId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', addressId));
      await deleteRecordFromUserFirebase(`users/${user.uid}/addresses`, addressId);
      showToast('Address deleted.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const updateCustomerProfile = async (displayName: string, phone: string) => {
    if (!user || !userProfile) return;
    const path = `users/${user.uid}`;
    const updated: UserProfile = {
      ...userProfile,
      displayName: displayName.trim().slice(0, 100),
      ...(phone.trim() ? { phone: phone.trim().slice(0, 20) } : {}),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', user.uid), updated);
      await syncRecordToUserFirebase('users', user.uid, updated);
      setUserProfile(updated);
      showToast('Profile updated successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const recordProductView = (productId: string) => {
    setRecentlyViewedIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, 6);
      try {
        localStorage.setItem(LOCAL_RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const loginWithGoogle = async () => {
    try {
      const profile = await signInWithGoogle();
      showToast(`Welcome, ${profile.displayName}.`);
      return profile;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in cancelled or failed.';
      showToast(msg, 'error');
      return null;
    }
  };

  const enableAdminSession = () => {
    try {
      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, 'true');
    } catch {
      // ignore
    }
    setIsAdmin(true);
    if (!userProfile) {
      setUserProfile({
        uid: 'admin_console_owner',
        displayName: 'Cartlane Store Admin',
        email: BOOTSTRAP_ADMIN_EMAIL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    showToast('Cartlane Admin Console unlocked (Connected to studio-9019379244-c807b).');
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    setIsAdmin(false);
    await signOutUser();
    showToast('Signed out of your account.', 'info');
  };

  const seedCatalogToFirestore = async () => {
    await forceSeedDatabase();
    setIsDatabaseLive(true);
    showToast('Catalog synced to Firebase (studio-9019379244-c807b RTDB & Firestore)!');
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        authReady,
        isDatabaseLive,
        products,
        allAdminProducts,
        categories,
        banners,
        coupons,
        reviews,
        settings,
        cart,
        couponCode,
        cartTotals,
        cartDrawerOpen,
        setCartDrawerOpen,
        wishlistIds,
        addresses,
        myOrders,
        recentlyViewedIds,
        toast,
        showToast,
        loginWithGoogle,
        enableAdminSession,
        logout,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        applyCouponCode,
        clearCart,
        toggleWishlist,
        saveCustomerAddress,
        deleteCustomerAddress,
        updateCustomerProfile,
        recordProductView,
        seedCatalogToFirestore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

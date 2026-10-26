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
  DEFAULT_ADMIN_EMAIL,
  deleteRecordFromUserFirebase,
  forceSeedDatabase,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
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
  user: User | { uid: string; email: string | null; displayName: string | null } | null;
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
  loginWithEmail: (email: string, password: string, asAdmin?: boolean) => Promise<UserProfile | null>;
  registerWithEmail: (
    email: string,
    password: string,
    displayName: string,
    phone?: string
  ) => Promise<UserProfile | null>;
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
  // Complete Admin CRUD Operations
  upsertProduct: (product: Product) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  upsertCategory: (category: Category) => Promise<void>;
  removeCategory: (categoryId: string) => Promise<void>;
  upsertBanner: (banner: Banner) => Promise<void>;
  removeBanner: (bannerId: string) => Promise<void>;
  upsertCoupon: (coupon: Coupon) => Promise<void>;
  removeCoupon: (couponId: string) => Promise<void>;
  upsertReview: (review: Review) => Promise<void>;
  removeReview: (reviewId: string) => Promise<void>;
  saveSiteSettings: (nextSettings: SiteSettings) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const LOCAL_CART_KEY = 'av_grooming_cart_v1';
const LOCAL_COUPON_KEY = 'av_grooming_coupon_v1';
const LOCAL_RECENT_KEY = 'av_grooming_recent_v1';
const LOCAL_ADMIN_SESSION_KEY = 'cartlane_admin_session_v1';
const LOCAL_ACTIVE_USER_KEY = 'cartlane_active_user_v1';
const LOCAL_WISHLIST_KEY = 'cartlane_wishlist_v1';
const LOCAL_ADDRESSES_KEY = 'cartlane_addresses_v1';
const LOCAL_DELETED_IDS_KEY = 'cartlane_deleted_ids_v1';
const LOCAL_ADMIN_OVERRIDES_KEY = 'cartlane_admin_overrides_v2';

interface AdminLocalOverrides {
  products: Record<string, Product>;
  categories: Record<string, Category>;
  banners: Record<string, Banner>;
  coupons: Record<string, Coupon>;
  reviews: Record<string, Review>;
  settings: SiteSettings | null;
}

const DEFAULT_OVERRIDES: AdminLocalOverrides = {
  products: {},
  categories: {},
  banners: {},
  coupons: {},
  reviews: {},
  settings: null,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ACTIVE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_ADMIN_SESSION_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [authReady, setAuthReady] = useState(true);

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

  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DELETED_IDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localOverrides, setLocalOverrides] = useState<AdminLocalOverrides>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ADMIN_OVERRIDES_KEY);
      return saved ? { ...DEFAULT_OVERRIDES, ...JSON.parse(saved) } : DEFAULT_OVERRIDES;
    } catch {
      return DEFAULT_OVERRIDES;
    }
  });

  const persistOverrides = (next: AdminLocalOverrides) => {
    setLocalOverrides(next);
    try {
      localStorage.setItem(LOCAL_ADMIN_OVERRIDES_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const markDeletedId = (id: string) => {
    setDeletedIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem(LOCAL_DELETED_IDS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const unmarkDeletedId = (id: string) => {
    setDeletedIds((prev) => {
      const next = prev.filter((x) => x !== id);
      try {
        localStorage.setItem(LOCAL_DELETED_IDS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ADDRESSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
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

  // Unified user object (supports both Firebase Auth User and Email/Password Profile Session)
  const activeUser = useMemo(() => {
    if (firebaseUser) return firebaseUser;
    if (userProfile) {
      return {
        uid: userProfile.uid,
        email: userProfile.email,
        displayName: userProfile.displayName,
      };
    }
    return null;
  }, [firebaseUser, userProfile]);

  // 1. Auth State Listener & Role Resolution
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setAuthReady(true);
        return;
      }

      const emailLower = fbUser.email?.toLowerCase() || '';
      const emailIsAdmin =
        emailLower === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ||
        emailLower === DEFAULT_ADMIN_EMAIL.toLowerCase();

      let adminDocExists = false;
      try {
        const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
        adminDocExists = adminSnap.exists();
      } catch {
        adminDocExists = false;
      }

      if (emailIsAdmin || adminDocExists) {
        setIsAdmin(true);
        try {
          localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, 'true');
        } catch {
          // ignore
        }
      }

      // Ensure user profile exists in /users/{uid}
      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userRef);
        const now = new Date().toISOString();
        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          setUserProfile(data);
          localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(data));
        } else {
          const createdProfile: UserProfile = {
            uid: fbUser.uid,
            displayName: (fbUser.displayName || 'Valued Gentleman').slice(0, 100),
            email: (fbUser.email || '').slice(0, 160),
            ...(fbUser.photoURL ? { photoURL: fbUser.photoURL.slice(0, 500) } : {}),
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(userRef, createdProfile);
          await syncRecordToUserFirebase('users', fbUser.uid, createdProfile);
          setUserProfile(createdProfile);
          localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(createdProfile));
        }
      } catch (err) {
        console.warn('Could not read/initialize user profile:', err);
      }

      if (emailIsAdmin || adminDocExists) {
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
      () => {}
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
      isAdmin && firebaseUser
        ? collection(db, 'products')
        : query(collection(db, 'products'), where('status', '==', 'published'));

    const unsubProducts = onSnapshot(
      productsQuery,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Product);
        setDbProducts(list);
        if (list.length > 0) setIsDatabaseLive(true);
      },
      () => {}
    );

    const categoriesQuery =
      isAdmin && firebaseUser
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
      () => {}
    );

    const bannersQuery =
      isAdmin && firebaseUser
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
      () => {}
    );

    const couponsQuery =
      isAdmin && firebaseUser
        ? collection(db, 'coupons')
        : query(collection(db, 'coupons'), where('active', '==', true));

    const unsubCoupons = onSnapshot(
      couponsQuery,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Coupon);
        setDbCoupons(list);
      },
      () => {}
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
      () => {}
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (snap) => {
        if (snap.exists()) {
          setDbSettings(snap.data() as SiteSettings);
          setIsDatabaseLive(true);
        }
      },
      () => {}
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBanners();
      unsubCoupons();
      unsubReviews();
      unsubSettings();
    };
  }, [authReady, isAdmin, firebaseUser]);

  // 3. Authenticated User Subscriptions (Cart, Wishlist, Addresses, Orders)
  useEffect(() => {
    if (!activeUser) return;
    const uid = activeUser.uid;

    // Also subscribe to RTDB orders for this user
    const unsubRtdbOrders = onValue(
      rtdbRef(rtdb, 'orders'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Record<string, Order>;
          const userOrders = Object.values(val)
            .filter((o) => o && o.uid === uid)
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          if (userOrders.length > 0) {
            setMyOrders(userOrders);
          }
        }
      },
      () => {}
    );

    if (!firebaseUser) {
      return () => unsubRtdbOrders();
    }

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
      () => {}
    );

    const unsubWishlist = onSnapshot(
      collection(db, 'users', uid, 'wishlist'),
      (snap) => {
        setWishlistIds(snap.docs.map((d) => d.id));
      },
      () => {}
    );

    const unsubAddresses = onSnapshot(
      collection(db, 'users', uid, 'addresses'),
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Address)
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
        setAddresses(list);
      },
      () => {}
    );

    const ordersQ = query(collection(db, 'orders'), where('uid', '==', uid));
    const unsubOrders = onSnapshot(
      ordersQ,
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Order)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (list.length > 0) setMyOrders(list);
      },
      () => {}
    );

    return () => {
      unsubRtdbOrders();
      unsubCart();
      unsubWishlist();
      unsubAddresses();
      unsubOrders();
    };
  }, [activeUser, firebaseUser]);

  // Resolve active catalog (merges INITIAL + Firestore + RTDB + Admin Local Overrides, minus deletedIds)
  const allAdminProducts = useMemo(() => {
    const combinedMap = new Map<string, Product>();
    for (const initProd of INITIAL_PRODUCTS) {
      combinedMap.set(initProd.id, initProd);
    }
    for (const p of dbProducts) {
      if (p?.id && !p.mainImage?.startsWith('data:image/svg')) {
        combinedMap.set(p.id, p);
      }
    }
    for (const p of rtdbProducts) {
      if (p?.id && !p.mainImage?.startsWith('data:image/svg')) {
        combinedMap.set(p.id, p);
      }
    }
    for (const [id, p] of Object.entries(localOverrides.products)) {
      if (p?.id) combinedMap.set(id, p);
    }
    for (const delId of deletedIds) {
      combinedMap.delete(delId);
    }
    return Array.from(combinedMap.values());
  }, [dbProducts, rtdbProducts, localOverrides.products, deletedIds]);

  const products = useMemo(
    () => allAdminProducts.filter((p) => p.status === 'published'),
    [allAdminProducts]
  );

  const categories = useMemo(() => {
    const combinedMap = new Map<string, Category>();
    for (const c of INITIAL_CATEGORIES) combinedMap.set(c.id, c);
    for (const c of dbCategories) {
      if (c?.id && !c.image?.startsWith('data:image/svg')) combinedMap.set(c.id, c);
    }
    for (const c of rtdbCategories) {
      if (c?.id && !c.image?.startsWith('data:image/svg')) combinedMap.set(c.id, c);
    }
    for (const [id, c] of Object.entries(localOverrides.categories)) {
      if (c?.id) combinedMap.set(id, c);
    }
    for (const delId of deletedIds) {
      combinedMap.delete(delId);
    }
    return Array.from(combinedMap.values()).sort((a, b) => a.order - b.order);
  }, [dbCategories, rtdbCategories, localOverrides.categories, deletedIds]);

  const banners = useMemo(() => {
    const combinedMap = new Map<string, Banner>();
    for (const b of INITIAL_BANNERS) combinedMap.set(b.id, b);
    for (const b of dbBanners) {
      if (b?.id && !b.image?.startsWith('data:image/svg')) combinedMap.set(b.id, b);
    }
    for (const b of rtdbBanners) {
      if (b?.id && !b.image?.startsWith('data:image/svg')) combinedMap.set(b.id, b);
    }
    for (const [id, b] of Object.entries(localOverrides.banners)) {
      if (b?.id) combinedMap.set(id, b);
    }
    for (const delId of deletedIds) {
      combinedMap.delete(delId);
    }
    return Array.from(combinedMap.values()).sort((a, b) => a.order - b.order);
  }, [dbBanners, rtdbBanners, localOverrides.banners, deletedIds]);

  const coupons = useMemo(() => {
    const combinedMap = new Map<string, Coupon>();
    for (const c of INITIAL_COUPONS) combinedMap.set(c.id, c);
    for (const c of dbCoupons) if (c?.id) combinedMap.set(c.id, c);
    for (const c of rtdbCoupons) if (c?.id) combinedMap.set(c.id, c);
    for (const [id, c] of Object.entries(localOverrides.coupons)) {
      if (c?.id) combinedMap.set(id, c);
    }
    for (const delId of deletedIds) {
      combinedMap.delete(delId);
    }
    return Array.from(combinedMap.values());
  }, [dbCoupons, rtdbCoupons, localOverrides.coupons, deletedIds]);

  const reviews = useMemo(() => {
    const combinedMap = new Map<string, Review>();
    for (const r of INITIAL_REVIEWS) combinedMap.set(r.id, r);
    for (const r of dbReviews) if (r?.id) combinedMap.set(r.id, r);
    for (const r of rtdbReviews) if (r?.id) combinedMap.set(r.id, r);
    for (const [id, r] of Object.entries(localOverrides.reviews)) {
      if (r?.id) combinedMap.set(id, r);
    }
    for (const delId of deletedIds) {
      combinedMap.delete(delId);
    }
    return Array.from(combinedMap.values()).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  }, [dbReviews, rtdbReviews, localOverrides.reviews, deletedIds]);

  const settings = useMemo<SiteSettings>(() => {
    const activeSettings = localOverrides.settings || rtdbSettings || dbSettings;
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
  }, [dbSettings, rtdbSettings, localOverrides.settings]);

  const cartTotals = useMemo(
    () => calculateCartTotals(cart, products, coupons, settings, couponCode),
    [cart, products, coupons, settings, couponCode]
  );

  // ============================================================================
  // COMPLETE ADMIN CRUD ACTIONS (Instant Local + RTDB + Firestore Sync)
  // ============================================================================
  const upsertProduct = async (product: Product) => {
    unmarkDeletedId(product.id);
    persistOverrides({
      ...localOverrides,
      products: { ...localOverrides.products, [product.id]: product },
    });
    await syncRecordToUserFirebase('products', product.id, product);
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch {
      // synced via RTDB + localOverrides
    }
  };

  const removeProduct = async (productId: string) => {
    markDeletedId(productId);
    const nextProds = { ...localOverrides.products };
    delete nextProds[productId];
    persistOverrides({ ...localOverrides, products: nextProds });
    await deleteRecordFromUserFirebase('products', productId);
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch {
      // ignore
    }
  };

  const upsertCategory = async (category: Category) => {
    unmarkDeletedId(category.id);
    persistOverrides({
      ...localOverrides,
      categories: { ...localOverrides.categories, [category.id]: category },
    });
    await syncRecordToUserFirebase('categories', category.id, category);
    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch {
      // ignore
    }
  };

  const removeCategory = async (categoryId: string) => {
    markDeletedId(categoryId);
    const nextCats = { ...localOverrides.categories };
    delete nextCats[categoryId];
    persistOverrides({ ...localOverrides, categories: nextCats });
    await deleteRecordFromUserFirebase('categories', categoryId);
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch {
      // ignore
    }
  };

  const upsertBanner = async (banner: Banner) => {
    unmarkDeletedId(banner.id);
    persistOverrides({
      ...localOverrides,
      banners: { ...localOverrides.banners, [banner.id]: banner },
    });
    await syncRecordToUserFirebase('banners', banner.id, banner);
    try {
      await setDoc(doc(db, 'banners', banner.id), banner);
    } catch {
      // ignore
    }
  };

  const removeBanner = async (bannerId: string) => {
    markDeletedId(bannerId);
    const nextBanners = { ...localOverrides.banners };
    delete nextBanners[bannerId];
    persistOverrides({ ...localOverrides, banners: nextBanners });
    await deleteRecordFromUserFirebase('banners', bannerId);
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
    } catch {
      // ignore
    }
  };

  const upsertCoupon = async (coupon: Coupon) => {
    unmarkDeletedId(coupon.id);
    persistOverrides({
      ...localOverrides,
      coupons: { ...localOverrides.coupons, [coupon.id]: coupon },
    });
    await syncRecordToUserFirebase('coupons', coupon.id, coupon);
    try {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
    } catch {
      // ignore
    }
  };

  const removeCoupon = async (couponId: string) => {
    markDeletedId(couponId);
    const nextCoupons = { ...localOverrides.coupons };
    delete nextCoupons[couponId];
    persistOverrides({ ...localOverrides, coupons: nextCoupons });
    await deleteRecordFromUserFirebase('coupons', couponId);
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
    } catch {
      // ignore
    }
  };

  const upsertReview = async (review: Review) => {
    unmarkDeletedId(review.id);
    persistOverrides({
      ...localOverrides,
      reviews: { ...localOverrides.reviews, [review.id]: review },
    });
    await syncRecordToUserFirebase('reviews', review.id, review);
    try {
      await setDoc(doc(db, 'reviews', review.id), review);
    } catch {
      // ignore
    }
  };

  const removeReview = async (reviewId: string) => {
    markDeletedId(reviewId);
    const nextReviews = { ...localOverrides.reviews };
    delete nextReviews[reviewId];
    persistOverrides({ ...localOverrides, reviews: nextReviews });
    await deleteRecordFromUserFirebase('reviews', reviewId);
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch {
      // ignore
    }
  };

  const saveSiteSettings = async (nextSettings: SiteSettings) => {
    persistOverrides({
      ...localOverrides,
      settings: nextSettings,
    });
    await syncRecordToUserFirebase('settings', 'global', nextSettings);
    try {
      await setDoc(doc(db, 'settings', 'global'), nextSettings);
    } catch {
      // ignore
    }
  };

  // ============================================================================
  // CUSTOMER CART, WISHLIST, ADDRESS & AUTH ACTIONS
  // ============================================================================
  const persistCart = async (nextItems: CartItem[], nextCoupon = couponCode) => {
    setCart(nextItems);
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(nextItems));
      localStorage.setItem(LOCAL_COUPON_KEY, nextCoupon);
    } catch {
      // ignore
    }

    if (activeUser) {
      const payload: CartDoc = {
        uid: activeUser.uid,
        items: nextItems.slice(0, 50),
        ...(nextCoupon ? { couponCode: nextCoupon.slice(0, 32) } : {}),
        updatedAt: new Date().toISOString(),
      };
      await syncRecordToUserFirebase('carts', activeUser.uid, payload);
      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'carts', activeUser.uid), payload);
        } catch {
          // ignore
        }
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
    const isRemoving = wishlistIds.includes(productId);
    const nextIds = isRemoving
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(nextIds);
    try {
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(nextIds));
    } catch {
      // ignore
    }

    if (activeUser) {
      if (isRemoving) {
        await deleteRecordFromUserFirebase(`users/${activeUser.uid}/wishlist`, productId);
        if (firebaseUser) {
          try {
            await deleteDoc(doc(db, 'users', activeUser.uid, 'wishlist', productId));
          } catch {
            // ignore
          }
        }
      } else {
        const item: WishlistItem = {
          productId,
          uid: activeUser.uid,
          createdAt: new Date().toISOString(),
        };
        await syncRecordToUserFirebase(`users/${activeUser.uid}/wishlist`, productId, item);
        if (firebaseUser) {
          try {
            await setDoc(doc(db, 'users', activeUser.uid, 'wishlist', productId), item);
          } catch {
            // ignore
          }
        }
      }
    }

    showToast(isRemoving ? 'Removed from Wishlist.' : 'Saved to Wishlist!');
  };

  const saveCustomerAddress = async (
    addrInput: Omit<Address, 'id' | 'uid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const uid = activeUser?.uid || 'guest_user';
    const addressId = existingId || `addr_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = addresses.find((a) => a.id === addressId);

    const record: Address = {
      id: addressId,
      uid,
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

    const nextAddresses = [record, ...addresses.filter((a) => a.id !== addressId)];
    setAddresses(nextAddresses);
    try {
      localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(nextAddresses));
    } catch {
      // ignore
    }

    await syncRecordToUserFirebase(`users/${uid}/addresses`, addressId, record);
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', uid, 'addresses', addressId), record);
      } catch {
        // ignore
      }
    }
    showToast('Delivery address saved.');
  };

  const deleteCustomerAddress = async (addressId: string) => {
    const nextAddresses = addresses.filter((a) => a.id !== addressId);
    setAddresses(nextAddresses);
    try {
      localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(nextAddresses));
    } catch {
      // ignore
    }

    if (activeUser) {
      await deleteRecordFromUserFirebase(`users/${activeUser.uid}/addresses`, addressId);
      if (firebaseUser) {
        try {
          await deleteDoc(doc(db, 'users', activeUser.uid, 'addresses', addressId));
        } catch {
          // ignore
        }
      }
    }
    showToast('Address deleted.', 'info');
  };

  const updateCustomerProfile = async (displayName: string, phone: string) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      displayName: displayName.trim().slice(0, 100),
      ...(phone.trim() ? { phone: phone.trim().slice(0, 20) } : {}),
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    try {
      localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    await syncRecordToUserFirebase('users', updated.uid, updated);
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', updated.uid), updated);
      } catch {
        // ignore
      }
    }
    showToast('Profile updated successfully.');
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

  const loginWithEmail = async (email: string, password: string, asAdmin = false) => {
    try {
      const profile = await loginWithEmailAndPassword({ email, password });
      setUserProfile(profile);
      try {
        localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(profile));
      } catch {
        // ignore
      }
      const isOwnerEmail =
        email.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ||
        email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        asAdmin;
      if (isOwnerEmail) {
        setIsAdmin(true);
        try {
          localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, 'true');
        } catch {
          // ignore
        }
      }
      showToast(`Welcome back, ${profile.displayName}!`);
      return profile;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      showToast(msg, 'error');
      return null;
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    phone?: string
  ) => {
    try {
      const profile = await registerWithEmailAndPassword({
        email,
        password,
        displayName,
        phone,
      });
      setUserProfile(profile);
      try {
        localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(profile));
      } catch {
        // ignore
      }
      showToast(`Account created! Welcome to Cartlane, ${profile.displayName}.`);
      return profile;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      showToast(msg, 'error');
      return null;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const profile = await signInWithGoogle();
      setUserProfile(profile);
      try {
        localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(profile));
      } catch {
        // ignore
      }
      showToast(`Welcome, ${profile.displayName}.`);
      return profile;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed. Please use Email & Password login.';
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
      const adminProf: UserProfile = {
        uid: 'admin_console_owner',
        displayName: 'Cartlane Store Admin',
        email: BOOTSTRAP_ADMIN_EMAIL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUserProfile(adminProf);
      try {
        localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(adminProf));
      } catch {
        // ignore
      }
    }
    showToast('Cartlane Admin Panel Active!');
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_ACTIVE_USER_KEY);
    } catch {
      // ignore
    }
    setUserProfile(null);
    await signOutUser();
    showToast('Logged out successfully.', 'info');
  };

  const seedCatalogToFirestore = async () => {
    setDeletedIds([]);
    persistOverrides(DEFAULT_OVERRIDES);
    try {
      localStorage.removeItem(LOCAL_DELETED_IDS_KEY);
      localStorage.removeItem(LOCAL_ADMIN_OVERRIDES_KEY);
    } catch {
      // ignore
    }
    await forceSeedDatabase();
    setIsDatabaseLive(true);
    showToast('All 16 products, banners, coupons & settings synced to Firebase!');
  };

  return (
    <StoreContext.Provider
      value={{
        user: activeUser,
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
        loginWithEmail,
        registerWithEmail,
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

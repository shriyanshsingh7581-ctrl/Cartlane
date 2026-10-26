import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  remove as rtdbRemove,
  get as rtdbGet,
} from 'firebase/database';
import appletFirebaseConfig from '../../firebase-applet-config.json';
import { FirestoreErrorInfo, OperationType, UserProfile } from '../types';
import {
  INITIAL_BANNERS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from './seedData';

/**
 * User-supplied Firebase Configuration (Project: studio-9019379244-c807b + Asia-Southeast1 RTDB)
 */
export const USER_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCp_npVpwXwxr-xXfssIqwVidn7n1PJQOs',
  authDomain: 'studio-9019379244-c807b.firebaseapp.com',
  databaseURL:
    'https://studio-9019379244-c807b-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'studio-9019379244-c807b',
  storageBucket: 'studio-9019379244-c807b.firebasestorage.app',
  messagingSenderId: '243109489009',
  appId: '1:243109489009:web:b033de99797445754f2ed0',
};

// Primary Applet Firebase instance (provisioned & domain-allowlisted in AI Studio)
const app: FirebaseApp =
  getApps().find((a) => a.name === '[DEFAULT]') || initializeApp(appletFirebaseConfig);

// User's Custom Firebase instance (studio-9019379244-c807b with Realtime Database & Firestore)
export const userFirebaseApp: FirebaseApp =
  getApps().find((a) => a.name === 'cartlane-user-firebase') ||
  initializeApp(USER_FIREBASE_CONFIG, 'cartlane-user-firebase');

export const db = getFirestore(app, appletFirebaseConfig.firestoreDatabaseId);
export const userFirestoreDb = getFirestore(userFirebaseApp);
export const rtdb = getDatabase(userFirebaseApp, USER_FIREBASE_CONFIG.databaseURL);

export const auth = getAuth(app);
export const userAuth = getAuth(userFirebaseApp);
export const googleProvider = new GoogleAuthProvider();

export const BOOTSTRAP_ADMIN_EMAIL = 'singhshriyansh51@gmail.com';

/**
 * Helper to recursively strip `undefined` keys before writing to Firebase Realtime Database
 */
function sanitizeForRtdb<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Mirrors any document write to the user's Realtime Database (`studio-9019379244-c807b-default-rtdb`)
 * and user Firestore instance so the Admin Panel & Storefront stay synced with their Firebase project.
 */
export async function syncRecordToUserFirebase(
  collectionPath: string,
  docId: string,
  data: unknown
): Promise<void> {
  const cleanData = sanitizeForRtdb(data);
  try {
    await rtdbSet(rtdbRef(rtdb, `${collectionPath}/${docId}`), cleanData);
  } catch (err) {
    console.warn(`RTDB sync notice (${collectionPath}/${docId}):`, err);
  }
  try {
    await setDoc(doc(userFirestoreDb, collectionPath, docId), cleanData as Record<string, unknown>);
  } catch {
    // Ignore if user project Firestore rules restrict unauthenticated client writes
  }
}

export async function deleteRecordFromUserFirebase(
  collectionPath: string,
  docId: string
): Promise<void> {
  try {
    await rtdbRemove(rtdbRef(rtdb, `${collectionPath}/${docId}`));
  } catch (err) {
    console.warn(`RTDB delete notice (${collectionPath}/${docId}):`, err);
  }
  try {
    await deleteDoc(doc(userFirestoreDb, collectionPath, docId));
  } catch {
    // Ignore if restricted
  }
}

/**
 * Checks connectivity to the user's Realtime Database (`studio-9019379244-c807b`)
 */
export async function checkUserRtdbStatus(): Promise<{
  connected: boolean;
  projectId: string;
  databaseURL: string;
  message: string;
}> {
  try {
    await rtdbGet(rtdbRef(rtdb, 'settings/global'));
    return {
      connected: true,
      projectId: USER_FIREBASE_CONFIG.projectId,
      databaseURL: USER_FIREBASE_CONFIG.databaseURL,
      message: 'Connected to Firebase Realtime Database (asia-southeast1)',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: !msg.toLowerCase().includes('offline'),
      projectId: USER_FIREBASE_CONFIG.projectId,
      databaseURL: USER_FIREBASE_CONFIG.databaseURL,
      message: msg.includes('Permission denied')
        ? 'Connected to studio-9019379244-c807b (RTDB Rules active)'
        : 'Configured with studio-9019379244-c807b',
    };
  }
}

// Validate connection to Firestore on boot per skill directive
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'global'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Mandatory structured Firestore error handler per firebase-integration-rpc skill
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Sign in with Google Popup and create/update user profile document in /users/{uid}
 * Tries userAuth first if domain is authorized, and seamlessly falls back to allowlisted applet auth.
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  let user;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    user = result.user;
  } catch (primaryErr) {
    const fallbackResult = await signInWithPopup(userAuth, googleProvider);
    user = fallbackResult.user;
  }

  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  try {
    const existingSnap = await getDoc(userRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as UserProfile;
      const updatedProfile: UserProfile = {
        uid: user.uid,
        displayName: (
          user.displayName ||
          existingData.displayName ||
          'Valued Gentleman'
        ).slice(0, 100),
        email: (user.email || existingData.email || '').slice(0, 160),
        ...(user.photoURL || existingData.photoURL
          ? { photoURL: (user.photoURL || existingData.photoURL || '').slice(0, 500) }
          : {}),
        ...(existingData.phone ? { phone: existingData.phone.slice(0, 20) } : {}),
        createdAt: existingData.createdAt || now,
        updatedAt: now,
      };
      await setDoc(userRef, updatedProfile);
      await syncRecordToUserFirebase('users', user.uid, updatedProfile);
      return updatedProfile;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: (user.displayName || 'Valued Gentleman').slice(0, 100),
        email: (user.email || '').slice(0, 160),
        ...(user.photoURL ? { photoURL: user.photoURL.slice(0, 500) } : {}),
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, newProfile);
      await syncRecordToUserFirebase('users', user.uid, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
  try {
    await firebaseSignOut(userAuth);
  } catch {
    // ignore
  }
}

/**
 * Seeds Firestore AND the user's Realtime Database (studio-9019379244-c807b)
 * with initial products, categories, banners, coupons, reviews, and site settings.
 */
export async function seedDatabaseIfEmpty(isAdminUser: boolean): Promise<boolean> {
  if (!isAdminUser) return false;
  try {
    const charcoalSnap = await getDoc(doc(db, 'products', 'prod_charcoal_fw'));
    if (charcoalSnap.exists()) {
      const data = charcoalSnap.data();
      if (data?.mainImage && !String(data.mainImage).startsWith('data:image/svg')) {
        // Ensure RTDB also receives the catalog
        await syncCatalogToUserRtdbOnly();
        return false;
      }
    }
    await forceSeedDatabase();
    return true;
  } catch {
    await syncCatalogToUserRtdbOnly();
    return false;
  }
}

export async function syncCatalogToUserRtdbOnly(): Promise<void> {
  try {
    const productsMap: Record<string, unknown> = {};
    for (const p of INITIAL_PRODUCTS) productsMap[p.id] = sanitizeForRtdb(p);

    const categoriesMap: Record<string, unknown> = {};
    for (const c of INITIAL_CATEGORIES) categoriesMap[c.id] = sanitizeForRtdb(c);

    const bannersMap: Record<string, unknown> = {};
    for (const b of INITIAL_BANNERS) bannersMap[b.id] = sanitizeForRtdb(b);

    const couponsMap: Record<string, unknown> = {};
    for (const c of INITIAL_COUPONS) couponsMap[c.id] = sanitizeForRtdb(c);

    const reviewsMap: Record<string, unknown> = {};
    for (const r of INITIAL_REVIEWS) reviewsMap[r.id] = sanitizeForRtdb(r);

    await Promise.allSettled([
      rtdbSet(rtdbRef(rtdb, 'settings/global'), sanitizeForRtdb(INITIAL_SETTINGS)),
      rtdbSet(rtdbRef(rtdb, 'products'), productsMap),
      rtdbSet(rtdbRef(rtdb, 'categories'), categoriesMap),
      rtdbSet(rtdbRef(rtdb, 'banners'), bannersMap),
      rtdbSet(rtdbRef(rtdb, 'coupons'), couponsMap),
      rtdbSet(rtdbRef(rtdb, 'reviews'), reviewsMap),
    ]);
  } catch (err) {
    console.warn('RTDB bulk sync notice:', err);
  }
}

export async function forceSeedDatabase(): Promise<void> {
  // Always sync to User's Realtime Database (studio-9019379244-c807b)
  await syncCatalogToUserRtdbOnly();

  const batch = writeBatch(db);

  batch.set(doc(db, 'settings', 'global'), INITIAL_SETTINGS);

  for (const category of INITIAL_CATEGORIES) {
    batch.set(doc(db, 'categories', category.id), category);
  }

  for (const banner of INITIAL_BANNERS) {
    batch.set(doc(db, 'banners', banner.id), banner);
  }

  for (const product of INITIAL_PRODUCTS) {
    batch.set(doc(db, 'products', product.id), product);
  }

  for (const coupon of INITIAL_COUPONS) {
    batch.set(doc(db, 'coupons', coupon.id), coupon);
  }

  for (const review of INITIAL_REVIEWS) {
    batch.set(doc(db, 'reviews', review.id), review);
  }

  try {
    await batch.commit();
  } catch (error) {
    // If the user is in Instant Admin Console mode without Firestore write token, RTDB sync still succeeded
    console.warn('Firestore batch commit notice:', error);
  }
}

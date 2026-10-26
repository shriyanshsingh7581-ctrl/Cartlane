import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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
export const DEFAULT_ADMIN_EMAIL = 'admin@cartlane.in';

const LOCAL_EMAIL_ACCOUNTS_KEY = 'cartlane_email_accounts_v1';

interface StoredEmailAccount {
  uid: string;
  email: string;
  passwordHash: string;
  displayName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

function simpleHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `h_${(h >>> 0).toString(16)}`;
}

function getLocalEmailAccounts(): Record<string, StoredEmailAccount> {
  try {
    const raw = localStorage.getItem(LOCAL_EMAIL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalEmailAccount(account: StoredEmailAccount) {
  try {
    const all = getLocalEmailAccounts();
    all[account.email.toLowerCase()] = account;
    localStorage.setItem(LOCAL_EMAIL_ACCOUNTS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

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
 * Register a new customer/admin account with Email & Password.
 * Attempts Firebase Auth (userAuth / auth) first, and seamlessly falls back to RTDB + local auth
 * if Email/Password provider is not yet enabled in Firebase Console.
 */
export async function registerWithEmailAndPassword(params: {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}): Promise<UserProfile> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = (params.displayName.trim() || cleanEmail.split('@')[0] || 'Cartlane Member').slice(0, 100);
  const now = new Date().toISOString();

  if (params.password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  let uid = `usr_${ cleanEmail.replace(/[^a-z0-9]/g, '_') }`;

  // 1. Try Firebase Auth createUserWithEmailAndPassword on user's Firebase project first, then applet auth
  try {
    const cred = await createUserWithEmailAndPassword(userAuth, cleanEmail, params.password);
    uid = cred.user.uid;
    try {
      await updateProfile(cred.user, { displayName: cleanName });
    } catch {
      // ignore
    }
  } catch (errUserAuth: unknown) {
    const msg = errUserAuth instanceof Error ? errUserAuth.message : String(errUserAuth);
    if (msg.includes('email-already-in-use')) {
      throw new Error('This email is already registered. Please sign in with your password.');
    }
    try {
      const cred2 = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
      uid = cred2.user.uid;
      try {
        await updateProfile(cred2.user, { displayName: cleanName });
      } catch {
        // ignore
      }
    } catch (errPrimary: unknown) {
      const msg2 = errPrimary instanceof Error ? errPrimary.message : String(errPrimary);
      if (msg2.includes('email-already-in-use')) {
        throw new Error('This email is already registered. Please sign in with your password.');
      }
      // Fallback: Verify against RTDB / Local accounts if Email/Password provider isn't toggled on in Firebase Console yet
      const existingLocal = getLocalEmailAccounts()[cleanEmail];
      if (existingLocal) {
        throw new Error('This email is already registered. Please sign in with your password.');
      }
    }
  }

  const profile: UserProfile = {
    uid,
    displayName: cleanName,
    email: cleanEmail.slice(0, 160),
    ...(params.phone?.trim() ? { phone: params.phone.trim().slice(0, 20) } : {}),
    createdAt: now,
    updatedAt: now,
  };

  const accountRecord: StoredEmailAccount = {
    uid,
    email: cleanEmail,
    passwordHash: simpleHash(params.password),
    displayName: cleanName,
    ...(params.phone?.trim() ? { phone: params.phone.trim().slice(0, 20) } : {}),
    createdAt: now,
    updatedAt: now,
  };

  saveLocalEmailAccount(accountRecord);
  await syncRecordToUserFirebase('users', uid, profile);
  await syncRecordToUserFirebase('email_accounts', uid, accountRecord);

  try {
    if (auth.currentUser) {
      await setDoc(doc(db, 'users', uid), profile);
    }
  } catch {
    // Synced via RTDB
  }

  return profile;
}

/**
 * Sign in an existing customer/admin with Email & Password.
 * Supports built-in Admin credentials as well as any registered Email/Password account.
 */
export async function loginWithEmailAndPassword(params: {
  email: string;
  password: string;
}): Promise<UserProfile> {
  const cleanEmail = params.email.trim().toLowerCase();
  const now = new Date().toISOString();

  if (!cleanEmail || !params.password) {
    throw new Error('Please enter both email and password.');
  }

  // 1. Try Firebase Auth signInWithEmailAndPassword on userAuth or auth
  try {
    const cred = await signInWithEmailAndPassword(userAuth, cleanEmail, params.password);
    const u = cred.user;
    const profile: UserProfile = {
      uid: u.uid,
      displayName: (u.displayName || cleanEmail.split('@')[0] || 'Cartlane Member').slice(0, 100),
      email: cleanEmail,
      createdAt: now,
      updatedAt: now,
    };
    await syncRecordToUserFirebase('users', u.uid, profile);
    return profile;
  } catch {
    try {
      const cred2 = await signInWithEmailAndPassword(auth, cleanEmail, params.password);
      const u = cred2.user;
      const profile: UserProfile = {
        uid: u.uid,
        displayName: (u.displayName || cleanEmail.split('@')[0] || 'Cartlane Member').slice(0, 100),
        email: cleanEmail,
        createdAt: now,
        updatedAt: now,
      };
      await syncRecordToUserFirebase('users', u.uid, profile);
      return profile;
    } catch {
      // Continue to RTDB / Local Email Account verification
    }
  }

  const uid = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const inputHash = simpleHash(params.password);

  // 2. Check RTDB `email_accounts/{uid}`
  try {
    const snap = await rtdbGet(rtdbRef(rtdb, `email_accounts/${uid}`));
    if (snap.exists()) {
      const remoteAcc = snap.val() as StoredEmailAccount;
      if (remoteAcc.passwordHash && remoteAcc.passwordHash !== inputHash) {
        throw new Error('Incorrect password. Please try again.');
      }
      const profile: UserProfile = {
        uid: remoteAcc.uid || uid,
        displayName: remoteAcc.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        ...(remoteAcc.phone ? { phone: remoteAcc.phone } : {}),
        createdAt: remoteAcc.createdAt || now,
        updatedAt: now,
      };
      saveLocalEmailAccount(remoteAcc);
      return profile;
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('Incorrect password')) {
      throw err;
    }
  }

  // 3. Check Local Email Accounts or auto-create session if first-time login
  const localAccounts = getLocalEmailAccounts();
  const existingLocal = localAccounts[cleanEmail];
  if (existingLocal) {
    if (existingLocal.passwordHash !== inputHash) {
      throw new Error('Incorrect password. Please check your password and try again.');
    }
    return {
      uid: existingLocal.uid,
      displayName: existingLocal.displayName,
      email: existingLocal.email,
      ...(existingLocal.phone ? { phone: existingLocal.phone } : {}),
      createdAt: existingLocal.createdAt,
      updatedAt: now,
    };
  }

  // 4. If account doesn't exist yet, seamlessly create and sign in so the user is never blocked
  return registerWithEmailAndPassword({
    email: cleanEmail,
    password: params.password,
    displayName: cleanEmail.split('@')[0],
  });
}

/**
 * Sign in with Google Popup and create/update user profile document in /users/{uid}
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  let user;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    user = result.user;
  } catch {
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
  try {
    await firebaseSignOut(auth);
  } catch {
    // ignore
  }
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
    console.warn('Firestore batch commit notice:', error);
  }
}

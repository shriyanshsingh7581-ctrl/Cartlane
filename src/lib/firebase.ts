import { initializeApp, getApps, getApp } from 'firebase/app';
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
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { FirestoreErrorInfo, OperationType, UserProfile } from '../types';
import {
  INITIAL_BANNERS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from './seedData';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const BOOTSTRAP_ADMIN_EMAIL = 'singhshriyansh51@gmail.com';

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
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  try {
    const existingSnap = await getDoc(userRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as UserProfile;
      const updatedProfile: UserProfile = {
        uid: user.uid,
        displayName: (user.displayName || existingData.displayName || 'Valued Gentleman').slice(0, 100),
        email: (user.email || existingData.email || '').slice(0, 160),
        ...(user.photoURL || existingData.photoURL
          ? { photoURL: (user.photoURL || existingData.photoURL || '').slice(0, 500) }
          : {}),
        ...(existingData.phone ? { phone: existingData.phone.slice(0, 20) } : {}),
        createdAt: existingData.createdAt || now,
        updatedAt: now,
      };
      await setDoc(userRef, updatedProfile);
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
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Seeds Firestore with initial products, categories, banners, coupons, reviews, and site settings
 * when an authorized administrator signs in and the database is empty, or via explicit admin trigger.
 */
export async function seedDatabaseIfEmpty(isAdminUser: boolean): Promise<boolean> {
  if (!isAdminUser) return false;
  try {
    const charcoalSnap = await getDoc(doc(db, 'products', 'prod_charcoal_fw'));
    if (charcoalSnap.exists()) {
      const data = charcoalSnap.data();
      if (data?.mainImage && !String(data.mainImage).startsWith('data:image/svg')) {
        return false;
      }
    }
    await forceSeedDatabase();
    return true;
  } catch {
    return false;
  }
}

export async function forceSeedDatabase(): Promise<void> {
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
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
  }
}

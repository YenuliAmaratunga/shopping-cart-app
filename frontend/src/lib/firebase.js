import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

export const getFirebaseAuthClient = () => {
  const missing = requiredVars.filter((key) => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Firebase env vars: ${missing.join(', ')}`);
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
};

export const initializeFirebaseAnalytics = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    return null;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const { isSupported, getAnalytics } = await import('firebase/analytics');
    const supported = await isSupported();
    if (!supported) {
      return null;
    }
    return getAnalytics(app);
  } catch {
    return null;
  }
};

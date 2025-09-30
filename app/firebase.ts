// Import types only to avoid bundling Firebase during build
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDZqv78vDcC8IRMYI2EQd4IKrC2Ui07wps",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "red-creativa-pro.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "red-creativa-pro",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "red-creativa-pro.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "771570793660",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:771570793660:web:83847a140dfd8b708da4b9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MJPH90SM0S"
};

// Initialize Firebase only on client side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let initializationPromise: Promise<{ app: FirebaseApp | null; auth: Auth | null }> | null = null;

// Safe initialization function with dynamic imports
async function initializeFirebase() {
  // Disable Firebase during build time (server-side only)
  if (typeof window === 'undefined') {
    return { app: null, auth: null };
  }
  
  // Return existing promise if initialization is already in progress
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // Create initialization promise
  initializationPromise = (async () => {
    if (!app) {
      try {
        console.log('🔥 Initializing Firebase...');
        // Dynamically import Firebase functions
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');
        
        // Initialize Firebase
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        
        // Initialize Firebase Authentication and get a reference to the service
        auth = getAuth(app);
        
        console.log('✅ Firebase initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        throw error;
      }
    }
    return { app, auth: auth || null };
  })();
  
  return initializationPromise;
}

// Initialize immediately if in browser
if (typeof window !== 'undefined') {
  initializeFirebase().catch(console.error);
}

// Export safe getter functions
export const getFirebaseAuth = () => {
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }
  return auth || null;
};

// Export async getter for proper initialization
export const getFirebaseAuthAsync = async () => {
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }
  
  try {
    const result = await initializeFirebase();
    return result.auth;
  } catch (error) {
    console.error('Error getting Firebase Auth:', error);
    return null;
  }
};

export const getFirebaseApp = async () => {
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }
  
  try {
    const result = await initializeFirebase();
    return result.app;
  } catch (error) {
    console.error('Error getting Firebase App:', error);
    return null;
  }
};

// Synchronous version for backward compatibility
export const getFirebaseAppSync = () => {
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }
  return app || null;
};

// Legacy exports for backward compatibility
export { auth };
export default app;
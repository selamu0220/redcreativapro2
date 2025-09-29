// Import types only to avoid bundling Firebase during build
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZqv78vDcC8IRMYI2EQd4IKrC2Ui07wps",
  authDomain: "red-creativa-pro.firebaseapp.com",
  projectId: "red-creativa-pro",
  storageBucket: "red-creativa-pro.firebasestorage.app",
  messagingSenderId: "771570793660",
  appId: "1:771570793660:web:83847a140dfd8b708da4b9",
  measurementId: "G-MJPH90SM0S"
};

// Initialize Firebase only on client side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

// Safe initialization function with dynamic imports
async function initializeFirebase() {
  // Disable Firebase during build time
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return { app: null, auth: null };
  }
  
  if (!app) {
    try {
      // Dynamically import Firebase functions
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      
      // Initialize Firebase
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      // Initialize Firebase Authentication and get a reference to the service
      auth = getAuth(app);
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }
  return { app, auth };
}

// Initialize immediately if in browser and not during build
if (typeof window !== 'undefined' && !(process.env.NODE_ENV === 'production' && !process.env.VERCEL)) {
  initializeFirebase();
}

// Export safe getter functions
export const getFirebaseAuth = () => {
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }
  if (!auth) {
    // Initialize asynchronously but return current auth state
    initializeFirebase();
  }
  return auth || null;
};

export const getFirebaseApp = () => {
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }
  if (!app) {
    // Initialize asynchronously but return current app state
    initializeFirebase();
  }
  return app || null;
};

// Legacy exports for backward compatibility
export { auth };
export default app;
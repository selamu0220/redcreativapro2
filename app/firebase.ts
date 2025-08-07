// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

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

if (typeof window !== 'undefined') {
  // Initialize Firebase
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
}

export { auth };
export default app;
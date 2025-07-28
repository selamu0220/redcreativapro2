// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (optional)
// export const analytics = getAnalytics(app);

export default app;
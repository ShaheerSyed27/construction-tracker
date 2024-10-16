import { initializeApp, getApps, getApp } from "firebase/app"; // Import getApps and getApp correctly
import { getAuth } from "firebase/auth"; // Use getAuth
import { getFirestore } from "firebase/firestore"; // Firestore for database
import { getStorage } from "firebase/storage"; // Storage for file uploads

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAEuHdllbFn9eYPlXU_L2xgsH86kQnDQog",
  authDomain: "duplex-brothers.firebaseapp.com",
  projectId: "duplex-brothers",
  storageBucket: "duplex-brothers.appspot.com",
  messagingSenderId: "1094347599238",
  appId: "1:1094347599238:web:be65d1842d78bb67e39007",
  measurementId: "G-S0200Z5BHL"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services for use throughout your app
export const auth = getAuth(app);  // Export Auth instance
export const db = getFirestore(app); // Export Firestore instance
export const storage = getStorage(app); // Export Storage instance

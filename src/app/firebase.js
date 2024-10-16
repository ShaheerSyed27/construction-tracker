// src/app/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Use getAuth instead of auth
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAEuHdl1bFn9eYP1XU_L2xgsH86kQnDQog",
  authDomain: "duplex-brothers.firebaseapp.com",
  projectId: "duplex-brothers",
  storageBucket: "duplex-brothers.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghij1234567"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the Firebase services
export const auth = getAuth(app);  // Correct export of auth
export const db = getFirestore(app);
export const storage = getStorage(app);

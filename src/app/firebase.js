// src/app/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Use getAuth instead of auth
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the Firebase services
export const auth = getAuth(app);  // Correct export of auth
export const db = getFirestore(app);
export const storage = getStorage(app);

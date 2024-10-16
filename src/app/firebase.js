// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAEuHdllbFn9eYPlXU_L2xgsH86kQnDQog",
    authDomain: "duplex-brothers.firebaseapp.com",
    projectId: "duplex-brothers",
    storageBucket: "duplex-brothers.appspot.com",
    messagingSenderId: "1094347599238",
    appId: "1:1094347599238:web:be65d1842d78bb67e39007",
    measurementId: "G-S0200Z5BHL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


//Console log for firebase configuration
import { initializeApp } from "firebase/app";
console.log("Firebase initialized!");
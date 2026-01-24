import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * ZENTUM CLOUD INFRASTRUCTURE
 * Firebase Configuration for Production
 */
const firebaseConfig = {
  apiKey: "AIzaSyB9LjgsycLjV_QZqJ5ZFpn9SOWB7niBuMY",
  authDomain: "zentum-5dee9.firebaseapp.com",
  projectId: "zentum-5dee9",
  storageBucket: "zentum-5dee9.firebasestorage.app",
  messagingSenderId: "513821176707",
  appId: "1:513821176707:web:09e4c480c5b6ba4c0b7cb6",
  measurementId: "G-EZ4Z5Y4Q6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services to be used in AuthService
export const auth = getAuth(app);
export const db = getFirestore(app);
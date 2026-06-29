// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClVEexjHJaN1TOl_t3j1LJMIIWSAKTOPM",
  authDomain: "cafewebsite-dd487.firebaseapp.com",
  projectId: "cafewebsite-dd487",
  storageBucket: "cafewebsite-dd487.firebasestorage.app",
  messagingSenderId: "960205199767",
  appId: "1:960205199767:web:4735fca2cabdabf3390cd2",
  measurementId: "G-NS2FBDHQV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
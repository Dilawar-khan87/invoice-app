// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBwh2nF92VcGICmwYLfqr1wqzAP0yAhcq4",
  authDomain: "fir-course-51a87.firebaseapp.com",
  projectId: "fir-course-51a87",
  storageBucket: "fir-course-51a87.firebasestorage.app",
  messagingSenderId: "699344518394",
  appId: "1:699344518394:web:b0b885318972ac93e99d43",
  measurementId: "G-NDG4J3MJ53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db ,storage ,app};

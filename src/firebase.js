import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpDjAFt1eSOm9s3N_gmbbFIyVuYEEl-yk",
  authDomain: "memory-wars-9ca34.firebaseapp.com",
  projectId: "memory-wars-9ca34",
  storageBucket: "memory-wars-9ca34.firebasestorage.app",
  messagingSenderId: "1018375654232",
  appId: "1:1018375654232:web:3e0f115931c4786abab32d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Configurazione Firebase - SOSTITUISCI CON LA TUA
const firebaseConfig = {
  apiKey: "AIzaSyBjiGKmFD_v1wcb1IGQRgrOD0z1TT6qG2s",
  authDomain: "ar-ad-hunter.firebaseapp.com",
  projectId: "ar-ad-hunter",
  storageBucket: "ar-ad-hunter.firebasestorage.app",
  messagingSenderId: "5669791063",
  appId: "1:5669791063:web:464167203abfa5eb4d0a12",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
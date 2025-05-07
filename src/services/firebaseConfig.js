import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY_PRESENCA,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_PRESENCA,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_PRESENCA,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_PRESENCA,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_PRESENCA,
  appId: process.env.REACT_APP_FIREBASE_APP_ID_PRESENCA,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_PRESENCA
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firestore = getFirestore(app);
export { app };

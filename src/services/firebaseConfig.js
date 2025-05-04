import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAP78f9cvgxaTvVk8zab-gh8jEh2SH7cP8",
  authDomain: "presenca-ccbe9.firebaseapp.com",
  projectId: "presenca-ccbe9",
  storageBucket: "presenca-ccbe9.appspot.com",
  messagingSenderId: "235935148770",
  appId: "1:235935148770:web:d9f1edc07752ce7342ccbb",
  measurementId: "G-ZE4SNWLL7H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firestore = getFirestore(app);
export { app };
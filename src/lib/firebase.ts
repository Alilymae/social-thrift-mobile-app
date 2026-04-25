import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6KWQutu9JjVbzvJVzkIvdHAcSlDbskdY",
  authDomain: "creative-incu.firebaseapp.com",
  projectId: "creative-incu",
  storageBucket: "creative-incu.firebasestorage.app",
  messagingSenderId: "148158005494",
  appId: "1:148158005494:web:2f987b3f744fcd7bdd2cd7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAG_Snx6NYWTRpHPRdxT7HXdKh0V3YIElo",
  authDomain: "bookstorage-13e64.firebaseapp.com",
  projectId: "bookstorage-13e64",
  storageBucket: "bookstorage-13e64.firebasestorage.app",
  messagingSenderId: "246640017643",
  appId: "1:246640017643:web:6f90ebff4ea8cafa3cbeae",
  measurementId: "G-2556VX6K9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Use Firestore for custom Name + 4-digit PIN authentication
export const db = getFirestore(app);

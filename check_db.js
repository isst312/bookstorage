import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAG_Snx6NYWTRpHPRdxT7HXdKh0V3YIElo",
  authDomain: "bookstorage-13e64.firebaseapp.com",
  projectId: "bookstorage-13e64",
  storageBucket: "bookstorage-13e64.firebasestorage.app",
  messagingSenderId: "246640017643",
  appId: "1:246640017643:web:6f90ebff4ea8cafa3cbeae",
  measurementId: "G-2556VX6K9D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const users = await getDocs(collection(db, 'users'));
  console.log("--- USERS ---");
  users.forEach(d => console.log(d.id, d.data()));

  const books = await getDocs(collection(db, 'books'));
  console.log("--- BOOKS ---");
  books.forEach(d => console.log(d.id, d.data().userName, d.data().title));
}

check().catch(console.error);

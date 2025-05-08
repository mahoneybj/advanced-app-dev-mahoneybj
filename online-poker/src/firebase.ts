// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvNV-iypgnKOw63EyXgDieA0eFiElovI0",
  authDomain: "online-poker-b9091.firebaseapp.com",
  projectId: "online-poker-b9091",
  storageBucket: "online-poker-b9091.firebasestorage.app",
  messagingSenderId: "390019959912",
  appId: "1:390019959912:web:c51a09d0816f4a10e33fdd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ 
    tabManager: persistentMultipleTabManager()
  })
});

if (process.env.NODE_ENV === "development") {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export { db };
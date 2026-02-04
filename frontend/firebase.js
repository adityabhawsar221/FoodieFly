// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "foodiefly-dc03c.firebaseapp.com",
  projectId: "foodiefly-dc03c",
  storageBucket: "foodiefly-dc03c.firebasestorage.app",
  messagingSenderId: "358767630316",
  appId: "1:358767630316:web:0d78494f24667fe16b52c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {auth , app};
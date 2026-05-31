// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzZa1GiQXX-bb4XwJ4lsM-iZxxglN4oxE",
  authDomain: "tp-inf438.firebaseapp.com",
  projectId: "tp-inf438",
  storageBucket: "tp-inf438.firebasestorage.app",
  messagingSenderId: "456317696702",
  appId: "1:456317696702:web:e302c7aa3139e3b8273cef",
  measurementId: "G-2L75FT33QN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
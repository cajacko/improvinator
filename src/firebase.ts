// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, set } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3-nVx_TDNVYRJjjS0mxzDSc58VZtYG8A",
  authDomain: "improvinator-c8cc5.firebaseapp.com",
  projectId: "improvinator-c8cc5",
  storageBucket: "improvinator-c8cc5.appspot.com",
  messagingSenderId: "978682372782",
  appId: "1:978682372782:web:041a4983d561aa9a73c33f",
  measurementId: "G-8XHJ54L2B1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(
  app,
  "https://improvinator-c8cc5-default-rtdb.europe-west1.firebasedatabase.app"
);

const testRef = ref(database, "/test");

onValue(testRef, (snapshot) => {
  const data = snapshot.val();

  if (data === null) {
    set(testRef, { value: true });
  }

  console.log("data", data);
});

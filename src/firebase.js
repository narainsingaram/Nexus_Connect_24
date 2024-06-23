// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr-DoFj8GJD7d5YpNmmTsshwVSeGX5R8Q",
  authDomain: "crud-fbla.firebaseapp.com",
  projectId: "crud-fbla",
  storageBucket: "crud-fbla.appspot.com",
  messagingSenderId: "953862107140",
  appId: "1:953862107140:web:77cb19b76557f7efec8551"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const storage = getStorage(app);
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyCsQIG9D3RayftfIIV-rtP_RUZOFlX6Ev4", 
  authDomain: "fitvibe-46710.firebaseapp.com",
  projectId: "fitvibe-46710",
  storageBucket: "fitvibe-46710.appspot.com", 
  messagingSenderId: "208670780495",
  appId: "1:208670780495:web:ff3d12340121695c5f4e3a",
  measurementId: "G-VR3NC1DM13"
};

//Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Export Firebase services
export { auth, db };

import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCsQIG9D3RayftfIIV-rtP_RUZOFlX6Ev4",
  authDomain: "fitvibe-46710.firebaseapp.com",
  projectId: "fitvibe-46710",
  storageBucket: "fitvibe-46710.firebasestorage.app",
  messagingSenderId: "208670780495",
  appId: "1:208670780495:web:ff3d12340121695c5f4e3a",
  measurementId: "G-VR3NC1DM13",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

//Use AsyncStorage for auth persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services
export { auth, db, storage };

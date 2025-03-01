import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "./firebase"; 
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user details from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          await AsyncStorage.setItem("user", JSON.stringify(userData)); // Store user data locally
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem("user"); // Remove user data when logged out
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const register = async (email, password, fullName) => {
    try {
      console.log("Attempting to register user:", email, fullName);
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
  
      console.log("Firebase Auth User Created:", firebaseUser.uid);
  
      console.log("Checking if Firestore write is allowed...");
      
      const userData = {
        uid: firebaseUser.uid,
        fullName: fullName,
        email: firebaseUser.email,
        createdAt: Timestamp.now(),
      };
      
      console.log("Attempting to save user to Firestore...");
      
      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      console.log("User successfully saved in Firestore:", userData);
      
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

    } catch (error) {
      console.error("Registration error:", error.message);
      throw error;
    }
  };

  // Login and fetch user details
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user details from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData)); // Save user locally
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem("user"); // Remove from local storage
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use Authentication context
export const useAuth = () => useContext(AuthContext);

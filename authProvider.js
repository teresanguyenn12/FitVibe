import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { registerUser, loginUser, logoutUser } from "./api/authApi";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const createUserDoc = async (userId, fullName, email) => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      fullName,
      email,
      activeChallenges: [],
      completedChallenges: [],
      createdAt: new Date(),
    });
  };
  useEffect(() => {
    const handleAuthChange = async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            await AsyncStorage.setItem("user", JSON.stringify(userData));
          } else {
            console.error("User document not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user from Firestore:", error);
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem("user");
      }
      setIsLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);
    return () => unsubscribe();
  }, []);

  const register = async (email, password, fullName, extraData = {}) => {
    await registerUser(email, password, fullName, extraData);
  };

  const login = async (email, password) => {
    await loginUser(email, password);
  };

  const logout = async () => {
    await logoutUser();
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

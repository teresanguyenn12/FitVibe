import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
    });

    return () => unsubscribe();
  }, []);

  const register = async (email, password, fullName, extraData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userData = {
      uid: firebaseUser.uid,
      fullName,
      email: firebaseUser.email,
      username: extraData.username || "",
      dob: extraData.dob || null,
      gender: extraData.gender || "",
      phone: extraData.phone || "",
      profilePicture: extraData.profilePicture || "",
      followers: [],
      following: [],
      completedChallenges: 0,
      burnedCalories: 0,
      completedWorkouts: 0,
      showcasedGoals: [],
      posts: [],
      fitCoins: 100,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userData);
    setJustSignedUp(true);
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } else {
      console.error("Firestore user document not found!");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, register, login, logout, isLoading, justSignedUp, setJustSignedUp }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

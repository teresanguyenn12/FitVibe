import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  Timestamp
} from "firebase/firestore";

export const registerUser = async (email, password, fullName, extraData = {}) => {
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
  return userData;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
  return userDoc.exists() ? userDoc.data() : null;
};

export const logoutUser = async () => {
  await signOut(auth);
};

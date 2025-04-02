// Adds a challenge to user's activeChallenges array in Firestore

import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

export const joinChallenge = async (userId, challengeId) => {
  const userRef = doc(db, "users", userId);

  try {
    await updateDoc(userRef, {
      activeChallenges: arrayUnion(challengeId),
    });
    console.log(" Challenge added to activeChallenges");
  } catch (err) {
    console.error(" Error joining challenge:", err);
  }
};
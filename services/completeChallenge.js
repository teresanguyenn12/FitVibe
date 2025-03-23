import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase"; 

export const completeChallenge = async (userId, challengeId) => {
  const userRef = doc(db, "users", userId);

  try {
    await updateDoc(userRef, {
      activeChallenges: arrayRemove(challengeId),
      completedChallenges: arrayUnion(challengeId),
    });
    console.log(" Challenge moved to completedChallenges");
  } catch (err) {
    console.error(" Error completing challenge:", err);
  }
};

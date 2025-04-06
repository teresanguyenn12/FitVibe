import { db } from "../firebase";
import { auth } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment,
} from "firebase/firestore";

/**
 * Fetches all available challenges from Firestore.
 * @returns {Promise<Array>} - Array of challenge objects.
 */
export const fetchChallenges = async () => {
  try {
    const challengesCollection = collection(db, "challenges");
    const challengesSnapshot = await getDocs(challengesCollection);
    return challengesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return [];
  }
};

/**
 * Fetch completed challenges for the current user.
 * @returns {Promise<Array>} - Array of completed challenge IDs.
 */
export const fetchCompletedChallenges = async () => {
  console.log("Running fetchCompletedChallenges...");
  const user = auth.currentUser;
  if (!user) {
    console.log("No user logged in");
    return [];
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().completedChallenges) {
      return userDoc.data().completedChallenges;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching completed challenges:", error);
    return [];
  }
};

/**
 * Marks a challenge as completed and removes it from activeChallenges.
 * @param {string} challengeId - The ID of the completed challenge.
 */
export const markChallengeAsCompleted = async (challengeId) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in. Cannot update completed challenges.");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    await updateDoc(userRef, {
      activeChallenges: arrayRemove(challengeId),
      completedChallenges: arrayUnion(challengeId),
      [`challengeProgress.${challengeId}.lastUpdated`]: serverTimestamp(),
    });
    console.log(`Challenge ${challengeId} marked as completed!`);
  } catch (error) {
    console.error("Error updating completed challenges:", error);
  }
};

/**
 * Updates the user's challenge progress (distance, duration).
 * @param {string} challengeId - The ID of the challenge.
 * @param {number} miles - Number of miles to add.
 * @param {number} minutes - Number of minutes to add.
 */
export const updateChallengeProgress = async (challengeId, miles = 0, minutes = 0) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in. Cannot update progress.");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    await updateDoc(userRef, {
      [`challengeProgress.${challengeId}.distance`]: increment(miles),
      [`challengeProgress.${challengeId}.duration`]: increment(minutes),
      [`challengeProgress.${challengeId}.lastUpdated`]: serverTimestamp(),
    });

    console.log(`Progress updated for ${challengeId}: +${miles} mi, +${minutes} min`);
  } catch (error) {
    console.error("Error updating challenge progress:", error);
  }
};

/**
 * Adds a new challenge to the user's activeChallenges and initializes progress.
 * Also adds the user to the challenge's participants list.
 * @param {string} challengeId - The ID of the challenge to join.
 */
export const joinChallenge = async (challengeId) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in. Cannot join challenge.");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const challengeRef = doc(db, "challenges", challengeId);

  try {
    // Add to user's active challenges and initialize progress
    await setDoc(
      userRef,
      {
        activeChallenges: arrayUnion(challengeId),
        challengeProgress: {
          [challengeId]: {
            distance: 0,
            duration: 0,
            startedAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          },
        },
      },
      { merge: true }
    );

    // Add user to challenge participants
    await updateDoc(challengeRef, {
      participants: arrayUnion(user.uid),
    });

    console.log(`Challenge ${challengeId} joined by user ${user.uid}`);
  } catch (error) {
    console.error("Error joining challenge:", error);
  }
};

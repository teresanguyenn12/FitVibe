import { db } from "../firebase";  
import { collection, doc, getDoc, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { auth } from "../firebase";  

/**
 * Fetches all available challenges from Firestore.
 * @returns {Promise<Array>} - Array of challenge objects.
 */
export const fetchChallenges = async () => {
  try {
    const challengesCollection = collection(db, "challenges"); // Reference to challenges collection
    const challengesSnapshot = await getDocs(challengesCollection);
    const challengesList = challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return challengesList;
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return [];
  }
};

/**
 * Fetch completed challenges for the current user.
 * @returns {Promise<Array>} - Array of completed challenge IDs
 */
export const fetchCompletedChallenges = async () => {
  console.log(" Running fetchCompletedChallenges..."); //  Debugging log

  const user = auth.currentUser;
  if (!user) {
    console.log(" No user logged in");
    return [];
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().completedChallenges) {
      console.log(" Completed Challenges from Firestore:", userDoc.data().completedChallenges);
      return userDoc.data().completedChallenges; // Return array of challenge IDs
    } else {
      console.log("⚠️ No completed challenges found.");
      return [];
    }
  } catch (error) {
    console.error(" Error fetching completed challenges:", error);
    return [];
  }
};

/**
 * Function to mark a challenge as completed for a user.
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
      completedChallenges: arrayUnion(challengeId), // Add challenge ID to completed array
    });
    console.log(`Challenge ${challengeId} marked as completed!`);
  } catch (error) {
    console.error("Error updating completed challenges:", error);
  }
};

/**
 * Function to update a user's progress in a challenge.
 * @param {string} challengeId - The ID of the challenge.
 * @param {number} progress - Updated progress value.
 * @returns {Promise<void>}
 */
export const updateChallengeProgress = async (challengeId, progress) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in. Cannot update progress.");
    return;
  }

  const challengeRef = doc(db, "challenges", challengeId);

  try {
    await updateDoc(challengeRef, {
      [`progress.${user.uid}`]: progress, // Update the user's progress
    });

    console.log(`User ${user.uid} progress updated to ${progress}`);
  } catch (error) {
    console.error("Error updating challenge progress:", error);
    throw error;
  }
};

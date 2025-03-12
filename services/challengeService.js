import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase"; 

/**
 * Function to create a new challenge.
 * @param {Object} challengeData - Challenge details (name, duration, etc.)
 * @returns {Promise<string>} - Returns challenge ID if successful
 */
export const createChallenge = async (challengeData) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in. Cannot create challenge.");
    return null;
  }

  try {
    const challengeRef = await addDoc(collection(db, "challenges"), {
      ...challengeData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      participants: [user.uid], // Creator automatically joins
      progress: { [user.uid]: 0 }, // Initialize progress for the creator
    });

    console.log("Challenge created with ID:", challengeRef.id);
    return challengeRef.id; // Return challenge ID for navigation
  } catch (error) {
    console.error("Error creating challenge:", error);
    throw error;
  }
};

/**
 * Function to join a challenge.
 * @param {string} challengeId - The ID of the challenge to join.
 * @returns {Promise<void>}
 */
export const joinChallenge = async (challengeId) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in. Cannot join challenge.");
    return;
  }

  const challengeRef = doc(db, "challenges", challengeId);

  try {
    await updateDoc(challengeRef, {
      participants: arrayUnion(user.uid), // Add user to participants array
      [`progress.${user.uid}`]: 0, // Initialize progress for the user
    });

    console.log(`User ${user.uid} successfully joined the challenge!`);
  } catch (error) {
    console.error("Error joining challenge:", error);
    throw error;
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

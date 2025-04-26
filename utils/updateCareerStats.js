import { doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Generic updater for specific career stat fields.
 * @param {string} uid  
 * @param {object} updates 
 */
export async function updateCareerStats(uid, updates = {}) {
  if (!uid || typeof updates !== "object") return;
  const userRef = doc(db, "users", uid);

  const updatePayload = {};
  for (const [key, value] of Object.entries(updates)) {
    updatePayload[key] = increment(value);
  }

  await updateDoc(userRef, updatePayload);
}

/**
 * Updates career stats based on type (challenge or workout).
 * @param {string} userId - The user's ID.
 * @param {"challenge" | "workout" | "run" | "walk"} type - The type of update.
 * @param {object} data - Data relevant to the update (e.g., challenge id, xp, calories).
 */
export async function updateCareerStatByType(userId, type, data) {
  const userRef = doc(db, "users", userId);

  switch (type) {
    case "challenge": {
      const challengeId = data.id;
      const xpReward = data.xp || 100;
      const caloriesBurned = data.calories || 0;

      const updatePayload = {
        completedChallenges: increment(1),
        xp: increment(xpReward),
        burnedCalories: increment(caloriesBurned),
        challenges: increment(1), // <-- add +1 challenge
        [`challengeProgress.${challengeId}.lastUpdated`]: serverTimestamp(),
      };

      if (data.removeFromActive) {
        updatePayload.activeChallenges = increment(-1);
      }

      await updateDoc(userRef, updatePayload);
      break;
    }

    case "workout": {
      const caloriesBurned = data.calories || 0;
      await updateDoc(userRef, {
        workouts: increment(1),
        burnedCalories: increment(caloriesBurned),
      });
      break;
    }

    case "run":
    case "walk": {
        const caloriesBurned = data.calories || 0;
        await updateDoc(userRef, {
            burnedCalories: increment(caloriesBurned),
        });
        break;
    }


    default:
      console.warn("Unknown career stat type:", type);
  }
}

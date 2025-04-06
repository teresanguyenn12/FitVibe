import { db } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";
import { predefinedChallenges } from "./predefinedChallenges";

// Convert distance string to miles (e.g., "5 kilometers" → 3.1)
const parseDistanceToMiles = (distanceStr) => {
  if (!distanceStr) return null;
  const lower = distanceStr.toLowerCase();

  if (lower.includes("mile")) {
    const match = lower.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  } else if (lower.includes("kilometer") || lower.includes("km")) {
    const match = lower.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) * 0.621371 : null;
  } else if (lower.includes("meter")) {
    const match = lower.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) / 1609.34 : null;
  }

  return null;
};

// Convert duration string to minutes (e.g., "2 hours" → 120)
const parseDurationToMinutes = (durationStr) => {
  if (!durationStr) return null;
  const lower = durationStr.toLowerCase();

  if (lower.includes("hour")) {
    const match = lower.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) * 60 : null;
  } else if (lower.includes("minute")) {
    const match = lower.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  } else if (lower.includes("day")) {
    const match = lower.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) * 24 * 60 : null;
  }

  return null;
};

export const seedChallenges = async () => {
  try {
    for (const challenge of predefinedChallenges) {
      const id = challenge.id || challenge.name.toLowerCase().replace(/\s+/g, "-");

      const distanceGoal = parseDistanceToMiles(challenge.distance);
      const durationGoal = parseDurationToMinutes(challenge.duration);

      const challengeRef = doc(db, "challenges", id);
      await setDoc(challengeRef, {
        ...challenge,
        distanceGoal,   // in miles
        durationGoal,   // in minutes
        participants: [],
      });

      console.log(`Seeded: ${challenge.name}`);
    }

    console.log(" All challenges seeded successfully.");
  } catch (error) {
    console.error(" Error seeding challenges:", error);
  }
};

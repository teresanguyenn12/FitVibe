import { db } from "../../firebase"; 
import { setDoc, doc } from "firebase/firestore";
import { predefinedChallenges } from "./predefinedChallenges"; 

export const seedChallenges = async () => {
  try {
    for (const challenge of predefinedChallenges) {
      const id = challenge.name.toLowerCase().replace(/\s+/g, "-"); // create ID from name
      const challengeRef = doc(db, "challenges", id);
      await setDoc(challengeRef, {
        ...challenge,
        participants: [],
        progress: {}
      });
      console.log(`Seeded: ${challenge.name}`);
    }
    console.log(" All challenges seeded successfully.");
  } catch (error) {
    console.error(" Error seeding challenges:", error);
  }
};

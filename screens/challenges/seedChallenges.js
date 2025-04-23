// seedChallenges.js
import { db } from "../../firebase";
import {
  setDoc, doc, getDoc, getDocs, collection, serverTimestamp, addDoc
} from "firebase/firestore";
import { predefinedChallenges } from "./predefinedChallenges";

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

export const seedChallengesAndInvites = async () => {
  console.log(" Seeding script triggered...");
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userDocs = usersSnapshot.docs;

    if (userDocs.length < 3) {
      console.warn(" Not enough users to seed data.");
      return;
    }

    const FROM_USER_ID = userDocs[0].id;
    const TO_USER_IDS = [userDocs[1].id, userDocs[2].id];

    for (const challenge of predefinedChallenges) {
      const id = challenge.id || challenge.name?.toLowerCase().replace(/\s+/g, "-");

      const challengeRef = doc(db, "challenges", id);
      const inviteRef = doc(db, "groupChallengeInvites", `${id}_${FROM_USER_ID}`);
      const chatroomRef = doc(db, "chatrooms", `${id}_${FROM_USER_ID}`);

      const challengeExists = await getDoc(challengeRef);
      const inviteExists = await getDoc(inviteRef);
      const chatroomExists = await getDoc(chatroomRef);

      if (challengeExists.exists() || inviteExists.exists() || chatroomExists.exists()) {
        console.log(`⚠️ Skipping existing challenge/invite/chatroom: ${id}`);
        continue;
      }

      const distanceGoal = parseDistanceToMiles(challenge.distance);
      const durationGoal = parseDurationToMinutes(challenge.duration);
      const acceptedUserIds = [TO_USER_IDS[0]];

      await setDoc(challengeRef, {
        ...challenge,
        distanceGoal,
        durationGoal,
        createdBy: FROM_USER_ID,
        participants: [FROM_USER_ID, ...acceptedUserIds],
      });

      const challengeLabel = challenge.name || challenge.title || challenge.id || "Fitness Challenge";

      await setDoc(inviteRef, {
        challengeId: id,
        fromUserId: FROM_USER_ID,
        toUserIds: TO_USER_IDS,
        message: `Join me in the "${challengeLabel}" challenge!`,
        status: "pending",
        createdAt: serverTimestamp(),
        acceptedUserIds,
      });

      await setDoc(chatroomRef, {
        id: `${id}_${FROM_USER_ID}`,
        participants: [FROM_USER_ID, ...TO_USER_IDS],
        challengeId: id,
        type: "challenge",
        lastMessage: `Welcome to the "${challengeLabel}" challenge!`,
        lastMessageTime: serverTimestamp(),
      });

      const messagesRef = collection(db, "chatrooms", `${id}_${FROM_USER_ID}`, "messages");

      await addDoc(messagesRef, {
        senderId: FROM_USER_ID,
        text: `Welcome to the "${challengeLabel}" challenge! Let's crush it!`,
        timestamp: serverTimestamp(),
        type: "text",
      });

      await addDoc(messagesRef, {
        senderId: TO_USER_IDS[0],
        text: "I'm in! Let’s do this 💪",
        timestamp: serverTimestamp(),
        type: "text",
      });

      await addDoc(messagesRef, {
        senderId: TO_USER_IDS[1],
        text: "Excited to start tomorrow!",
        timestamp: serverTimestamp(),
        type: "text",
      });

      console.log(` Seeded: ${challengeLabel}`);
    }

    console.log(" All challenges and invites seeded successfully.");
  } catch (error) {
    console.error(" Error seeding:", error);
  }
};
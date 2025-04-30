import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import axios from "axios";

const db = getFirestore();
const auth = getAuth();

const APP_ID = 29298;
const NOTIFY_API_KEY = "u04gYyaVKbAobwZ9ojzShp";

// Fetch all users except the current one
export const fetchAllUsers = async () => {
  const currentUser = auth.currentUser;
  const usersSnapshot = await getDocs(collection(db, "users"));
  const userList = [];
  const followingMap = {};

  for (const docSnap of usersSnapshot.docs) {
    const data = docSnap.data();
    const userId = docSnap.id;

    if (userId !== currentUser.uid) {
      userList.push({ id: userId, ...data });
      followingMap[userId] = data.followers?.includes(currentUser.uid) || false;
    }
  }

  return { userList, followingMap };
};

// Fetch a single user by UID
export const fetchUserById = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

// Follow user: sends follow request for private, or follows directly for public
export const followUser = async (targetUserId) => {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid === targetUserId) return;

  try {
    const currentUserRef = doc(db, "users", currentUser.uid);
    const targetUserRef = doc(db, "users", targetUserId);

    const [currentSnap, targetSnap] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(targetUserRef),
    ]);

    if (!currentSnap.exists() || !targetSnap.exists()) return;

    const currentUserData = currentSnap.data();
    const targetData = targetSnap.data();

    if (targetData.isPrivate) {
      // Private account — send request
      await updateDoc(targetUserRef, {
        pendingRequests: arrayUnion(currentUser.uid),
      });

      // Send notification with sender ID
      await axios.post("https://app.nativenotify.com/api/indie/notification", {
        subID: targetUserId,
        appId: APP_ID,
        appToken: NOTIFY_API_KEY,
        title: `${currentUserData.username || "Someone"} sent you a request`,
        message: `${currentUserData.username || "Someone"} wants to follow you`,
        sendbird_channel_url: currentUser.uid,           // for .sendbird_channel_url fallback
        pushData: JSON.stringify({ senderId: currentUser.uid })  // for .pushData.senderId
      });

      console.log("✅ Follow request sent to:", targetUserId);
    } else {
      // 🔓 Public account — follow immediately
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId),
      });
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUser.uid),
      });
    }
  } catch (error) {
    console.error("❌ Error in followUser:", error);
  }
};

// Unfollow user: removes from following & their followers
export const unfollowUser = async (targetUserId) => {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid === targetUserId) return;

  try {
    const currentUserRef = doc(db, "users", currentUser.uid);
    const targetUserRef = doc(db, "users", targetUserId);

    await Promise.all([
      updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId),
      }),
      updateDoc(targetUserRef, {
        followers: arrayRemove(currentUser.uid),
        pendingRequests: arrayRemove(currentUser.uid),
      }),
    ]);
  } catch (error) {
    console.error("❌ Error in unfollowUser:", error);
  }
};

// Accept follow request
export const acceptFollowRequest = async (requesterId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const currentRef = doc(db, "users", currentUser.uid);
  const requesterRef = doc(db, "users", requesterId);

  await updateDoc(currentRef, {
    followers: arrayUnion(requesterId),
    pendingRequests: arrayRemove(requesterId),
  });

  await updateDoc(requesterRef, {
    following: arrayUnion(currentUser.uid),
  });
};

// Decline follow request
export const rejectFollowRequest = async (requesterId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const currentRef = doc(db, "users", currentUser.uid);

  await updateDoc(currentRef, {
    pendingRequests: arrayRemove(requesterId),
  });
};

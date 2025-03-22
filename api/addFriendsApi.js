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
  
  const db = getFirestore();
  const auth = getAuth();
  
  //Fetch all users except the current one
  export const fetchAllUsers = async () => {
    const currentUser = auth.currentUser;
    const usersSnapshot = await getDocs(collection(db, "users"));
    const userList = [];
    const followingMap = {};
  
    for (const docSnap of usersSnapshot.docs) {
      const data = docSnap.data();
      const userId = docSnap.id;
  
      // Skip current user
      if (userId !== currentUser.uid) {
        userList.push({ id: userId, ...data });
  
        // Is current user following this one?
        followingMap[userId] = data.followers?.includes(currentUser.uid) || false;
      }
    }
  
    return { userList, followingMap };
  };
  
  //Fetch a single user by UID
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
  
  //Follow user: add target to my following & me to their followers
  export const followUser = async (targetUserId) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid === targetUserId) return;
  
    const currentUserRef = doc(db, "users", currentUser.uid);
    const targetUserRef = doc(db, "users", targetUserId);
  
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId),
    });
  
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUser.uid),
    });
  };
  
  //Unfollow user: remove target from my following & me from their followers
  export const unfollowUser = async (targetUserId) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid === targetUserId) return;
  
    const currentUserRef = doc(db, "users", currentUser.uid);
    const targetUserRef = doc(db, "users", targetUserId);
  
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId),
    });
  
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUser.uid),
    });
  };
  
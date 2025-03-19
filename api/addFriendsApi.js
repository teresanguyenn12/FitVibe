import { db } from "../firebase";
import {
    collection,
    getDocs,
    query,
    where,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const getCurrentUserId = () => {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
};

// Fetch all users from the database
export const fetchAllUsers = async () => {
    try {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) throw new Error("User not authenticated");

        // Fetch all users
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => user.id !== currentUserId); // Filter out current user

        // Get current user's following list
        const followingSnapshot = await getDocs(
            query(collection(db, "friends"), where("userId", "==", currentUserId))
        );

        // Create a map of user IDs to following status
        const followingMap = {};
        followingSnapshot.docs.forEach(doc => {
            const data = doc.data();
            followingMap[data.friendId] = true;
        });

        return { userList, followingMap };
    } catch (error) {
        console.error("Error fetching users: ", error);
        return { userList: [], followingMap: {} };
    }
};

// Fetch the current user's friends
export const fetchUserFriends = async () => {
    try {
        const userId = getCurrentUserId();
        if (!userId) throw new Error("User not authenticated");

        // Get the user's following list
        const friendsQuery = query(collection(db, "friends"), where("userId", "==", userId));
        const querySnapshot = await getDocs(friendsQuery);
        const friendIds = querySnapshot.docs.map(doc => doc.data().friendId);

        // If there are no friends, return empty array
        if (friendIds.length === 0) return [];

        // Get the user data for each friend
        const friendsData = [];
        for (const friendId of friendIds) {
            const userDoc = await getDoc(doc(db, "users", friendId));
            if (userDoc.exists()) {
                friendsData.push({
                    id: userDoc.id,
                    ...userDoc.data(),
                    following: true
                });
            }
        }

        return friendsData;
    } catch (error) {
        console.error("Error fetching user friends: ", error);
        return [];
    }
};

export const followUser = async (friendId) => {
    try {
        const userId = getCurrentUserId();
        if (!userId) throw new Error("User not authenticated");

        const friendsCollection = collection(db, "friends");

        // Check if already following (userId -> friendId)
        const checkQuery1 = query(friendsCollection, where("userId", "==", userId), where("friendId", "==", friendId));
        const checkSnapshot1 = await getDocs(checkQuery1);

        // Check if reverse relationship exists (friendId -> userId)
        const checkQuery2 = query(friendsCollection, where("userId", "==", friendId), where("friendId", "==", userId));
        const checkSnapshot2 = await getDocs(checkQuery2);

        if (checkSnapshot1.empty) {
            // Create both follow relationships
            await addDoc(friendsCollection, {
                userId,
                friendId,
                createdAt: serverTimestamp()
            });
        }

        if (checkSnapshot2.empty) {
            await addDoc(friendsCollection, {
                userId: friendId,
                friendId: userId,
                createdAt: serverTimestamp()
            });
        }

        return true;
    } catch (error) {
        console.error("Error following user: ", error);
        throw error;
    }
};


export const unfollowUser = async (friendId) => {
    try {
        const userId = getCurrentUserId();
        if (!userId) throw new Error("User not authenticated");

        const friendsCollection = collection(db, "friends");

        // Find and delete both relationships
        const friendshipQuery1 = query(friendsCollection, where("userId", "==", userId), where("friendId", "==", friendId));
        const friendshipQuery2 = query(friendsCollection, where("userId", "==", friendId), where("friendId", "==", userId));

        const querySnapshot1 = await getDocs(friendshipQuery1);
        const querySnapshot2 = await getDocs(friendshipQuery2);

        for (const docSnapshot of querySnapshot1.docs) {
            await deleteDoc(doc(friendsCollection, docSnapshot.id));
        }

        for (const docSnapshot of querySnapshot2.docs) {
            await deleteDoc(doc(friendsCollection, docSnapshot.id));
        }

        return true;
    } catch (error) {
        console.error("Error unfollowing user: ", error);
        throw error;
    }
};

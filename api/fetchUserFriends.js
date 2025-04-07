import {
    getFirestore,
    getDoc,
    getDocs,
    doc,
    collection,
    query,
    where
  } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  import { fetchUserById } from './addFriendsApi';
  
  const db = getFirestore();
  const auth = getAuth();
  
  export const fetchUserFriends = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];
  
    try {
      // Get current user's following list
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const followingIds = userData?.following || [];
  
      if (followingIds.length === 0) {
        return [];
      }
  
      // Get all existing private chatrooms
      const chatroomsRef = collection(db, 'chatrooms');
      const chatroomsQuery = query(
        chatroomsRef,
        where('participants', 'array-contains', currentUser.uid),
        where('type', '==', 'private')
      );
      const chatroomsSnapshot = await getDocs(chatroomsQuery);
  
      // Find users current user is already chatting with
      const chattingWith = new Set();
      chatroomsSnapshot.forEach((docSnap) => {
        const chat = docSnap.data();
        chat.participants.forEach((id) => {
          if (id !== currentUser.uid) {
            chattingWith.add(id);
          }
        });
      });
  
      // Filter out users already in a chatroom
      const availableFriends = [];
      for (const id of followingIds) {
        if (!chattingWith.has(id)) {
          const friend = await fetchUserById(id);
          if (friend) {
            availableFriends.push(friend);
          }
        }
      }
  
      return availableFriends;
    } catch (error) {
      console.error('Error fetching user friends:', error);
      return [];
    }
  };
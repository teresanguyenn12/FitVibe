import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function InviteFriendsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { challengeId } = route.params;
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFriends(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleInvite = async (friendId) => {
    try {
      const challengeRef = doc(db, "challenges", challengeId);
      await updateDoc(challengeRef, {
        participants: arrayUnion(friendId),
      });
      alert("Friend invited successfully!");
    } catch (error) {
      console.error("Error inviting friend:", error);
      alert("Failed to invite friend.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.friendItem} onPress={() => handleInvite(item.id)}>
            <Text style={styles.friendText}>{item.fullName || "User"}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 20 },
  friendItem: { backgroundColor: "#1E1E1E", padding: 15, borderRadius: 10, marginBottom: 10 },
  friendText: { color: "white", fontSize: 16 },
});

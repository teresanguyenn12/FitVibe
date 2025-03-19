import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function MyChallengesScreen() {
  const [challenges, setChallenges] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return;

      const challengesRef = collection(db, "challenges");
      const q = query(challengesRef, where("participants", "array-contains", user.uid));

      const snapshot = await getDocs(q);
      const joinedChallenges = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChallenges(joinedChallenges);
    };

    fetchChallenges();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Challenges</Text>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.challengeItem}>
            <Text style={styles.challengeText}>{item.name}</Text>
            <Text style={styles.progressText}>Progress: {item.progress[user.uid]}%</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 20 },
  challengeItem: { backgroundColor: "#1E1E1E", padding: 15, borderRadius: 10, marginBottom: 10 },
  challengeText: { color: "white", fontSize: 16 },
  progressText: { color: "#bbb", fontSize: 14, marginTop: 5 },
});

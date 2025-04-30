import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function MyChallengesScreen() {
  const navigation = useNavigation();
  const [challenges, setChallenges] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch user's challenge progress
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const challengeProgress = userData?.challengeProgress || {};

      // Fetch challenges where user is a participant
      const challengesRef = collection(db, "challenges");
      const q = query(challengesRef, where("participants", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      const joinedChallenges = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChallenges(joinedChallenges);
      setProgressMap(challengeProgress);
    };

    fetchData();
  }, [user]);

  const calculateProgress = (challenge) => {
    const progress = progressMap[challenge.id];
    if (!progress) return "0%";

    const distancePct = challenge.distanceGoal
      ? (progress.distance / challenge.distanceGoal) * 100
      : 0;

    const durationPct = challenge.durationGoal
      ? (progress.duration / challenge.durationGoal) * 100
      : 0;

    const pct = Math.max(distancePct, durationPct);
    return `${Math.min(100, pct.toFixed(0))}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>My Challenges</Text>
      </View>

      {challenges.length === 0 ? (
        <Text style={styles.noChallengesText}>
          You haven't joined any challenges yet.
        </Text>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.challengeItem}
              onPress={() =>
                navigation.navigate("MyChallengeInfoScreen", {
                  challenge: item,
                })
              }
            >
              <Text style={styles.challengeText}>{item.name}</Text>
              <Text style={styles.progressText}>
                Progress: {calculateProgress(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#131417",
  },

  headerRow: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 50,
    marginTop: 50,
    marginBottom: 20,
  },

  backButton: {
    zIndex: 2,
    padding: 6,
  },

  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    zIndex: 0,
  },

  challengeItem: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  challengeText: {
    color: "white",
    fontSize: 16,
  },

  progressText: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 5,
  },

  noChallengesText: {
    color: "#bbb",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

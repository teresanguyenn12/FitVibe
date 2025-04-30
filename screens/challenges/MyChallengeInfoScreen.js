import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function MyChallengeDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { challenge } = route.params || {};
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;

  const fetchProgress = async () => {
    if (!uid || !challenge?.id) return;

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData?.challengeProgress?.[challenge.id]) {
      setProgress(userData.challengeProgress[challenge.id]);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProgress();
    }, [uid, challenge?.id])
  );

  const formatMinutes = (min) => {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60);
    return `${h}h ${m}m`;
  };

  const calculateProgress = () => {
    if (!progress || (!challenge?.distanceGoal && !challenge?.durationGoal))
      return "0%";

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
      <LinearGradient colors={["#5A1A9B", "#1A4A80"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{challenge.name}</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{calculateProgress()} complete</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#A0006D" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Distance:</Text>
            <Text style={styles.statValue}>
              {(progress?.distance ?? 0).toFixed(2)} / {challenge.distanceGoal ?? "?"} mi
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Duration:</Text>
            <Text style={styles.statValue}>
              {formatMinutes(progress?.duration ?? 0)} /{" "}
              {formatMinutes(challenge.durationGoal ?? 0)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    padding: 6,
    backgroundColor: "#00000066",
    borderRadius: 20,
    zIndex: 99,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  progressBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    marginTop: 10,
  },
  progressText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
  },
  card: {
    backgroundColor: "#2B2D31",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ccc",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

// Detail Info of User's active challenges
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>



      <Text style={styles.title}>{challenge.name}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#A0006D" />
      ) : (
        <>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Progress:</Text> {calculateProgress()}
          </Text>

          <Text style={styles.detailText}>
            <Text style={styles.bold}>Distance:</Text>{" "}
            {(progress?.distance ?? 0).toFixed(2)} / {challenge.distanceGoal ?? "?"} mi
          </Text>

          <Text style={styles.detailText}>
            <Text style={styles.bold}>Duration:</Text>{" "}
            {formatMinutes(progress?.duration ?? 0)} / {formatMinutes(challenge.durationGoal ?? 0)}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  backButton: { marginBottom: 20 },
  backText: { color: "#A0006D", fontSize: 18, fontWeight: "bold" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    color: "#bbb",
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
    color: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 999,
    backgroundColor: "#00000088",
    padding: 6,
  },
  
});

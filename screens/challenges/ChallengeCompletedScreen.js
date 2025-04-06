import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { doc, increment, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getBadgeByXP } from "../../utils/badgeUtils"; 

export default function ChallengeCompletedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { challenge } = route.params;
  const user = auth.currentUser;

  const [xpAmount, setXpAmount] = useState(0);
  const [userXP, setUserXP] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (challenge?.reward) {
      const match = challenge.reward.match(/(\d+)/);
      if (match) {
        setXpAmount(parseInt(match[1], 10));
      }
    }

    const fetchUserXP = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const xp = userSnap.data()?.xp || 0;
        setUserXP(xp);
      }
    };

    fetchUserXP();
  }, [challenge]);

  const handleClaim = async () => {
    if (user && xpAmount) {
      setLoading(true);
      const userRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userRef, {
          xp: increment(xpAmount),
        });
        navigation.navigate("Rewards");
      } catch (err) {
        console.error("Error updating XP:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const badgeImage = getBadgeByXP(userXP);

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={80} color="limegreen" style={styles.icon} />
      <Text style={styles.title}>Challenge Completed!</Text>
      <Text style={styles.subtitle}>XP Level</Text>

      {/* Progress Ring with Badge */}
      <View style={styles.progressContainer}>
        <View style={styles.outerRing}>
          <View style={styles.innerRing}>
            <Image source={badgeImage} style={styles.iconImage} />
          </View>
        </View>
        <Text style={styles.xpText}>+{xpAmount} XP</Text>
      </View>

      {/* Challenge Info */}
      <Text style={styles.challengeInfo}>{challenge?.name}</Text>
      <Text style={styles.challengeInfo}>Distance: {challenge?.distance}</Text>
      <Text style={styles.challengeInfo}>Duration: {challenge?.duration}</Text>
      <Text style={styles.challengeInfo}>Status: {challenge?.status}</Text>

      <TouchableOpacity onPress={handleClaim} disabled={loading}>
        <LinearGradient colors={["#fff", "#eee"]} style={styles.claimButton}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.claimText}>Claim</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const RING_SIZE = 160;
const INNER_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#bbb",
    marginBottom: 30,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  outerRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 12,
    borderColor: "#B9009B",
    justifyContent: "center",
    alignItems: "center",
  },
  innerRing: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  xpText: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 12,
  },
  challengeInfo: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  claimButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: "white",
    marginTop: 20,
  },
  claimText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});

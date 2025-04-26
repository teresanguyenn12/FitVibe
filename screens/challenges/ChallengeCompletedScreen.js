import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { doc, increment, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getBadgeByXP, getLevelAndFitcoinByXP } from "../../utils/badgeUtils";

export default function ChallengeCompletedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { challenge } = route.params;
  const user = auth.currentUser;

  const [xpAmount, setXpAmount] = useState(0);
  const [badgeImage, setBadgeImage] = useState(null);
  const [level, setLevel] = useState(null);
  const [fitcoinReward, setFitcoinReward] = useState(0);
  const [ringAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (challenge?.reward) {
      const match = challenge.reward.match(/(\d+)/);
      if (match) {
        const xp = parseInt(match[1], 10);
        setXpAmount(xp);
      }
    }
  }, [challenge]);

  useEffect(() => {
    const fetchAndSetBadge = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const currentXP = userSnap.data()?.xp || 0;
      const newTotalXP = currentXP + xpAmount;
      const { level, fitcoinReward } = getLevelAndFitcoinByXP(newTotalXP);

      setBadgeImage(getBadgeByXP(newTotalXP));
      setLevel(level);
      setFitcoinReward(fitcoinReward);
    };

    fetchAndSetBadge();
  }, [xpAmount]);

  const handleClaim = async () => {
    if (user && xpAmount) {
      const userRef = doc(db, "users", user.uid);
      try {
        // Update XP and FitCoin
        await updateDoc(userRef, {
          xp: increment(xpAmount),
          fitcoin: increment(fitcoinReward),
        });

        // Update Career Stats: Challenges Completed + Calories Burned
        const MET = challenge?.category === "Walk" ? 3.5 : (challenge?.category === "Run" ? 8 : 6);
        const timeHours = (challenge?.duration ? parseFloat(challenge.duration) : 0) / 60;
        const estimatedCaloriesBurned = MET * 70 * timeHours;

        await updateDoc(userRef, {
          challenges: increment(1),
          burnedCalories: increment(Math.round(estimatedCaloriesBurned)),
          completedChallenges: increment(1), // Optional: also count in completed challenges
        });

        navigation.navigate("Progression");
      } catch (err) {
        console.error("Error updating stats:", err);
      }
    }
  };

  useEffect(() => {
    Animated.timing(ringAnimation, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  const ringScale = ringAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate("HomeTabs", { screen: "Challenges" })}
      >
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      <Ionicons name="checkmark-circle" size={80} color="limegreen" style={styles.icon} />
      <Text style={styles.title}>Challenge Completed!</Text>
      <Text style={styles.subtitle}>Level {level ?? "..."}</Text>

      {/* Progress Ring */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.outerRing, { transform: [{ scale: ringScale }] }]}>
          <View style={styles.innerRing}>
            {badgeImage && <Image source={badgeImage} style={styles.iconImage} />}
          </View>
        </Animated.View>
        <Text style={styles.xpText}>+{xpAmount} XP</Text>
      </View>

      {/* Challenge Info */}
      <Text style={styles.challengeInfo}>{challenge?.name}</Text>
      <Text style={styles.challengeInfo}>Distance: {challenge?.distance}</Text>
      <Text style={styles.challengeInfo}>Duration: {challenge?.duration}</Text>
      <Text style={styles.challengeInfo}>Status: {challenge?.status}</Text>

      <TouchableOpacity onPress={handleClaim}>
        <LinearGradient colors={["#fff", "#eee"]} style={styles.claimButton}>
          <Text style={styles.claimText}>Claim Reward</Text>
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
    overflow: "hidden",
  },
  iconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: INNER_SIZE / 2,
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
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
  },
});

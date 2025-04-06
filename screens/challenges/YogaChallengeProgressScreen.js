import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, increment, arrayRemove, arrayUnion, serverTimestamp } from "firebase/firestore";

const YogaChallengeProgressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { challenge } = route.params;
  const user = auth.currentUser;

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
    } else {
      if (time === 0) return;
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev === 0) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTime(0);
  };

  const addTime = () => {
    if (!isRunning) setTime((prev) => prev + 30);
  };

  const subtractTime = () => {
    if (!isRunning) setTime((prev) => (prev <= 30 ? 0 : prev - 30));
  };

  const parseXP = (rewardString) => {
    const match = rewardString?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const handleSavePress = async () => {
    if (!user || !challenge) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`challengeProgress.${challenge.id}.duration`]: increment(time / 60),
        [`challengeProgress.${challenge.id}.lastUpdated`]: serverTimestamp(),
      });

      const userSnap = await getDoc(userRef);
      const progress = userSnap.data()?.challengeProgress?.[challenge.id];
      const completed = (progress?.duration ?? 0) >= (challenge.durationGoal ?? Infinity);

      if (completed) {
        await updateDoc(userRef, {
          activeChallenges: arrayRemove(challenge.id),
          completedChallenges: arrayUnion(challenge.id),
          xp: increment(parseXP(challenge.reward)),
        });
        navigation.navigate("ChallengeCompletedScreen", { challenge });
      } else {
        Alert.alert("Saved!", "Routine time was logged successfully.");
      }
    } catch (error) {
      console.error("Error saving yoga challenge:", error);
      Alert.alert("Error", "Failed to save your workout. Try again.");
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Yoga Challenge</Text>
      <View style={styles.titleUnderline} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centeredContent}>
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatTime(time)}</Text>
            <View style={styles.timeAdjustButtons}>
              <TouchableOpacity onPress={subtractTime} style={styles.timeAdjustButton} disabled={isRunning}>
                <Text style={styles.timeAdjustButtonText}>-30</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addTime} style={styles.timeAdjustButton} disabled={isRunning}>
                <Text style={styles.timeAdjustButtonText}>+30</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={toggleTimer} style={[styles.button, isRunning && styles.stopButton]}>
              <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start Routine Timer"}</Text>
            </TouchableOpacity>
            {!isRunning && time > 0 && (
              <TouchableOpacity onPress={resetTimer} style={styles.button}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
            <LinearGradient colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} style={styles.gradientButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    paddingTop: 80,
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    fontFamily: "TiltWarp-Regular",
  },
  titleUnderline: {
    height: 1,
    backgroundColor: "#aaa",
    width: "90%",
  },
  scrollContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredContent: {
    width: "90%",
    alignItems: "center",
  },
  timerContainer: {
    backgroundColor: "#1e1e1e",
    padding: 45,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  timer: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  timeAdjustButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 20,
  },
  timeAdjustButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  timeAdjustButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    width: 160,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#121212",
  },
  stopButton: {
    backgroundColor: "#FF7F7F",
  },
  saveButton: {
    marginTop: 20,
    alignItems: "center",
    width: 140,
    borderRadius: 10,
    padding: 8,
    alignSelf: "center",
  },
  gradientButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default YogaChallengeProgressScreen;

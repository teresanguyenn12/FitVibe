// Entry point to all challenge-related screens
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { fetchCompletedChallenges } from "../../services/challengeService";
import { Ionicons } from "@expo/vector-icons";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentMonthIndex = new Date().getMonth();
const currentMonth = monthNames[currentMonthIndex];

const challenges = monthNames.map((month, index) => ({
  id: `challengeId${index + 1}`,
  month,
  status: month === currentMonth ? "Active" : (index < currentMonthIndex ? "Completed" : "Upcoming"),
}));

const ChallengesScreen = () => {
  const navigation = useNavigation();
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCompletedChallenges = async () => {
      try {
        const completed = await fetchCompletedChallenges();
        console.log("Retrieved completed challenges:", completed);
        setCompletedChallenges(completed);
      } catch (error) {
        console.error("Error fetching completed challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    getCompletedChallenges();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e24aa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Challenges</Text>

      {/* "My Challenges" Button */}
      <TouchableOpacity onPress={() => navigation.navigate("MyChallengesScreen")}>
        <LinearGradient colors={["#A0006D", "#552082"]} style={styles.myChallengesButton}>
          <Text style={styles.myChallengesText}>My Challenges</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Scrollable Challenge List */}
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isPastChallenge = item.status === "Completed";
          const isUpcomingChallenge = item.status === "Upcoming";
          const userParticipated = completedChallenges.includes(item.id);
          const isClickable = item.status === "Active" || (isPastChallenge && userParticipated);

          let cardOpacity = 1;
          if (isUpcomingChallenge) cardOpacity = 0.5;
          else if (isPastChallenge) cardOpacity = 0.85;

          return (
            <TouchableOpacity
              disabled={!isClickable}
              onPress={() => {
                if (item.status === "Active") {
                  navigation.navigate("JoinChallenges", { challenge: item });
                } else if (item.status === "Completed" && userParticipated) {
                  navigation.navigate("CompletedChallengeDetails", { challenge: item });
                }
              }}
            >
              <LinearGradient
                colors={
                  item.status === "Active"
                    ? ["#A0006D", "#552082"]
                    : item.status === "Upcoming"
                    ? ["#888", "#888"]
                    : ["#333", "#333"]
                }
                style={[styles.challengeItem, { opacity: cardOpacity }]}
              >
                <Text style={[
                  styles.challengeTitle,
                  (isUpcomingChallenge || (isPastChallenge && !userParticipated)) && styles.fadedText
                ]}>
                  {item.month} Challenges
                </Text>
                <Text style={[
                  styles.challengeStatus,
                  (isUpcomingChallenge || (isPastChallenge && !userParticipated)) && styles.fadedText
                ]}>
                  {item.status}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "TiltWarp-Regular",
  },
  myChallengesButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  myChallengesText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "TiltWarp-Regular",
  },
  challengeItem: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  fadedText: {
    color: "#aaa",
  },
  challengeTitle: {
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    fontFamily: "TiltWarp-Regular",
  },
  challengeStatus: {
    fontSize: 15,
    textAlign: "center",
    color: "#ccc",
    marginTop: 5,
    fontFamily: "Montserrat-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChallengesScreen;

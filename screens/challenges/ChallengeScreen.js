import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { fetchCompletedChallenges } from "../../services/challengeService"; 

const challenges = [
  { id: "challengeId1", month: "January", status: "Completed", name: "January Challenge", distance: "5 miles", duration: "7 days", reward: "300 XP", isPast: true },
  { id: "challengeId2", month: "February", status: "Completed", name: "February Challenge", distance: "10 miles", duration: "24 hours", reward: "500 XP", isPast: true },
  { id: "challengeId3", month: "March", status: "Active", name: "March Challenge", distance: "8 miles", duration: "3 days", reward: "400 XP", isPast: false },
  { id: "challengeId4", month: "April", status: "Upcoming", name: "April Challenge", distance: "6 miles", duration: "5 days", reward: "350 XP", isPast: false },
  { id: "challengeId5", month: "May", status: "Upcoming" },
  { id: "challengeId6", month: "June", status: "Upcoming" },
  { id: "challengeId7", month: "July", status: "Upcoming" },
  { id: "challengeId8", month: "August", status: "Upcoming" },
  { id: "challengeId9", month: "September", status: "Upcoming" },
  { id: "challengeId10", month: "October", status: "Upcoming" },
  { id: "challengeId11", month: "November", status: "Upcoming" },
  { id: "challengeId12", month: "December", status: "Upcoming" },
];

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
      <TouchableOpacity>
        <LinearGradient colors={["#A0006D", "#552082"]} style={styles.myChallengesButton}>
          <Text style={styles.myChallengesText}>My Challenges</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Scrollable Challenge List */}
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isPastChallenge = item.isPast;
          const isUpcomingChallenge = item.status === "Upcoming";
          const userParticipated = completedChallenges.includes(item.id);
          const isClickable = !isPastChallenge || userParticipated; // Users can only click on past challenges if they completed them

          return (
            <TouchableOpacity
              disabled={item.status === "Upcoming"} // Disable upcoming challenges
              onPress={() => {
                if (item.status === "Active") {
                  navigation.navigate("JoinChallenges", { challenge: item }); // Navigate to JoinChallengesScreen
                } else if (item.status === "Completed" && completedChallenges.includes(item.id)) {
                  navigation.navigate("CompletedChallengeDetails", { challenge: item }); // Navigate to CompletedChallengeDetails
                }
              }}
              style={[
                styles.challengeItem,
                item.status === "Upcoming" && styles.disabledChallenge, // Style for upcoming challenges
              ]}
            >
              <LinearGradient
                colors={
                  item.status === "Active" ? ["#A0006D", "#552082"] :
                  item.status === "Upcoming" ? ["#888", "#888"] : ["#333", "#333"]
                }
                style={styles.challengeItem}
            >
              <Text style={[styles.challengeTitle, item.status === "Upcoming" && styles.fadedText]}>
                {item.month} Challenges
              </Text>
              <Text style={[styles.challengeStatus, item.status === "Upcoming" && styles.fadedText]}>
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
  activeChallenge: {
    borderWidth: 2,
    borderColor: "#A0006D",
    textAlign: "center",
  },
  disabledChallenge: {
    opacity: 0.7, 
  },
  fadedText: {
    color: "#777", 
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

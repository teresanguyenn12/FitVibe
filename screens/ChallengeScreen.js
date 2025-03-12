import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const challenges = [
  { month: "January", status: "Completed", name: "January Challenge", distance: "5 miles", duration: "7 days", reward: "300 XP" },
  { month: "February", status: "Completed", name: "February Challenge", distance: "10 miles", duration: "24 hours", reward: "500 XP" },
  { month: "March", status: "Active", name: "March Challenge", distance: "8 miles", duration: "3 days", reward: "400 XP" },
  { month: "April", status: "Upcoming", name: "April Challenge", distance: "6 miles", duration: "5 days", reward: "350 XP" },
  { month: "May", status: "Upcoming" },
  { month: "June", status: "Upcoming" },
  { month: "July", status: "Upcoming" },
  { month: "August", status: "Upcoming" },
  { month: "September", status: "Upcoming" },
  { month: "October", status: "Upcoming" },
  { month: "November", status: "Upcoming" },
  { month: "December", status: "Upcoming" },
];

const ChallengesScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Challenges</Text>

      {/* "My Challenges" Gradient Button */}
      <TouchableOpacity>
        <LinearGradient colors={["#A0006D", "#552082"]} style={styles.myChallengesButton}>
          <Text style={styles.myChallengesText}>My Challenges</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Scrollable Challenge List */}
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.month}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate("ChallengeDetails", { challenge: item })}

          >
            <LinearGradient
              colors={item.status === "Active" ? ["#A0006D", "#552082"] : ["#333", "#333"]}
              style={[
                styles.challengeItem,
                item.status === "Active" && styles.activeChallenge,
              ]}
            >
              <Text style={styles.challengeTitle}>{item.month} Challenges</Text>
              <Text style={styles.challengeStatus}>{item.status}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
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
});

export default ChallengesScreen;

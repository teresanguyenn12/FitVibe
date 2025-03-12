import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { joinChallenge } from "../services/challengeService";

// Predefined challenges with unique IDs
const challenges = [
  { id: "challenge_100m", name: "100 Meter Race" },
  { id: "challenge_10mile", name: "10 Mile Run in 24 hrs" },
  { id: "challenge_12hill", name: "12 Mile Hill Sprint" },
  { id: "challenge_5k7days", name: "5K-a-Day for 7 Days" },
  { id: "challenge_treadmill", name: "Treadmill Marathon" },
];

export default function JoinChallengesScreen() {
  const navigation = useNavigation();

  // Function to join a challenge
  const handleJoinChallenge = async (challengeId) => {
    Alert.alert(
      "Join Challenge",
      "Are you sure you want to join this challenge?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Join", 
          onPress: async () => {
            try {
              await joinChallenge(challengeId);
              alert("You've joined the challenge!");
            } catch (error) {
              console.error("Error joining challenge:", error);
              alert("Failed to join the challenge. Try again!");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Challenges</Text>
      {challenges.map((challenge) => (
        <TouchableOpacity
          key={challenge.id}
          style={styles.challengeItem}
          onPress={() =>
            navigation.navigate("ChallengeDetails", { challenge })
          }
          onLongPress={() => handleJoinChallenge(challenge.id)} // Long press to join challenge
        >
          <Text style={styles.challengeText}>{challenge.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 20 },
  challengeItem: { backgroundColor: "#1E1E1E", padding: 15, borderRadius: 10, marginBottom: 10 },
  challengeText: { color: "white", fontSize: 16 },
});

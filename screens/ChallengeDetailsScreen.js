import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { joinChallenge } from "../services/challengeService";

export default function ChallengeDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { challenge } = route.params;

  if (!challenge) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No challenge details available.</Text>
      </View>
    );
  }

  const handleJoinChallenge = async () => {
    Alert.alert(
      "Join Challenge",
      `Do you want to join ${challenge.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Join", 
          onPress: async () => {
            try {
              await joinChallenge(challenge.id); 
              alert("You've joined the challenge!");
              navigation.navigate("MyChallenges"); // Redirect after joining
            } catch (error) {
              alert("Error joining challenge.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challenge.name}</Text>
      <Text style={styles.details}>Distance: {challenge.distance}</Text>
      <Text style={styles.details}>Duration: {challenge.duration}</Text>
      <Text style={styles.details}>Reward: {challenge.reward}</Text>

      <TouchableOpacity style={styles.joinButton} onPress={handleJoinChallenge}>
        <Text style={styles.joinButtonText}>Join Challenge</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 20 },
  details: { color: "#bbb", fontSize: 16, marginBottom: 10 },
  joinButton: { backgroundColor: "#5A1A9B", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  joinButtonText: { color: "white", fontWeight: "bold" },
  errorText: { color: "red", fontSize: 18, textAlign: "center", marginTop: 20 },
});

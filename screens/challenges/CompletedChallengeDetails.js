// See completed challenge and claim rewards
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CompletedChallengeDetails({ route }) {
  const { challenge } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challenge.name}</Text>
      <Text style={styles.details}>Distance: {challenge.distance}</Text>
      <Text style={styles.details}>Duration: {challenge.duration}</Text>
      <Text style={styles.details}>Reward Earned: {challenge.reward}</Text>
      <Text style={styles.details}>Status: Completed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center", marginTop:100, marginBottom: 20 },
  details: { color: "#bbb", fontSize: 16, marginTop: 20, marginBottom: 10 },
});

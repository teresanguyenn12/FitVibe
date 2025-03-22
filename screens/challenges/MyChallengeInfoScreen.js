//Display after clicking "My Challenge" 
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth } from "../../firebase";


export default function MyChallengeDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { challenge } = route.params || {}; 

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{challenge.name}</Text>
      <Text style={styles.detailText}>
        <Text style={{ fontWeight: "bold" }}>Progress:</Text> {challenge.progress ? `${challenge.progress[auth.currentUser?.uid] || 0}%` : "0%"}
      </Text>
      <Text style={styles.detailText}>
        <Text style={{ fontWeight: "bold" }}>Distance:</Text> {challenge.distance || "Unknown"}
      </Text>
      <Text style={styles.detailText}>
        <Text style={{ fontWeight: "bold" }}>Duration:</Text> {challenge.duration || "Unknown"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  backButton: { marginBottom: 20 },
  backText: { color: "#A0006D", fontSize: 18, fontWeight: "bold" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 20 },
  detailText: { fontSize: 16, color: "#bbb", marginBottom: 10 },
});

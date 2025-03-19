import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const ChallengeDetailsScreen = () => {
  const route = useRoute();
  const { challenge } = route.params; // Get the challenge data

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <ImageBackground source={require("../assets/map.png")} style={styles.map} />

      {/* Challenge Details Card */}
      <View style={styles.detailsContainer}>
        <Text style={styles.challengeTitle}>{challenge.name}</Text>
        <Text style={styles.location}>
          <Text style={{ fontWeight: "bold" }}>Location:</Text> California State University, Long Beach
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Distance:</Text> {challenge.distance || "10 miles"}
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Duration:</Text> {challenge.duration || "24 hours"}
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Reward:</Text> {challenge.reward || "+500 XP"}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Join Solo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonOutline}>
            <Text style={styles.buttonTextOutline}>Invite a Friend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  map: {
    width: "100%",
    height: "45%",
    resizeMode: "cover",
  },
  detailsContainer: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -30,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    flex: 1,
    backgroundColor: "#A0006D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonOutline: {
    flex: 1,
    borderColor: "#A0006D",
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonTextOutline: {
    color: "#A0006D",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChallengeDetailsScreen;

import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const LiftingChallengeProgressScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lifting Challenge Progress</Text>
      <Image
        source={require("../../assets/lifting-icon.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.description}>
        Log your reps, sets, and strength progression each day. Stay strong!
      </Text>
      {/* Display lifting data, charts, etc. */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 180,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
  },
});

export default LiftingChallengeProgressScreen;

import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const CyclingChallengeProgressScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cycling Challenge Progress</Text>
      <Image
        source={require("../../assets/cycling.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.description}>
        Track your miles and rides. Keep pedaling and break your personal bests!
      </Text>
      {/* Add mileage tracking etc. */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#002c3e",
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
    color: "#ddd",
    textAlign: "center",
  },
});

export default CyclingChallengeProgressScreen;

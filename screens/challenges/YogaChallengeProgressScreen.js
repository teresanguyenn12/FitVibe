import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

const YogaChallengeProgressScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Yoga Challenge Progress</Text>
      <Image
        source={require("../../assets/yoga-pose.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.description}>
        Take a deep breath and stay centered. Track your daily yoga sessions here.
      </Text>
      {/* Progress details */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5a1a9b",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    height: 200,
    width: "100%",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});

export default YogaChallengeProgressScreen;

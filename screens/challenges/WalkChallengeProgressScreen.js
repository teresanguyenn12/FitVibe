import React from "react";
import { View, Text, StyleSheet, ProgressBarAndroid } from "react-native";

const WalkChallengeProgressScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Walk Challenge</Text>
      <Text style={styles.description}>Track your daily walking distance and stay active!</Text>
      <ProgressBarAndroid styleAttr="Horizontal" indeterminate={false} progress={0.5} color="#4CAF50" />
      <Text style={styles.progressText}>2.5 miles of 5 miles</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#4E944F",
    marginBottom: 20,
    textAlign: "center",
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    color: "#388E3C",
  },
});

export default WalkChallengeProgressScreen;

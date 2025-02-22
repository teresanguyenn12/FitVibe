import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi Sammy,</Text>
      <Text style={styles.subtitle}>Let's get Active!</Text>

      <TouchableOpacity style={styles.workoutButton}>
        <Text style={styles.buttonText}>My Workouts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.activityButton}>
        <Text style={styles.buttonText}>My Activity</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#bbb",
    marginBottom: 20,
  },
  workoutButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  activityButton: {
    backgroundColor: "#8e24aa",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default HomeScreen;

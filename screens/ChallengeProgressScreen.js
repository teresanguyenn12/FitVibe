import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import { updateChallengeProgress } from "../services/challengeService";
import { auth } from "../firebase"; // Import Firebase Auth

export default function ChallengeProgressScreen({ route }) {
  const { challengeId } = route.params;
  const [progress, setProgress] = useState("");
  const user = auth.currentUser; // Get the logged-in user

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>You must be logged in to update progress.</Text>
      </View>
    );
  }

  const handleUpdateProgress = async () => {
    const progressValue = Number(progress);

    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      Alert.alert("Invalid Progress", "Please enter a value between 0 and 100.");
      return;
    }

    try {
      await updateChallengeProgress(challengeId, user.uid, progressValue);
      Alert.alert("Success", `Progress updated to ${progressValue}%`);
      setProgress(""); // Reset input after update
    } catch (error) {
      Alert.alert("Error", "Failed to update progress. Please try again.");
      console.error("Update Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Challenge Progress</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter progress (0 - 100)"
        keyboardType="numeric"
        value={progress}
        onChangeText={setProgress}
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateProgress}>
        <Text style={styles.buttonText}>Update Progress</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    color: "white",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#5A1A9B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
});


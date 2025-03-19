import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db, auth } from "../../firebase"; 
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function ConfirmChallengeScreen() {
  const navigation = useNavigation();
  const { challenge } = useRoute().params;
  const user = auth.currentUser; // Get the logged-in user

  const handleConfirm = async () => {
    if (!user) {
      Alert.alert("Error", "You need to be logged in to join a challenge.");
      return;
    }

    try {
      const challengeRef = doc(db, "challenges", challenge.id);

      // Add user ID to participants list
      await updateDoc(challengeRef, {
        participants: arrayUnion(user.uid),
        progress: arrayUnion({
          userId: user.uid,
          milesCompleted: 0,
        }),
      });

      Alert.alert("Success!", `You have joined ${challenge.name}.`);
      navigation.navigate("Challenges");
    } catch (error) {
      Alert.alert("Error", "Failed to join challenge.");
      console.error("Error joining challenge:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solo Challenge: {challenge.name}</Text>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../authProvider";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for back button

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation(); // Access navigation

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.text}>Profile Screen</Text>
      <Text style={styles.text}>Logged in as: {user?.fullName}</Text>
      <Button title="Logout" onPress={logout} color="#8e24aa" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50, // Adjust padding to accommodate the back button
  },
  backButton: {
    position: "absolute",
    top: 90,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },
});

export default ProfileScreen;


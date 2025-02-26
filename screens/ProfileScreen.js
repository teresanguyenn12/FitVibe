import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../authProvider";

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
      <Text style={styles.text}>Logged in as: {user?.name}</Text>
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
  },
  text: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },
});

export default ProfileScreen;

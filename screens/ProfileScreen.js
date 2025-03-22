import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; 
import { LinearGradient } from "expo-linear-gradient"; 

const ProfileScreen = () => {
  const navigation = useNavigation(); 

  return (
    <View style={styles.container}>
      {/* Settings Button */}
      <LinearGradient
        colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings" size={40} color="#fff" />
          <Text style={styles.cardText}>Settings</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.text}>Profile Screen</Text>

      {/* Goals Button */}
      <LinearGradient
        colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Goals")}
        >
          <Ionicons name="flag" size={40} color="#fff" />
          <Text style={styles.cardText}>Goals</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Friends Button */}
      <LinearGradient
        colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("FriendsScreen")}
        >
          <Ionicons name="people" size={40} color="#fff" />
          <Text style={styles.cardText}>Friends</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50, 
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
    marginTop: 20,
  },
  cardBorder: {
    width: "50%", 
    height: 155, 
    borderRadius: 20, 
    padding: 3, 
    marginTop: 20,
  },
  card: {
    flex: 1, 
    backgroundColor: "#000", 
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "TiltWarp-Regular",
  },
});

export default ProfileScreen;

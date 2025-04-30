import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";

const CurrentProgressionScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const level = 3;
  const maxXP = 1000;
  const currentXP = 720;
  const rank = "Prestige Rank: Rookie";
  const progress = currentXP / maxXP; 

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("HomeTabs")}>
        <Ionicons name="close" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.header, { color: theme.text }]}>Progression</Text>
      <Text style={[styles.subtext, { color: theme.text }]}>
        <Text style={{ color: "#B76DF5" }}>{currentXP}/{maxXP}</Text> XP til next level
      </Text>

      {/* Rank Icon */}
      <Image source={require("../assets/rookie.png")} style={styles.iconImage} />

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: "#E0E0E0" }]}>
        <LinearGradient
          colors={["#A0004D", "#B76DF5"]}
          style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <Text style={[styles.rankText, { color: theme.text }]}>{rank}</Text>
      <Text style={styles.levelText}>Lvl {level}</Text>

      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => navigation.navigate("ProgressionInfo")}
      >
        <Text style={styles.infoButtonText}>Progression Information</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    padding: 10,
    borderRadius: 10,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  subtext: {
    fontSize: 16,
    marginBottom: 30,
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
  },
  iconImage: {
    width: 100,
    height: 100,
    borderRadius: 30,
    marginBottom: 30,
  },
  rankText: {
    fontSize: 20,
    fontWeight: "500",
  },
  levelText: {
    fontSize: 20,
    color: "#B76DF5",
    marginBottom: 30,
  },
  infoButton: {
    backgroundColor: "#87005c",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  infoButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CurrentProgressionScreen;
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const CurrentProgressionScreen = () => {
  const navigation = useNavigation();
  const level = 3;
  const maxXP = 1000;
  const currentXP = 720;
  const rank = "Prestige Rank: Rookie";
  const progress = currentXP / maxXP; 

  return (
    <View style = {styles.container}>
      <TouchableOpacity style = {styles.backButton} onPress = {() => navigation.navigate("HomeTabs")}>
        <Ionicons name = "close" size = {28} color = "#fff" />
      </TouchableOpacity>

      <Text style = {styles.header}>Progression</Text>
      <Text style = {styles.subtext}>
        <Text style = {{color: "#B76DF5"}}>{currentXP}/{maxXP}</Text> XP til next level
      </Text>

      {/* Rank Icon */}
      <Image source = {require("../assets/rookie.png")} style = {styles.iconImage} />

      {/* Progress Bar */}
      <View style = {styles.progressBarContainer}>
        <View style = {styles.progressBarBackground}>
          <LinearGradient
            colors = {["#A0004D", "#000000"]}
            style = {[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>

      <Text style = {styles.rankText}>{rank}</Text>
      <Text style = {styles.levelText}>Lvl {level}</Text>

      <TouchableOpacity
        style = {styles.infoButton}
        onPress = {() => navigation.navigate("ProgressionInfo")}
      >
        <Text style = {styles.infoButtonText}>Progression Information</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0D",
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
    color: "#fff",
    marginBottom: 40,
  },
  subtext: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 30,
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "#444",
    borderRadius: 5,
    marginBottom: 20, 
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#B76DF5",
  },
  iconImage: {
    width: 100,
    height: 100,
    borderRadius: 30, 
    marginBottom: 30,
  },
  rankText: {
    fontSize: 20,
    color: "#fff",
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

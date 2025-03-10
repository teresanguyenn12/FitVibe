import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";


const levels = [
  { title: "Prestige 0", rank: "Rookie", perks: ["50 FitCoins", "'Rookie Mindset' Badge", "Unlocks Friend Leaderboards", "Bonus: 3-Day Streak Booster"], locked: false },
  { title: "Prestige 1", rank: "Competitor", perks: ["100 FitCoins", "'Competitor Mindset' Badge", "Unlocks Monthly Challenges", "Bonus: 10% Boost on FitCoin Earnings"], locked: false },
  { title: "Prestige 2", rank: "Warrior", perks: ["150 FitCoins", "'Competitor Mindset' Badge", "Unlocks Friend Leaderboards", "Bonus: 1 Free Streak Recovery Per Month"], locked: false },
  { title: "Prestige 3", rank: "Elite", perks: ["200 FitCoins", "'Elite Competitor' Badge", "Unlocks Friend Leaderboards", "Bonus: 15% Discount on Special Fitness Gear"], locked: true },
  { title: "Prestige 4", rank: "Titan", perks: ["250 FitCoins", "'Titan’s Legacy' Badge", "Unlocks Friend Leaderboards", "Titan-Only Monthly Challenges"], locked: true },
  { title: "Prestige 5", rank: "Master", perks: ["500 FitCoins", "'Master of the Game' Badge", "VIP Access to All Fitness Challenges & Leaderboards", "Bonus: Double XP & FitCoin Earnings for a Week Each Month"], locked: true }
];

const ProgressionScreen = () => {
  const navigation = useNavigation();

  return (
    <View style = {styles.container}>
      <TouchableOpacity style = {styles.backButton} onPress = {() => navigation.goBack()}>
        <Ionicons name = "close" size = {25} color = "#fff"/>
      </TouchableOpacity>
      <Text style = {styles.header}>Progression Info</Text>
      <ScrollView style = {styles.scrollContainer}>
        {levels.map((level, index) => (
          <LinearGradient colors={["#A0004D", "#000000"]}key = {index} style = {[styles.levelContainer, level.locked && styles.locked]}>
            <Text style = {styles.levelTitle}>{level.title}</Text>
            <Image source = {require("../assets/FVLOGO.png")} style = {styles.icon}/>
            <Text style = {styles.rank}>{level.rank}</Text>
            <Text style = {styles.perksTitle}>Perks:</Text>
            {level.perks.map((perk, idx) => (
              <Text key = {idx} style = {styles.perkItem}>• {perk}</Text>
            ))}
            {level.locked && <Ionicons name = "lock-closed" size = {24} color = "#fff" style = {styles.lockIcon}/>}
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 78,
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    padding: 10,
    borderRadius: 10,
  },
  header: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  levelContainer: {
    backgroundColor: "#1c1c1e",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#87005c",
  },
  locked: {
    backgroundColor: "#3a3a3c",
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  icon: {
    width: 60,
    height: 50,
    alignSelf: "center",
    marginVertical: 10,
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  perksTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  perkItem: {
    color: "#bbb",
    fontSize: 14,
    marginLeft: 10,
  },
  lockIcon: {
    position: "absolute",
    top: 15,
    right: 15,
  },
});

export default ProgressionScreen;
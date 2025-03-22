// List all available challenges
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons"; 

const categories = ["Run", "Walk", "Yoga", "Lifting", "Cycling"];

const challenges = [
  { id: "1", name: "100 Meter Race", category: "Run" },
  { id: "2", name: "10 Mile Run in 24 hrs", category: "Run" },
  { id: "3", name: "12 Mile Hill Sprint", category: "Run" },
  { id: "4", name: "5K-a-Day for 7 Days", category: "Run" },
  { id: "5", name: "Treadmill Marathon", category: "Run" },
];

const JoinChallengesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation(); 
  const { challenge } = route.params;
  const [selectedCategory, setSelectedCategory] = useState("Run");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Join Challenges</Text>

      {/* Selected Month Button */}
      <LinearGradient colors={["#A0006D", "#552082"]} style={styles.selectedMonthButton}>
        <Text style={styles.selectedMonthText}>{challenge.month} Challenges</Text>
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity key={category} onPress={() => setSelectedCategory(category)}>
            <Text style={[styles.category, selectedCategory === category && styles.selectedCategory]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Challenge List */}
      <FlatList
        data={challenges.filter((item) => item.category === selectedCategory)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.challengeItem} 
            onPress={() => navigation.navigate("ChallengeDetails", { challenge: item })} 
          >
            <Text style={styles.challengeText}>{item.name}</Text>
            <Entypo name="chevron-right" size={18} color="#bbb" /> 
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  selectedMonthButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  selectedMonthText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  category: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginHorizontal: 5,
    backgroundColor: "#222",
    color: "#bbb",
    fontSize: 14,
  },
  selectedCategory: {
    backgroundColor: "#A0006D",
    color: "#fff",
    fontWeight: "bold",
  },
  challengeItem: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default JoinChallengesScreen;

// List all available challenges
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { db } from "../../firebase"; 
import { collection, getDocs } from "firebase/firestore";

const categories = ["Run", "Walk", "Yoga", "Lifting", "Cycling"];

const JoinChallengesScreen = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState("Run");
  const [allChallenges, setAllChallenges] = useState([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const snapshot = await getDocs(collection(db, "challenges"));
        const challengeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllChallenges(challengeList);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, []);

  const filteredChallenges = allChallenges.filter(
    (challenge) => challenge.category === selectedCategory
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Join Challenges</Text>

      <LinearGradient colors={["#A0006D", "#552082"]} style={styles.selectedMonthButton}>
        <Text style={styles.selectedMonthText}>March Challenges</Text>
      </LinearGradient>
      <Text style={styles.sectionTitle}>Choose Fitness Challenge</Text>
      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.category,
              selectedCategory === category && styles.selectedCategory,
            ]}
          >
            <Text style={{ color: selectedCategory === category ? "#fff" : "#bbb" }}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Challenge List */}
      <FlatList
        data={filteredChallenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.challengeItem}
            onPress={() => {
              if (item.id === "run_10mile_24hr") {
                navigation.navigate("ChallengeDetails", { challenge: item });
              } else {
                navigation.navigate("ConfirmChallengeScreen", { challenge: item });
              }
            }}
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  selectedMonthButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  selectedMonthText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    //alignItems: "center",
    marginBottom: 10, 
    paddingVertical: 10,
     
  },
  category: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: "#222",
    fontSize: 13,
    fontWeight: "600",
  },
  selectedCategory: {
    backgroundColor: "#A0006D",
    color: "#fff",
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
  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    //marginBottom: 6,
    marginTop: 60,
    textAlign: "left",
  },
});

export default JoinChallengesScreen;
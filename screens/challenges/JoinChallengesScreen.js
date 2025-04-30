import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const categories = ["Run", "Walk", "Yoga", "Lifting", "Cycling"];

const JoinChallengesScreen = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState("Run");
  const [allChallenges, setAllChallenges] = useState([]);
  const [currentMonthName, setCurrentMonthName] = useState("");

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

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const now = new Date();
    setCurrentMonthName(monthNames[now.getMonth()]);
    fetchChallenges();
  }, []);

  const filteredChallenges = allChallenges.filter(
    (challenge) => challenge.category === selectedCategory
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.header}>Join {currentMonthName} Challenges</Text>

      {/* Category Scroll Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryBox,
              selectedCategory === category && styles.categoryBoxActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.categoryBoxText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <Text style={styles.noResults}>No results found.</Text>
      ) : (
        <FlatList
          data={filteredChallenges}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<View style={{ height: 0 }} />} // removes initial offset
          renderItem={({ item }) => (
            <LinearGradient
              colors={["#8A1E50", "#1A4A80"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.challengeCard}
            >
              <TouchableOpacity
                style={styles.challengeCardContent}
                onPress={() =>
                  navigation.navigate("ChallengeDetails", { challenge: item })
                }
              >
                <View>
                  <Text style={styles.challengeName}>{item.name}</Text>
                  <Text style={styles.challengeMeta}>
                    {item.duration || "Duration unknown"} •{" "}
                    {item.participantCount || 0} joined
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward-circle"
                  size={28}
                  color="#FFD700"
                />
              </TouchableOpacity>
            </LinearGradient>
          )}
          style={{ marginTop: -110}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 0,
  },
  categoryScrollContent: {
    paddingHorizontal: 4,
  },
  categoryBox: {
    width: 100,
    height: 50,
    backgroundColor:"#2B2D31",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  categoryBoxActive: {
    backgroundColor: "#7C3AED",
  },
  categoryBoxText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  challengeCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  challengeCardContent: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  challengeMeta: {
    color: "#ddd",
    fontSize: 13,
  },
  noResults: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 999,
    padding: 6,
    borderRadius: 20,
    paddingTop: 10,
  },
});

export default JoinChallengesScreen;

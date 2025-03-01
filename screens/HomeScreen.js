import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Placeholder user data (Replace with Firebase later)
const mockUser = {
  firstName: "Sammy", // Replace with dynamic user data later
  profilePicture: null, // Replace with Firebase Storage URL later
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user] = useState(mockUser); // Temporary state before integrating Firebase

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hi <Text style={styles.bold}>{user.firstName}</Text>,
          </Text>
          <Text style={styles.subtext}>Let's get active!</Text>
        </View>

        {/* Profile Picture (Clickable) */}
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Image
            source={
              user.profilePicture
                ? { uri: user.profilePicture }
                : require("../assets/default-profile.png") // Default profile image
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Full-Screen Background for Buttons */}
      <View style={styles.cardBackground}>
        {/* Action Buttons Section (Centered 2x2 Grid) */}
        <View style={styles.cardContainer}>
          <View style={styles.row}>
            <LinearGradient
              colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} // Gradient colors
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder} // Gradient border style
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("StartWorkout")}
              >
                <Ionicons name="time" size={40} color="#fff" />
                <Text style={styles.cardText}>Start Workout</Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
              colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("MyWorkouts")}
              >
                <Ionicons name="calendar" size={40} color="#fff" />
                <Text style={styles.cardText}>My Workouts</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.row}>
            <LinearGradient
              colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("Rewards")}
              >
                <Ionicons name="trophy" size={40} color="#fff" />
                <Text style={styles.cardText}>Rewards</Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
              colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("Progression")}
              >
                <Ionicons name="stats-chart" size={40} color="#fff" />
                <Text style={styles.cardText}>Progression</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 65,
    marginTop: 40,
  },
  greeting: {
    fontSize: 40,
    color: "#fff",
    fontFamily: "TiltWarp-Regular",
  },
  bold: {
    fontWeight: "bold",
  },
  subtext: {
    fontSize: 16,
    color: "#bbb",
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 20,
  },
  cardBackground: {
    flex: 1,
    width: "105%",
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingVertical: 30,
    alignItems: "center",
    marginLeft: -10,
  },
  cardContainer: {
    width: "90%",
    maxWidth: 350,
    alignSelf: "center",
    marginTop: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  card: {
    width: "48%",
    height: 155,
    backgroundColor: "#000",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#8e24aa",
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "TiltWarp-Regular",
  },

  cardBorder: {
    width: "48%", // Same width as the card
    height: 155, // Same height as the card
    borderRadius: 20, // Matches card border
    padding: 3, // Creates the border effect
  },

  card: {
    flex: 1, // Ensures it fills the gradient container
    backgroundColor: "#000", // Inner card background
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;

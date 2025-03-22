import React, { useState, useEffect } from "react";
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
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot, getDocs, collection } from "firebase/firestore";
import { app } from "../firebase";
import { seedChallenges } from "./challenges/seedChallenges";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({
    firstName: "Loading...",
    profilePicture: null,
  });
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    // Seed challenges once if not already present
    const maybeSeedChallenges = async () => {
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, "challenges"));
      if (snapshot.empty) {
        await seedChallenges();
        console.log(" Challenges seeded.");
      } else {
        console.log(" Challenges already exist. Skipping seeding.");
      }
    };

    maybeSeedChallenges();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) return;

    const db = getFirestore(app);
    const userDocRef = doc(db, "users", auth.currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          firstName: data.fullName?.split(" ")[0] || "User",
          profilePicture: data.profilePicture || null,
        });
        setUpdateKey((prevKey) => prevKey + 1);
      } else {
        console.log("No user document found!");
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hi <Text style={styles.bold}>{user.firstName}</Text>,
          </Text>
          <Text style={styles.subtext}>Let's get active!</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Image
            key={updateKey}
            source={
              user.profilePicture
                ? { uri: user.profilePicture }
                : require("../assets/default-profile.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={styles.cardBackground}>
        <View style={styles.cardContainer}>
          <View style={styles.row}>
            <Card title="Start Workout" icon="time" onPress={() => navigation.navigate("StartWorkout")} />
            <Card title="My Workouts" icon="calendar" onPress={() => navigation.navigate("MyWorkouts")} />
          </View>
          <View style={styles.row}>
            <Card title="Rewards" icon="trophy" onPress={() => navigation.navigate("Rewards")} />
            <Card title="Progression" icon="stats-chart" onPress={() => navigation.navigate("Progression")} />
          </View>
        </View>
      </View>
    </View>
  );
};

const Card = ({ title, icon, onPress }) => (
  <LinearGradient colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={40} color="#fff" />
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

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
  cardBorder: {
    width: "48%",
    height: 155,
    borderRadius: 20,
    padding: 3,
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

export default HomeScreen;

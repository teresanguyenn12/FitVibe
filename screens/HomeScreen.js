import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({ firstName: "", profilePicture: null });
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore(app);
    const userDocRef = doc(db, "users", auth.currentUser?.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          firstName: data.fullName?.split(" ")[0] || "User",
          profilePicture: data.profilePicture || null,
        });
      }
    });

    // Trigger fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    return unsubscribe;
  }, []);

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hey {user.firstName} 👋</Text>
          <Text style={styles.subtext}>Let’s get moving today!</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Image
            source={
              user.profilePicture
                ? { uri: user.profilePicture }
                : require("../assets/default-profile.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Action Cards */}
      <View style={styles.cardContainer}>
        <ActionCard
          title="Start Workout"
          subtitle="Begin a new session"
          icon="play"
          onPress={() => navigation.navigate("StartWorkout")}
        />
        <ActionCard
          title="My Workouts"
          subtitle="View history & plans"
          icon="calendar"
          onPress={() => navigation.navigate("MyWorkouts")}
        />
        <ActionCard
          title="Rewards"
          subtitle="See what you've earned"
          icon="trophy"
          onPress={() => navigation.navigate("Rewards")}
        />
        <ActionCard
          title="Progress"
          subtitle="Track milestones"
          icon="stats-chart"
          onPress={() => navigation.navigate("Progression")}
        />
      </View>
    </Animated.ScrollView>
  );
};

const ActionCard = ({ title, subtitle, icon, onPress }) => (
  <TouchableOpacity style={styles.actionCardWrapper} onPress={onPress}>
    <LinearGradient
      colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientCard}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={26} color="#fff" />
      </View>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "TiltWarp-Regular",
    marginLeft:5,
  },
  subtext: {
    fontSize: 15,
    color: "#bbb",
    marginLeft: 40,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#fff",
    marginRight:15,
  },
  cardContainer: {
    marginTop: 20,
    gap: 16,
  },
  actionCardWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 10,
  },
  gradientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    color: "#ddd",
    fontSize: 13,
    marginTop: 2,
  },
});

export default HomeScreen;

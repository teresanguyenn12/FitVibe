import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { app } from "../firebase";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({ firstName: "User", profilePicture: null });
  const [trendingChallenge, setTrendingChallenge] = useState(null);
  const wave = useSharedValue(0);
  

  const mutedGradientCombos = [
    {
      colors: ["#6B3EA3cc", "#2A5C8Dcc"],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    {
      colors: ["#2A5C8Dcc", "#9C3D65cc"],
      start: { x: 1, y: 0 },
      end: { x: 0, y: 1 },
    },
    {
      colors: ["#9C3D65cc", "#6B3EA3cc"],
      start: { x: 0, y: 1 },
      end: { x: 1, y: 0 },
    },
    {
      colors: ["#6B3EA3cc", "#9C3D65cc"],
      start: { x: 1, y: 1 },
      end: { x: 0, y: 0 },
    },
  ];

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

    wave.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      2,
      false
    );

    const fetchTrendingChallenge = async () => {
      try {
        const db = getFirestore(app);
        const challengesRef = collection(db, "challenges");
        const q = query(challengesRef, orderBy("popularity", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setTrendingChallenge(querySnapshot.docs[0].data());
        } else {
          setTrendingChallenge({
            title: "Spring Step-Off",
            description: "Take 10,000 steps each day this week!",
            popularity: 87,
          });
        }
      } catch (error) {
        console.error("Error fetching trending challenge:", error);
      }
    };

    fetchTrendingChallenge();
    return unsubscribe;
  }, []);

  const waveStyle = useAnimatedStyle(() => {
    return { transform: [{ rotate: `${wave.value * 20}deg` }] };
  });

  const actionCards = [
    {
      title: "Start Workout",
      subtitle: "Begin a new session",
      icon: <Ionicons name="play" size={30} color="#fff" />,
      onPress: () => navigation.navigate("StartWorkout"),
    },
    {
      title: "My Workouts",
      subtitle: "View history & plans",
      icon: <Ionicons name="calendar" size={30} color="#fff" />,
      onPress: () => navigation.navigate("MyWorkouts"),
    },
    {
      title: "Rewards",
      subtitle: "Claim your earnings",
      icon: <Ionicons name="trophy" size={30} color="#fff" />,
      onPress: () => navigation.navigate("Rewards"),
    },
    {
      title: "Progress",
      subtitle: "Track milestones",
      icon: <Ionicons name="stats-chart" size={30} color="#fff" />,
      onPress: () => navigation.navigate("Progression"),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>FitVibe</Text>
          <Image
            source={require("../assets/FVLOGO.png")}
            style={styles.logoImage}
          />
        </View>
        <View style={styles.topRightIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationScreen")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#fff"
              style={{ marginRight: 16 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileScreen")}
          >
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
      </View>

      <View style={styles.greetingWrapper}>
        <Text style={styles.greeting}>
          Hello {user.firstName}
          <Animated.Text style={[styles.emoji, waveStyle]}> 👋</Animated.Text>
        </Text>
        <Text style={styles.subtext}>Let’s get active!</Text>
      </View>

      {/* Trending Challenge*/}
      <LinearGradient
        colors={["#8A1E50", "#1A4A80"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.trendingCard}
      >
        <View style={styles.trendingContent}>
          <View style={styles.trendingHeader}>
            <Ionicons
              name="flame"
              size={22}
              color="#FFD700"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.trendingLabel}>Trending Challenge</Text>
          </View>
          <Text style={styles.trendingTitle}>{trendingChallenge?.title}</Text>
          <Text style={styles.trendingDesc}>
            {trendingChallenge?.description}
          </Text>
          <Text style={styles.trendingPop}>
            Popularity: {trendingChallenge?.popularity}%
          </Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinText}>Join Now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.gridContainer}>
        {actionCards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.gridItem}
            onPress={card.onPress}
          >
            <BlurView intensity={25} tint="dark" style={styles.blurCard}>
              <LinearGradient
                colors={
                  mutedGradientCombos[index % mutedGradientCombos.length].colors
                }
                start={
                  mutedGradientCombos[index % mutedGradientCombos.length].start
                }
                end={
                  mutedGradientCombos[index % mutedGradientCombos.length].end
                }
                style={styles.gradientCard}
              >
                <View style={styles.iconCircle}>{card.icon}</View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  logoText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "TiltWarp-Regular",
    marginRight: 8,
  },
  logoImage: { width: 28, height: 28 },
  topRightIcons: { flexDirection: "row", alignItems: "center", marginRight: 5 },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
  },
  greetingWrapper: { marginBottom: 20, marginLeft: 5 },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "TiltWarp-Regular",
  },
  emoji: { fontSize: 32 },
  subtext: { fontSize: 15, color: "#bbb", marginTop: 4 },
  trendingCard: {
    borderRadius: 20,
    padding: 0,
    marginBottom: 25,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  trendingContent: { padding: 20 },
  trendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  trendingLabel: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "600",
    letterSpacing: 1,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  trendingDesc: { fontSize: 14, color: "#ccc", marginBottom: 8 },
  trendingPop: { fontSize: 12, color: "#999", fontStyle: "italic" },
  joinButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: "flex-start",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  joinText: { fontWeight: "bold", color: "#000", fontSize: 14 },
  sectionHeader: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    height: 135,
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  blurCard: { flex: 1, borderRadius: 20, overflow: "hidden" },
  gradientCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardSubtitle: {
    color: "#ddd",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
});

export default HomeScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { fetchCompletedChallenges } from "../../services/challengeService";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentMonthIndex = new Date().getMonth();
const currentMonth = monthNames[currentMonthIndex];

const headerGradientColors = ["#5A1A9B", "#1A4A80", "#8A1E50"];
const standardGradientColors = ["#5A1A9B", "#1A4A80", "#8A1E50"];
const bgDark = "#0F0F0F";
const cardDark = "#1A1A1A";

const ChallengesScreen = () => {
  const navigation = useNavigation();
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();
  const weeks = Math.floor(daysLeft / 7);
  const extraDays = daysLeft % 7;

  const countdownText =
    daysLeft > 0
      ? `🕒 ${weeks ? `${weeks}w ` : ""}${extraDays}d left in ${currentMonth}`
      : `✅ Month complete!`;

  useEffect(() => {
    const getCompleted = async () => {
      try {
        const data = await fetchCompletedChallenges();
        setCompletedChallenges(Object.keys(data || {}));
      } catch (e) {
        console.error("Error fetching completed challenges:", e);
        setCompletedChallenges([]);
      } finally {
        setLoading(false);
      }
    };
    getCompleted();
  }, []);

  const challenges = monthNames.map((month, index) => ({
    id: `challengeId${index + 1}`,
    month,
    status:
      index === currentMonthIndex ? "Active" : index < currentMonthIndex ? "Completed" : "Upcoming",
  }));

  const safeCompletedChallenges = completedChallenges || [];

  const active = challenges.filter(c => c.status === "Active");
  const completed = challenges.filter(c => c.status === "Completed" && safeCompletedChallenges.includes(c.id));
  const upcoming = challenges.filter(c => c.status === "Upcoming");

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={standardGradientColors[0]} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ ...styles.container, paddingBottom: 100 }} bounces={false}>
      <LinearGradient colors={headerGradientColors} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Challenges</Text>
          <Text style={styles.levelText}>Level 3 • 720 XP / 1000 XP</Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: "72%" }]} />
          </View>
          <Text style={styles.countdown}>{countdownText}</Text>
        </View>
      </LinearGradient>

      <View style={styles.progressPanel}>
        <Text style={styles.panelTitle}>Active Challenge</Text>
        {active.map(item => (
          <QuestCard
            key={item.id}
            item={item}
            type="Active"
            goal="5 workouts this month"
            progress="3 / 5"
            reward="+250 XP + Badge"
            onPress={() => navigation.navigate("JoinChallenges", { challenge: item })}
          />
        ))}

        <Pressable
          onPress={() => navigation.navigate("MyChallengesScreen")}
          style={[styles.myChallengesButton, { backgroundColor: "#7C3AED" }]}
        >
          <View style={styles.myChallengesButtonGradient}>
            <Ionicons name="person" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.myChallengesText}>My Challenges</Text>
          </View>
        </Pressable>
      </View>

      <ChallengeSection title="⏳ Upcoming" data={upcoming} type="Upcoming" />
      <ChallengeSection title="✅ Completed" data={completed} type="Completed" />
    </ScrollView>
  );
};

const ChallengeSection = ({ title, data, type }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {data.length ? (
      data.map(item => (
        <QuestCard key={item.id} item={item} type={type} locked={type === "Upcoming"} />
      ))
    ) : (
      <Text style={styles.emptyText}>No missions found.</Text>
    )}
  </View>
);

const QuestCard = ({ item, type, goal, progress, reward, onPress, locked }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isLocked = locked || type === "Upcoming";
  const badgeGradient =
    type === "Active" ? ["#7C3AED", "#7C3AED"] : type === "Upcoming" ? ["#444", "#222"] : standardGradientColors;

  return (
    <Pressable
      disabled={!onPress}
      onPressIn={() => (scale.value = withSpring(0.97))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onPress}
    >
      <Animated.View style={[styles.questCard, animatedStyle, isLocked && styles.lockedCard, type === "Active" && styles.activeCardBorder]}>
        <Text style={styles.questTitle}>{item.month} Challenge</Text>
        {goal && <Text style={styles.questDetail}>🎯 Goal: {goal}</Text>}
        {progress && <Text style={styles.questDetail}>📊 Progress: {progress}</Text>}
        {reward && <Text style={styles.questDetail}>🏰 Reward: {reward}</Text>}
        <LinearGradient colors={badgeGradient} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.questBadge}>
          <Text style={styles.badgeText}>{type.toUpperCase()}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: bgDark, paddingBottom: 50 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: bgDark },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { paddingTop: 10 },
  headerText: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center" },
  levelText: { textAlign: "center", fontSize: 14, color: "#ddd", marginTop: 4 },
  xpTrack: { height: 8, backgroundColor: "#333", borderRadius: 5, marginTop: 10, overflow: "hidden" },
  xpFill: { height: 8, backgroundColor: "#7C3AED", borderRadius: 5 },
  countdown: { color: "#bbb", fontSize: 12, marginTop: 6, textAlign: "center" },
  progressPanel: { padding: 20 },
  panelTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 14 },
  myChallengesButton: { marginTop: 18, borderRadius: 20, overflow: "hidden" },
  myChallengesButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 20 },
  myChallengesText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "bold", marginBottom: 12 },
  questCard: { backgroundColor: cardDark, padding: 16, borderRadius: 16, marginBottom: 14 },
  activeCardBorder: { borderColor: standardGradientColors[0], borderWidth: 1.5 },
  questTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  questDetail: { color: "#bbb", fontSize: 13, marginTop: 4 },
  questBadge: { alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  emptyText: { color: "#666", fontStyle: "italic" },
  lockedCard: { opacity: 0.5 },
});

export default ChallengesScreen;



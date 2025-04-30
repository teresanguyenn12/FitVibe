import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  Button,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import axios from "axios";
import { fetchCompletedChallenges } from "../../services/challengeService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";

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

const currentMonthIndex = new Date().getMonth();
const currentMonth = monthNames[currentMonthIndex];
const currentYear = new Date().getFullYear();

const headerGradientColors = ["#5A1A9B", "#1A4A80", "#8A1E50"];
const standardGradientColors = ["#5A1A9B", "#1A4A80", "#8A1E50"];
const bgDark = "#0F0F0F";
const cardDark = "#1A1A1A";

// Keys for AsyncStorage
const LAST_MONTH_KEY = "lastOpenedMonth";
const LAST_YEAR_KEY = "lastOpenedYear";

const ChallengesScreen = () => {
  const navigation = useNavigation();
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationChecked, setNotificationChecked] = useState(false);
  const [newMonthChecked, setNewMonthChecked] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const daysLeft = daysInMonth - now.getDate();
  const weeks = Math.floor(daysLeft / 7);
  const extraDays = daysLeft % 7;

  const countdownText =
    daysLeft > 0
      ? `${weeks ? `${weeks}w ` : ""}${extraDays}d left to complete your ${currentMonth} challenges!`
      : `✅ Month complete!`;

  // Function to send notification
  const sendNotification = async (userId, title, message) => {
    try {
      await axios.post(`https://app.nativenotify.com/api/indie/notification`, {
        subID: userId,
        appId: 29298,
        appToken: "u04gYyaVKbAobwZ9ojzShp",
        title: title,
        message: message,
      });
      console.log("Notification sent successfully");
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  };

  // Function to send 7-days-left notification
  const sendDaysLeftNotification = async (userId) => {
    try {
      const notificationKey = `notificationSent_${currentMonth}_${now.getFullYear()}`;
      const notificationSent = await AsyncStorage.getItem(notificationKey);

      // Only send if not already sent this month
      if (!notificationSent) {
        const success = await sendNotification(
          userId,
          "Challenge Update",
          `Only 7 days left in ${currentMonth}!`
        );

        if (success) {
          // Store that we've sent a notification for this month
          await AsyncStorage.setItem(notificationKey, "true");
        }
      } else {
        console.log("7-day notification already sent this month");
      }
    } catch (error) {
      console.error("Error in sendDaysLeftNotification:", error);
    }
  };

  // Function to send new month notification
  const sendNewMonthNotification = async (userId) => {
    try {
      // Get the last opened month and year
      const lastMonth = await AsyncStorage.getItem(LAST_MONTH_KEY);
      const lastYear = await AsyncStorage.getItem(LAST_YEAR_KEY);

      const lastMonthNum = lastMonth ? parseInt(lastMonth) : null;
      const lastYearNum = lastYear ? parseInt(lastYear) : null;

      // If this is the first time using the app or there's been a month change
      if (
        lastMonthNum === null ||
        lastYearNum === null ||
        lastMonthNum !== currentMonthIndex ||
        lastYearNum !== currentYear
      ) {
        console.log("New month detected:", currentMonth);

        // Only send notification if it's not the first app launch ever (when lastMonth/lastYear are null)
        if (lastMonthNum !== null && lastYearNum !== null) {
          await sendNotification(
            userId,
            "New Challenge Available!",
            `Welcome to ${currentMonth}! A new monthly challenge is now available. Get started today!`
          );
          console.log("New month notification sent");
        } else {
          console.log("First app launch - no new month notification sent");
        }

        // Update stored values
        await AsyncStorage.setItem(
          LAST_MONTH_KEY,
          currentMonthIndex.toString()
        );
        await AsyncStorage.setItem(LAST_YEAR_KEY, currentYear.toString());
      } else {
        console.log("Not a new month - no notification needed");
      }
    } catch (error) {
      console.error("Error checking/sending new month notification:", error);
    }
  };

  // Check if new month notification needs to be sent
  useEffect(() => {
    const checkNewMonth = async () => {
      if (newMonthChecked) return; // Skip if already checked

      try {
        if (currentUser && currentUser.uid) {
          await sendNewMonthNotification(currentUser.uid);
        }
      } catch (error) {
        console.error("Error in new month check:", error);
      } finally {
        setNewMonthChecked(true);
      }
    };

    checkNewMonth();
  }, [currentUser, newMonthChecked]);

  // Check if days-left notification needs to be sent
  useEffect(() => {
    const checkNotification = async () => {
      if (notificationChecked) return; // Skip if already checked

      try {
        // Check if user is authenticated
        if (currentUser && currentUser.uid && daysLeft === 7) {
          await sendDaysLeftNotification(currentUser.uid);
        }
      } catch (error) {
        console.error("Error checking notification status:", error);
      } finally {
        setNotificationChecked(true); // Mark as checked
      }
    };

    checkNotification();
  }, [currentUser, notificationChecked]); // Only depend on currentUser and notificationChecked

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

  // NEW FUNCTION: Clear notification flag from AsyncStorage
  const clearNotificationFlag = async () => {
    try {
      const notificationKey = `notificationSent_${currentMonth}_${now.getFullYear()}`;
      await AsyncStorage.removeItem(notificationKey);
      Alert.alert(
        "Notification Flag Cleared",
        `Cleared notification flag for ${currentMonth}. You can now test notification functionality.`,
        [{ text: "OK" }]
      );
      console.log(`Cleared notification flag for ${currentMonth}`);

      // Reset the notification checked state so it will run again
      setNotificationChecked(false);
    } catch (error) {
      console.error("Error clearing notification flag:", error);
      Alert.alert("Error", "Failed to clear notification flag");
    }
  };

  // Function to clear last month data for testing
  const clearLastMonthData = async () => {
    try {
      await AsyncStorage.removeItem(LAST_MONTH_KEY);
      await AsyncStorage.removeItem(LAST_YEAR_KEY);

      Alert.alert(
        "Month Data Cleared",
        "Last month data has been cleared. The app will treat the next reload as a new month.",
        [{ text: "OK" }]
      );
      console.log("Last month data cleared");

      // Reset new month check state
      setNewMonthChecked(false);
    } catch (error) {
      console.error("Error clearing month data:", error);
      Alert.alert("Error", "Failed to clear month data");
    }
  };

  // NEW FUNCTION: Force send a test notification
  const sendTestNotification = async () => {
    if (currentUser && currentUser.uid) {
      try {
        await sendDaysLeftNotification(currentUser.uid);
        Alert.alert("Test Notification", "Test notification was sent");
      } catch (error) {
        console.error("Error sending test notification:", error);
        Alert.alert("Error", "Failed to send test notification");
      }
    } else {
      Alert.alert("Error", "User not logged in");
    }
  };

  // NEW FUNCTION: Force send a new month notification
  const sendTestNewMonthNotification = async () => {
    if (currentUser && currentUser.uid) {
      try {
        await sendNotification(
          currentUser.uid,
          "New Challenges Available!",
          `${currentMonth} challenges are now available!`
        );
        Alert.alert("Test Notification", "New month notification was sent");
      } catch (error) {
        console.error("Error sending new month notification:", error);
        Alert.alert("Error", "Failed to send new month notification");
      }
    } else {
      Alert.alert("Error", "User not logged in");
    }
  };

  const challenges = monthNames.map((month, index) => ({
    id: `challengeId${index + 1}`,
    month,
    status:
      index === currentMonthIndex
        ? "Active"
        : index < currentMonthIndex
        ? "Completed"
        : "Upcoming",
  }));

  const safeCompletedChallenges = completedChallenges || [];

  const active = challenges.filter((c) => c.status === "Active");
  const completed = challenges.filter(
    (c) => c.status === "Completed" && safeCompletedChallenges.includes(c.id)
  );
  const upcoming = challenges.filter((c) => c.status === "Upcoming");

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
    <ScrollView
      contentContainerStyle={{ ...styles.container, paddingBottom: 100 }}
      bounces={false}
    >
      <LinearGradient
        colors={headerGradientColors}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Challenges</Text>
          <Text style={styles.countdown}>{countdownText}</Text>
        </View>
      </LinearGradient>

      <View style={styles.progressPanel}>
        <Text style={styles.panelTitle}>Active Challenge</Text>
        {active.map((item) => (
          <QuestCard
            key={item.id}
            item={item}
            type="Active"
            onPress={() =>
              navigation.navigate("JoinChallenges", { challenge: item })
            }
          />
        ))}

        <Pressable
          onPress={() => navigation.navigate("MyChallengesScreen")}
          style={[styles.myChallengesButton, { backgroundColor: "#7C3AED" }]}
        >
          <View style={styles.myChallengesButtonGradient}>
            <Ionicons
              name="person"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.myChallengesText}>My Challenges</Text>
          </View>
        </Pressable>
      </View>

      <ChallengeSection title="⏳ Upcoming" data={upcoming} type="Upcoming" />
      <ChallengeSection
        title="✅ Completed"
        data={completed}
        type="Completed"
      />

      <View style={styles.testButtonsContainer}>
        <Text style={styles.devSectionTitle}>Developer Testing Tools</Text>
        <Button
          title="Clear 7-day Notification Flag"
          onPress={clearNotificationFlag}
          color="#5A1A9B"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Clear Month Data"
          onPress={clearLastMonthData}
          color="#8A1E50"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Test 7-day Notification"
          onPress={sendTestNotification}
          color="#1A4A80"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Test New Month Notification"
          onPress={sendTestNewMonthNotification}
          color="#6B3FA0"
        />
      </View>
    </ScrollView>
  );
};

const ChallengeSection = ({ title, data, type }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {data.length ? (
      data.map((item) => (
        <QuestCard
          key={item.id}
          item={item}
          type={type}
          locked={type === "Upcoming"}
        />
      ))
    ) : (
      <Text style={styles.emptyText}>No missions found.</Text>
    )}
  </View>
);

const QuestCard = ({ item, type, onPress, locked }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isLocked = locked || type === "Upcoming";
  const badgeGradient =
    type === "Active"
      ? ["#7C3AED", "#7C3AED"]
      : type === "Upcoming"
      ? ["#444", "#222"]
      : standardGradientColors;

  return (
    <Pressable
      disabled={!onPress}
      onPressIn={() => (scale.value = withSpring(0.97))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.questCard,
          animatedStyle,
          isLocked && styles.lockedCard,
          type === "Active" && styles.activeCardBorder,
        ]}
      >
        <Text style={styles.questTitle}>{item.month} Challenge</Text>
        <LinearGradient
          colors={badgeGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.questBadge}
        >
          <Text style={styles.badgeText}>{type.toUpperCase()}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#131417", paddingBottom: 50 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#131417",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  levelText: { textAlign: "center", fontSize: 14, color: "#ddd", marginTop: 4 },
  xpTrack: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 5,
    marginTop: 10,
    overflow: "hidden",
  },
  xpFill: { height: 8, backgroundColor: "#7C3AED", borderRadius: 5 },
  countdown: {
    color: "#CCCCCC",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  progressPanel: { padding: 20 },
  panelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },
  myChallengesButton: { marginTop: 18, borderRadius: 20, overflow: "hidden" },
  myChallengesButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 20,
  },
  myChallengesText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  questTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  questCard: {
    backgroundColor: "#2B2D31",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4, // for Android
  },
  activeCardBorder: {
    borderColor: standardGradientColors[0],
    borderWidth: 1.5,
  },
  questDetail: { color: "#bbb", fontSize: 13, marginTop: 4 },
  questBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  emptyText: { color: "#666", fontStyle: "italic" },
  lockedCard: { opacity: 0.5 },
  testButtonsContainer: {
    padding: 16,
    marginTop: 20,
    backgroundColor: "#2B2D31",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  devSectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  buttonSpacer: {
    height: 12,
  },
});

export default ChallengesScreen;

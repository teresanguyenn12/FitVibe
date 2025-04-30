import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext"; // Import ThemeContext
import { useColorScheme } from "react-native"; // To detect system theme

const ActivityTracking = () => {
  const navigation = useNavigation();
  const { theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const headerTextColor = themeMode === "dark"
    ? "#FFFFFF"
    : themeMode === "light"
      ? "#111"
      : systemColorScheme === "dark"
        ? "#FFFFFF"
        : "#111";

  useEffect(() => {
    if (user) fetchActivityTrackingStatus();
  }, [user]);

  const fetchActivityTrackingStatus = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setIsTrackingEnabled(userDoc.data().activityTracking || false);
      }
    } catch (error) {
      console.error("Error fetching activity tracking status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTracking = async () => {
    try {
      const newStatus = !isTrackingEnabled;
      setIsTrackingEnabled(newStatus);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { activityTracking: newStatus });
    } catch (error) {
      console.error("Error updating activity tracking:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Activity Tracking</Text>
      </View>

      {/* Switch Card */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Enable Activity Tracking</Text>
        <Switch
          trackColor={{ 
            false: theme.mode === "dark" ? "#3A3D42" : "#e5e5ea", // darker gray for dark mode, lighter gray for light mode
            true: theme.primary 
          }}
          thumbColor={isTrackingEnabled ? "#fff" : "#aaa"}
          ios_backgroundColor={theme.mode === "dark" ? "#3A3D42" : "#e5e5ea"}
          onValueChange={toggleTracking}
          value={isTrackingEnabled}
        />
      </View>

      {/* Status Message */}
      <Text style={[styles.statusText, { color: theme.subtext }]}>
        {isTrackingEnabled ? "Activity tracking is enabled" : "Activity tracking is disabled"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 30,
  },
  card: {
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  statusText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 25,
  },
});

export default ActivityTracking;

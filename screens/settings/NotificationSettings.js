import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext"; // Import theme
import { useColorScheme } from "react-native"; // For system automatic mode

const NotificationSettings = () => {
  const navigation = useNavigation();
  const { theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [settings, setSettings] = useState({
    activityReminders: false,
    challengeUpdates: false,
    rewardsNotifications: false,
    friendRequests: false,
  });

  const headerTextColor = themeMode === "dark"
    ? "#FFFFFF"
    : themeMode === "light"
      ? "#111"
      : systemColorScheme === "dark"
        ? "#FFFFFF"
        : "#111";

  useEffect(() => {
    if (user) fetchNotificationSettings();
  }, [user]);

  const fetchNotificationSettings = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setSettings({
          activityReminders: data.activityReminders || false,
          challengeUpdates: data.challengeUpdates || false,
          rewardsNotifications: data.rewardsNotifications || false,
          friendRequests: data.friendRequests || false,
        });
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { [key]: newSettings[key] });
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  };

  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Notification Settings</Text>
      </View>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        {Object.entries(settings).map(([key, value]) => (
          <View key={key} style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{formatLabel(key)}</Text>
            <Switch
              trackColor={{
                false: theme.mode === "dark" ? "#3A3D42" : "#e5e5ea", 
                true: theme.primary
              }}
              thumbColor={value ? "#fff" : "#aaa"}
              ios_backgroundColor={theme.mode === "dark" ? "#3A3D42" : "#e5e5ea"}
              onValueChange={() => toggleSetting(key)}
              value={value}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 30,
  },
  settingsContainer: {
    marginTop: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default NotificationSettings;

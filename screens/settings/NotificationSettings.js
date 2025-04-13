import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const NotificationSettings = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [settings, setSettings] = useState({
    activityReminders: false,
    challengeUpdates: false,
    rewardsNotifications: false,
    friendRequests: false,
  });

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notification Settings</Text>
      </View>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        {Object.entries(settings).map(([key, value]) => (
          <View key={key} style={styles.settingItem}>
            <Text style={styles.settingLabel}>{formatLabel(key)}</Text>
            <Switch
              trackColor={{ false: "#3A3B3F", true: "#8e24aa" }}
              thumbColor={value ? "#fff" : "#888"}
              ios_backgroundColor="#3A3B3F"
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
    backgroundColor: "#121212",
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
    color: "#fff",
    fontWeight: "bold",
    marginRight: 30, 
  },
  settingsContainer: {
    marginTop: 10,
  },
  settingItem: {
    backgroundColor: "#1E1F23",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: "#2D2F33",
    borderWidth: 1,
  },
  settingLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default NotificationSettings;

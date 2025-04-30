import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useTheme } from "../../contexts/ThemeContext"; // Import ThemeContext

const PrivacySettings = () => {
  const navigation = useNavigation();
  const { theme } = useTheme(); // Use the theme
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [isPrivate, setIsPrivate] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isDataSharingEnabled, setIsDataSharingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPrivacySettings();
  }, [user]);

  const fetchPrivacySettings = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsPrivate(data.isPrivate || false);
        setIsLocationEnabled(data.isLocationEnabled || false);
        setIsDataSharingEnabled(data.isDataSharingEnabled || false);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySetting = async (setting, value) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { [setting]: value });

      Alert.alert("Updated", `${setting.replace(/([A-Z])/g, " $1")} updated.`);
    } catch (error) {
      console.error("Error updating privacy setting:", error);
      Alert.alert("Error", "Could not update privacy settings.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.text }]}>Privacy Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Toggle Settings */}
        <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.settingText, { color: theme.text }]}>Private Account</Text>
          <Switch
            value={isPrivate}
            onValueChange={(value) => {
              setIsPrivate(value);
              updatePrivacySetting("isPrivate", value);
            }}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isPrivate ? "#fff" : "#bbb"}
          />
        </View>

        <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.settingText, { color: theme.text }]}>Allow Location Access</Text>
          <Switch
            value={isLocationEnabled}
            onValueChange={(value) => {
              setIsLocationEnabled(value);
              updatePrivacySetting("isLocationEnabled", value);
            }}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isLocationEnabled ? "#fff" : "#bbb"}
          />
        </View>

        <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.settingText, { color: theme.text }]}>Allow Data Sharing</Text>
          <Switch
            value={isDataSharingEnabled}
            onValueChange={(value) => {
              setIsDataSharingEnabled(value);
              updatePrivacySetting("isDataSharingEnabled", value);
            }}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isDataSharingEnabled ? "#fff" : "#bbb"}
          />
        </View>

        {/* Manage Blocked Users */}
        <TouchableOpacity
          style={[styles.navigateCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("BlockedUsers")}
        >
          <Text style={[styles.settingText, { color: theme.text }]}>Manage Blocked Users</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 30,
  },
  scrollContainer: {
    paddingTop: 15,
    paddingBottom: 30,
  },
  settingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  navigateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default PrivacySettings;

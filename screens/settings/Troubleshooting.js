import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";
import { useColorScheme } from "react-native";

const Troubleshooting = () => {
  const navigation = useNavigation();
  const { theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();

  const headerTextColor =
    themeMode === "dark"
      ? "#FFFFFF"
      : themeMode === "light"
        ? "#111"
        : systemColorScheme === "dark"
          ? "#FFFFFF"
          : "#111";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: theme.headerBg }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Troubleshooting</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>App Not Loading?</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          Try restarting the app or checking your internet connection. Make sure you’re running the latest version of FitVibe.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Can't Log In?</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          Double check your email and password. If you've forgotten your password, use the "Forgot Password" option on the login screen.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Workout Data Missing?</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          Sync your device or app again and verify that permissions are granted for activity tracking in your phone settings.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Push Notifications Not Working?</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          Make sure notifications are enabled for FitVibe in your device’s system settings. Also check notification settings in the app.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Still Having Issues?</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          Head over to Contact Support so our team can help you out directly!
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
  text: {
    fontSize: 15,
    marginTop: 10,
    lineHeight: 22,
  },
});

export default Troubleshooting;

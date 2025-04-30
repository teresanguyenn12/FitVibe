import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";
import { useColorScheme } from "react-native";

const PrivacyPolicy = () => {
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
          <Ionicons name="chevron-back" size={30} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Privacy Policy</Text>
        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>1. Introduction</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          FitVibe respects your privacy. This Privacy Policy explains how we collect, use,
          and safeguard your information when you use the app.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>2. Data Collection</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          We may collect personal information such as your name, email, and workout data.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>3. Use of Data</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          We use your data to personalize your experience and to improve our services.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>4. Third-Party Services</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          We may use third-party services like Google Fit or Apple Health to enhance your experience.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>5. Contact Us</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          If you have questions about this policy, contact us at{" "}
          <Text style={[styles.email, { color: theme.primary }]}>support@fitvibeapp.com</Text>
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
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: "space-between",
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
  spacer: {
    width: 30,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  email: {
    fontWeight: "600",
  },
});

export default PrivacyPolicy;

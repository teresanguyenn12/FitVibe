import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";
import { useColorScheme } from "react-native";

const TermsOfService = () => {
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
        <Text style={[styles.headerText, { color: headerTextColor }]}>Terms of Service</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>1. Agreement</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          By using FitVibe, you agree to comply with and be bound by the following Terms of Service.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>2. Use of Service</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          You agree to use the app for personal, non-commercial use and to follow all applicable laws.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>3. Account Responsibility</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          You are responsible for keeping your login credentials secure and for all activities under your account.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>4. Termination</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          We reserve the right to terminate your access to the app for any violation of these terms.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>5. Contact</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          If you have any questions about these Terms, email us at support@fitvibeapp.com.
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
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
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

export default TermsOfService;

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext"; // Import useTheme
import { useColorScheme } from "react-native"; // For system theme detection

const FAQ = () => {
  const navigation = useNavigation();
  const { theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();

  const headerTextColor = themeMode === "dark"
    ? "#FFFFFF"
    : themeMode === "light"
      ? "#111"
      : systemColorScheme === "dark"
        ? "#FFFFFF"
        : "#111";

  const faqList = [
    {
      question: "How do I reset my password?",
      answer: "Go to Login > Forgot Password and follow the instructions to reset your password.",
    },
    {
      question: "Can I track workouts offline?",
      answer: "Yes, workout data is stored locally and synced when you're back online.",
    },
    {
      question: "How do I invite friends?",
      answer: "Navigate to Friends > Invite Friends and share your invite link.",
    },
    {
      question: "Where can I see my rewards?",
      answer: "Go to the Rewards tab in the bottom navigation to view earned rewards.",
    },
    {
      question: "How do I delete my account?",
      answer: "Go to Settings > Delete My Account and follow the confirmation steps.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>FAQ</Text>
      </View>

      {/* FAQ List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {faqList.map((faq, index) => (
          <View key={index} style={[styles.faqItem, { backgroundColor: theme.card }]}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={[styles.answer, { color: theme.text }]}>{faq.answer}</Text>
          </View>
        ))}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    paddingRight: 10,
    paddingTop: 20,
  },
  headerText: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 40, // balance spacing with back button
    paddingTop: 20,
  },
  scrollContainer: {
    padding: 20,
  },
  faqItem: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
  },
  question: {
    color: "#8e24aa", // keep the question purple always
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
});

export default FAQ;

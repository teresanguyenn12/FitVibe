import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";
import { useColorScheme } from "react-native";

const CommunityGuidelines = () => {
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
        <Text style={[styles.headerText, { color: headerTextColor }]}>Community Guidelines</Text>
        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>1. Be Respectful</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          Treat others with kindness and respect. We do not tolerate harassment, hate speech, or bullying of any kind.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>2. Share Responsibly</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          Only share content that is appropriate, safe, and fitness-related. Do not post misleading or inappropriate content.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>3. Stay Safe</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          Never share personal information like your home address or phone number. Be cautious when meeting others.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>4. Report Misconduct</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          If you encounter content or behavior that violates these guidelines, please report it immediately through the app.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>5. Supportive Vibes</Text>
        <Text style={[styles.text, { color: theme.subtext }]}>
          FitVibe is a space for motivation and community. Celebrate others’ wins, encourage progress, and stay positive.
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
  spacer: {
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

export default CommunityGuidelines;

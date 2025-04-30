import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext"; // Import ThemeContext
import { useColorScheme } from "react-native"; // To handle system theme

const HelpCenter = () => {
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

  const helpItems = [
    { label: "FAQ", screen: "FAQ" },
    { label: "Contact Support", screen: "ContactSupport" },
    { label: "Terms of Service", screen: "TermsOfService" },
    { label: "Community Guidelines", screen: "CommunityGuidelines" },
    { label: "Troubleshooting", screen: "Troubleshooting" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Help Center</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* Options */}
      <ScrollView contentContainerStyle={styles.content}>
        {helpItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.option, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={[styles.optionText, { color: theme.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
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
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
  },
});

export default HelpCenter;

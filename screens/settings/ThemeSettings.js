// ThemeSettings.js (Updated)
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeSettings = () => {
  const navigation = useNavigation();
  const { theme, themeMode, setTheme } = useTheme();
  const systemColorScheme = useColorScheme();

  const headerBackgroundColor = themeMode === "light" ? theme.background : theme.headerBg;
  const headerTextColor = themeMode === "dark"
    ? "#FFFFFF"
    : themeMode === "light"
      ? "#111"
      : systemColorScheme === "dark"
        ? "#FFFFFF"
        : "#111";

  const themes = [
    { id: "dark", label: "Dark Mode" },
    { id: "light", label: "Light Mode" },
    { id: "automatic", label: "Automatic (System Default)" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      {/* Header */}
      <SafeAreaView style={{ backgroundColor: headerBackgroundColor }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={30} color={headerTextColor} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerText, { color: headerTextColor }]}>Theme Mode</Text>
          </View>

          {/* Invisible placeholder to balance layout */}
          <View style={{ width: 30 }} />
        </View>
      </SafeAreaView>

      {/* Theme Options */}
      <View style={styles.optionsContainer}>
        {themes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.option,
              { 
                backgroundColor: theme.card,
                borderColor: themeMode === mode.id ? theme.primary : theme.border
              },
              themeMode === mode.id && styles.selectedOption
            ]}
            onPress={() => setTheme(mode.id)}
          >
            <Text style={[styles.optionText, { color: theme.text }]}> 
              {mode.label}
            </Text>
            {themeMode === mode.id && (
              <Ionicons name="checkmark" size={22} color={theme.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
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
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 15,
  },
  backButton: {
    paddingTop: 20,
    width: 30, // Matches invisible placeholder width
    alignItems: "flex-start",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    paddingTop: 20,
    fontSize: 22,
    fontWeight: "bold",
  },
  optionsContainer: {
    padding: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
});

export default ThemeSettings;

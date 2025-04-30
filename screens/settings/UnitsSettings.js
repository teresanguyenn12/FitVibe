import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../contexts/ThemeContext"; // Import ThemeContext
import { useColorScheme } from "react-native"; // To support automatic mode

const UnitsSettings = () => {
  const [selectedUnit, setSelectedUnit] = useState("imperial");
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

  useEffect(() => {
    const fetchUnit = async () => {
      const storedUnit = await AsyncStorage.getItem("units");
      if (storedUnit) setSelectedUnit(storedUnit);
    };
    fetchUnit();
  }, []);

  const handleSelect = async (unit) => {
    setSelectedUnit(unit);
    await AsyncStorage.setItem("units", unit);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Units of Measurement</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {["imperial", "metric"].map((unit) => (
          <TouchableOpacity
            key={unit}
            style={[
              styles.option,
              { backgroundColor: theme.card, borderColor: selectedUnit === unit ? theme.primary : theme.card },
              selectedUnit === unit && styles.selectedOption,
            ]}
            onPress={() => handleSelect(unit)}
          >
            <Text style={[styles.optionText, { color: theme.text }]}>
              {unit === "imperial" ? "Imperial (Miles, lbs)" : "Metric (Km, kg)"}
            </Text>
            {selectedUnit === unit && <Ionicons name="checkmark" size={20} color={theme.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  option: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
  },
  selectedOption: {
    // Border color is handled dynamically
  },
  optionText: {
    fontSize: 16,
  },
});

export default UnitsSettings;

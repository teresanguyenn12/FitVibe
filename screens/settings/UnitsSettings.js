import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UnitsSettings = () => {
  const [selectedUnit, setSelectedUnit] = useState("imperial");
  const navigation = useNavigation();

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
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Units of Measurement</Text>
      </View>

      <View style={styles.optionsContainer}>
        {["imperial", "metric"].map((unit) => (
          <TouchableOpacity
            key={unit}
            style={[styles.option, selectedUnit === unit && styles.selectedOption]}
            onPress={() => handleSelect(unit)}
          >
            <Text style={styles.optionText}>
              {unit === "imperial" ? "Imperial (Miles, lbs)" : "Metric (Km, kg)"}
            </Text>
            {selectedUnit === unit && <Ionicons name="checkmark" size={20} color="#8e24aa" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop:20,
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
    color: "#fff",
    textAlign: "center",
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  option: {
    backgroundColor: "#2B2D31",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    borderColor: "#8e24aa",
    borderWidth: 2,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default UnitsSettings;

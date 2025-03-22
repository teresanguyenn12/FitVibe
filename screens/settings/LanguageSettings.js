import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const LanguageSettings = () => {
  const navigation = useNavigation();

  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(null);
  const [items, setItems] = useState([
    { label: "English", value: "en" },
    { label: "Español", value: "es" },
    { label: "Français", value: "fr" },
    { label: "Deutsch", value: "de" },
    { label: "日本語", value: "ja" },
    { label: "中文", value: "zh" },
    { label: "한국어", value: "ko" },
  ]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Language</Text>
      </View>

      {/* Dropdown */}
      <View style={styles.dropdownWrapper}>
        <DropDownPicker
          open={open}
          value={language}
          items={items}
          setOpen={setOpen}
          setValue={setLanguage}
          setItems={setItems}
          placeholder="Select a language..."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.placeholder}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
    marginTop: 80,
    marginBottom: 40,
    position: "relative", 
  },
  backButton: {
    position: "absolute",
    left: 0,
    paddingLeft: 10,
  },
  headerText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  dropdownWrapper: {
    zIndex: 1000, 
  },
  dropdown: {
    backgroundColor: "#2B2D31",
    borderColor: "#444",
  },
  dropdownList: {
    backgroundColor: "#2B2D31",
    borderColor: "#444",
  },
  dropdownText: {
    color: "#fff",
  },
  placeholder: {
    color: "#bbb",
  },
});

export default LanguageSettings;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext"; // Use your theme context
import { useColorScheme } from "react-native"; // To detect system theme

const ReportProblem = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState("");

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

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert("Please describe the problem before submitting.");
      return;
    }

    // Simulate submission
    Alert.alert("Thank you!", "Your problem report has been submitted.");
    setMessage("");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Report a Problem</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Form */}
      <Text style={[styles.label, { color: theme.text }]}>Describe the issue you're facing:</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        multiline
        numberOfLines={6}
        placeholder="Enter your message here..."
        placeholderTextColor={theme.subtext}
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
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
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    textAlignVertical: "top",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#8e24aa",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ReportProblem;

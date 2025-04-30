import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext"; // ThemeContext
import { useColorScheme } from "react-native"; // System appearance

const ContactSupport = () => {
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

  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() === "") {
      Alert.alert("Oops", "Please enter your message before submitting.");
      return;
    }

    Alert.alert("Message Sent", "Thanks! Our support team will get back to you soon.");
    setMessage("");
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Contact Support</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: theme.text }]}>How can we help you?</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }]}
          multiline
          placeholder="Write your message here..."
          placeholderTextColor={theme.subtext}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 15,
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
  formContainer: {
    marginTop: 30,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  textInput: {
    borderRadius: 10,
    padding: 15,
    height: 150,
    textAlignVertical: "top",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#8e24aa",
    paddingVertical: 14,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ContactSupport;

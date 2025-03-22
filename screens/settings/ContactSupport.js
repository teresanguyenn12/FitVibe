import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ContactSupport = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() === "") {
      Alert.alert("Oops", "Please enter your message before submitting.");
      return;
    }

    // In a real app, this is where you'd send the message to support (e.g., Firebase, email)
    Alert.alert("Message Sent", "Thanks! Our support team will get back to you soon.");
    setMessage("");
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Contact Support</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>How can we help you?</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Write your message here..."
          placeholderTextColor="#888"
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
    backgroundColor: "#131417",
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 15,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    flex: 1,
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    marginTop: 30,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: "#2B2D31",
    borderRadius: 10,
    padding: 15,
    height: 150,
    textAlignVertical: "top",
    color: "#fff",
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

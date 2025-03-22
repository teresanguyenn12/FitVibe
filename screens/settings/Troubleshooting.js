import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Troubleshooting = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Troubleshooting</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>App Not Loading?</Text>
        <Text style={styles.text}>
          Try restarting the app or checking your internet connection. Make sure you’re running the latest version of FitVibe.
        </Text>

        <Text style={styles.sectionTitle}>Can't Log In?</Text>
        <Text style={styles.text}>
          Double check your email and password. If you've forgotten your password, use the "Forgot Password" option on the login screen.
        </Text>

        <Text style={styles.sectionTitle}>Workout Data Missing?</Text>
        <Text style={styles.text}>
          Sync your device or app again and verify that permissions are granted for activity tracking in your phone settings.
        </Text>

        <Text style={styles.sectionTitle}>Push Notifications Not Working?</Text>
        <Text style={styles.text}>
          Make sure notifications are enabled for FitVibe in your device’s system settings. Also check notification settings in the app.
        </Text>

        <Text style={styles.sectionTitle}>Still Having Issues?</Text>
        <Text style={styles.text}>
          Head over to Contact Support so our team can help you out directly!
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#131417",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 60,
  },
  headerText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#8e24aa",
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
  text: {
    color: "#ccc",
    fontSize: 15,
    marginTop: 10,
    lineHeight: 22,
  },
});

export default Troubleshooting;

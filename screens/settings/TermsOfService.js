import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TermsOfService = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Terms of Service</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. Agreement</Text>
        <Text style={styles.text}>
          By using FitVibe, you agree to comply with and be bound by the following Terms of Service.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Service</Text>
        <Text style={styles.text}>
          You agree to use the app for personal, non-commercial use and to follow all applicable laws.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Responsibility</Text>
        <Text style={styles.text}>
          You are responsible for keeping your login credentials secure and for all activities under your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Termination</Text>
        <Text style={styles.text}>
          We reserve the right to terminate your access to the app for any violation of these terms.
        </Text>

        <Text style={styles.sectionTitle}>5. Contact</Text>
        <Text style={styles.text}>
          If you have any questions about these Terms, email us at support@fitvibeapp.com.
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

export default TermsOfService;

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CommunityGuidelines = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Community Guidelines</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. Be Respectful</Text>
        <Text style={styles.text}>
          Treat others with kindness and respect. We do not tolerate harassment, hate speech, or bullying of any kind.
        </Text>

        <Text style={styles.sectionTitle}>2. Share Responsibly</Text>
        <Text style={styles.text}>
          Only share content that is appropriate, safe, and fitness-related. Do not post misleading or inappropriate content.
        </Text>

        <Text style={styles.sectionTitle}>3. Stay Safe</Text>
        <Text style={styles.text}>
          Never share personal information like your home address or phone number. Be cautious when meeting others.
        </Text>

        <Text style={styles.sectionTitle}>4. Report Misconduct</Text>
        <Text style={styles.text}>
          If you encounter content or behavior that violates these guidelines, please report it immediately through the app.
        </Text>

        <Text style={styles.sectionTitle}>5. Supportive Vibes</Text>
        <Text style={styles.text}>
          FitVibe is a space for motivation and community. Celebrate others’ wins, encourage progress, and stay positive.
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

export default CommunityGuidelines;

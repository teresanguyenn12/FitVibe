import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const HelpCenter = () => {
  const navigation = useNavigation();

  const helpItems = [
    { label: "FAQ", screen: "FAQ" },
    { label: "Contact Support", screen: "ContactSupport" },
    { label: "Terms of Service", screen: "TermsOfService" },
    { label: "Community Guidelines", screen: "CommunityGuidelines" },
    { label: "Troubleshooting", screen: "Troubleshooting" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {helpItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.option}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.optionText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ))}
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
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2B2D31",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default HelpCenter;

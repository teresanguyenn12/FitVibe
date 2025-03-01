import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const RewardsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.text}>Rewards</Text>
      <Text style={styles.subtext}>Coming Soon!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
      },
      backButton: {
        position: "absolute",
        top: 90,
        left: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: 10,
        borderRadius: 10,
      },
      text: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
      },
      subtext: {
        color: "#bbb",
        fontSize: 16,
        marginTop: 10,
      },
});

export default RewardsScreen;

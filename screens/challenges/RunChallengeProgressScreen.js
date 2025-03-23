import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";


const RunChallengeProgressScreen = ({ route }) => {
  const { challenge } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{challenge.name}</Text>

      {/* Circular Progress Placeholder */}
      <View style={styles.circle}>
        <Text style={styles.percent}>0%</Text>
      </View>

      {/* Time and Miles Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Time Left</Text>
        <Text style={styles.value}>00 : 23 : 59 : 59</Text>

        <View style={styles.milesRow}>
          <View style={styles.mileBox}>
            <Text style={styles.smallLabel}>Miles Left</Text>
            <Text style={styles.smallValue}>{challenge.distance || "10.0"} </Text>
          </View>
          <View style={styles.mileBox}>
            <Text style={styles.smallLabel}>Completed</Text>
            <Text style={styles.smallValue}>0.0 miles</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RunChallengeProgressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
    alignItems: "center",
  },
  header: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 50,
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 30,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  percent: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },
  infoContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  label: {
    color: "#bbb",
    fontSize: 20,
    fontWeight: "bold",
  },
  value: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 10,
  },
  milesRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },
  mileBox: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    width: 150,
  },
  smallLabel: {
    color: "#aaa",
    fontSize: 18,
    fontWeight: "bold",
  },
  smallValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
});

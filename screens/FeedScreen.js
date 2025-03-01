import React from "react";
import { View, Text, StyleSheet } from "react-native";

const FeedScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Feed Page Coming Soon!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default FeedScreen;

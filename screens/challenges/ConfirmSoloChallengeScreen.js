import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { joinChallenge } from "../../services/joinChallenge";
import { auth } from "../../firebase";

const ConfirmSoloChallengeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { challenge } = route.params;

  const handleConfirm = async () => {
    const user = auth.currentUser;
    if (user) {
      await joinChallenge(user.uid, challenge.id);
      navigation.navigate("RunChallengeProgressScreen", { challenge });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/SoloChallenge.png")} 
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.confirmBox}>
        <Text style={styles.title}>Solo Challenge:</Text>
        <Text style={styles.challengeName}>{challenge.name}?</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "65%",
  },
  confirmBox: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  challengeName: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: "center",
  },
  confirmText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ConfirmSoloChallengeScreen;

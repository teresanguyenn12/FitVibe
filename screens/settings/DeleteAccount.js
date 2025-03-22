import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const DeleteAccount = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);

  const confirmDelete = () => {
    Alert.prompt(
      "Confirm Deletion",
      "Please enter your password to confirm account deletion:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async (password) => {
            if (!password) return;

            setLoading(true);
            try {
              const credential = EmailAuthProvider.credential(user.email, password);
              await reauthenticateWithCredential(user, credential);
              await deleteUser(user);
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", error.message || "Failed to delete account.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      "secure-text"
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delete My Account</Text>
      <Text style={styles.confirmationText}>
        Are you sure you want to permanently delete your account?
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#8e24aa" style={{ marginTop: 20 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  confirmationText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  deleteButton: {
    backgroundColor: "#e53935",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 15,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#444",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DeleteAccount;

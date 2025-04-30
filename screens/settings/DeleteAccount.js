import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { useTheme } from "../../contexts/ThemeContext";
import { useColorScheme } from "react-native";

const DeleteAccount = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();

  const headerTextColor =
    themeMode === "dark"
      ? "#FFFFFF"
      : themeMode === "light"
        ? "#111"
        : systemColorScheme === "dark"
          ? "#FFFFFF"
          : "#111";

  const handleDelete = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);

      Alert.alert("Account Deleted", "Your account has been successfully deleted.");
    } catch (error) {
      console.error("Error deleting account:", error);
      let message = "An error occurred.";

      if (error.code === "auth/invalid-credential") {
        message = "Invalid password. Please try again.";
      } else if (error.code === "auth/requires-recent-login") {
        message = "Please log in again before trying to delete your account.";
      }

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setPassword("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Delete Your Account</Text>
      <Text style={[styles.description, { color: theme.subtext }]}>
        This action is permanent and will delete all your data. Please confirm your password to proceed.
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.deleteButtonText}>Delete My Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.cancelButton,
          { backgroundColor: themeMode === "light" ? "#e5e5ea" : theme.card }
        ]}
        onPress={() => {
          setModalVisible(false);
          setPassword("");
          navigation.goBack();
        }}
      >
        <Text
          style={[
            styles.cancelButtonText,
            { color: themeMode === "light" ? "#111" : theme.text }
          ]}
        >
          Cancel
        </Text>
      </TouchableOpacity>


      {/* Modal left untouched as requested */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Password</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.input, color: theme.text }]}
              placeholder="Enter your password"
              placeholderTextColor={theme.subtext}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: "#D32F2F" }]}
              onPress={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm & Delete</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalCancelBtn,
                { backgroundColor: theme.card } // Apply theme.card for background
              ]}
              onPress={() => {
                setModalVisible(false);
                setPassword("");
                navigation.goBack();
              }}
            >
              <Text
                style={[
                  styles.modalCancelText,
                  { color: theme.text }
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 5,
    alignItems: "center",
    width: "63%", 
    alignSelf: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    padding: 25,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  confirmButton: {
    backgroundColor: "#8e24aa",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  modalCancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    width: "100%", // Same width as Confirm button
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

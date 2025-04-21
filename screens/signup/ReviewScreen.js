import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUserSignUp } from "../../contexts/UserSignUpContext";
import { useAuth } from "../../authProvider";

export default function ReviewScreen() {
  const { formData } = useUserSignUp();
  const { register, setJustSignedUp } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      dob,
      gender,
      phone,
      profilePicture,
    } = formData;

    const fullName = `${firstName} ${lastName}`;
    setLoading(true);

    try {
      await register(email, password, fullName, {
        username,
        dob: dob ? dob.toISOString() : null,
        gender,
        phone,
        profilePicture,
      });

      setJustSignedUp(true);
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Review your info</Text>

      {formData.profilePicture ? (
        <Image source={{ uri: formData.profilePicture }} style={styles.image} />
      ) : null}

      <View style={styles.infoBox}>
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>{formData.firstName} {formData.lastName}</Text>

        <Text style={styles.label}>Username:</Text>
        <Text style={styles.value}>@{formData.username}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{formData.email}</Text>

        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{formData.phone}</Text>

        <Text style={styles.label}>Gender:</Text>
        <Text style={styles.value}>{formData.gender}</Text>

        <Text style={styles.label}>Date of Birth:</Text>
        <Text style={styles.value}>{formData.dob ? new Date(formData.dob).toLocaleDateString() : ""}</Text>
      </View>

      <TouchableOpacity onPress={handleCreateAccount} disabled={loading}>
        <View style={styles.button}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Create My Account</Text>
          )}
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    borderColor: "#333",
    borderWidth: 1,
  },
  label: {
    color: "#888",
    fontSize: 14,
    marginTop: 12,
  },
  value: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 50,
    backgroundColor: "#5A1A9B",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

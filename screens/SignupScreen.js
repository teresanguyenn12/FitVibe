import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For back arrow icon
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient
import { auth, createUserWithEmailAndPassword } from "../firebaseConfig"; // Import Firebase Auth

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User registered:", userCredential.user);
      navigation.navigate("HomeTabs");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Sign Up!</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#aaa" onChangeText={setFirstName} value={firstName} />
      <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#aaa" onChangeText={setLastName} value={lastName} />
      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#aaa" onChangeText={setUsername} value={username} />
      <TextInput style={styles.input} placeholder="Date of Birth" placeholderTextColor="#aaa" onChangeText={setDob} value={dob} />
      <TextInput style={styles.input} placeholder="Gender" placeholderTextColor="#aaa" onChangeText={setGender} value={gender} />
      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#aaa" keyboardType="phone-pad" onChangeText={setPhone} value={phone} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" keyboardType="email-address" onChangeText={setEmail} value={email} />
      <TextInput style={styles.input} placeholder="Create Password" placeholderTextColor="#aaa" secureTextEntry onChangeText={setPassword} value={password} />
      <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#aaa" secureTextEntry onChangeText={setConfirmPassword} value={confirmPassword} />
      
      {loading ? (
        <ActivityIndicator size="large" color="#8e24aa" />
      ) : (
        <TouchableOpacity onPress={handleSignUp}>
          <LinearGradient colors={["#1a1a2e", "#662d8c", "#ed1e79"]} style={styles.button}>
            <Text style={styles.buttonText}>Create Account</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

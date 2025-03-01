import React, { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { useAuth } from "../authProvider";

export default function SignUpScreen({ navigation }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      await register(email, password, fullName);
      navigation.navigate("HomeTabs"); // Navigate to Home after signup
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Create Account</Text>

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <TextInput placeholder="Full Name" onChangeText={setFullName} value={fullName} />
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} keyboardType="email-address" />
      <TextInput placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry />

      {loading ? (
        <ActivityIndicator size="large" color="#8e24aa" />
      ) : (
        <Button title="Sign Up" onPress={handleSignUp} />
      )}
    </View>
  );
}
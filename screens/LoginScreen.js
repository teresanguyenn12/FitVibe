import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Dimensions,
}

from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { Image } from "react-native";
const { width, height } = Dimensions.get("window");

//Presets for loginscreen
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  //User authentication for loging in
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully!");
      navigation.navigate("HomeTabs");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} 
      locations={[0, 0.5, 1]} 
      start={{ x: 1, y: 0 }} 
      end={{ x: 0, y: 1 }} 
      style={styles.background}
    >
      <View style={styles.container}>
        {/* FitVibe Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>FitVibe</Text>
          <Image
            source={require("../assets/FVLOGO.png")}
            style={styles.logoImage}
          />
        </View>

        {/* White Background for Inputs & Buttons */}
        <View style={styles.formContainer}>
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#000"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder=""
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              {/* Password Hidden/Seen */}
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#5A1A9B"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() =>
                Alert.alert(
                  "Reset Password",
                  "Redirect to Forgot Password screen."
                )
              }
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Remember Me Toggle */}
          <View style={styles.rememberContainer}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: "#ccc", true: "#5A1A9B" }}
              thumbColor={rememberMe ? "#fff" : "#f4f3f4"}
            />
            <Text style={styles.rememberText}>Remember Me</Text>
          </View>

          {/* Log In Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity style={styles.createAccountButton}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

// Styling
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    width: "100%",
  },

  logoContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "flex-start", 
    alignSelf: "flex-start", 
    paddingLeft: 6, 
    marginTop: 150, 
  },

  title: {
    fontSize: 50, 
    fontFamily: "TiltWarp-Regular",
    color: "#fff",
    letterSpacing: 1.5, 
    marginRight: 10, 
  },

  logoBadge: {
    backgroundColor: "#D70040",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },

  logoImage: {
    width: 68, 
    height: 68,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },

  formContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    width: "105%",
    minHeight: height * 0.9,
    alignItems: "center",
    marginTop: height * 0.11,
  },

  inputContainer: {
    width: "100%",
    marginTop: 25,
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    color: "#5A1A9B",
    marginBottom: 5,
    fontFamily: "TiltWarp-Regular",
  },

  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#000",
    fontSize: 16,
    paddingVertical: 5,
    color: "#000",
    width: "100%",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000",
    paddingVertical: 5,
    width: "100%",
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 5,
  },

  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 5,
  },

  forgotPassword: {
    color: "#5A1A9B",
    fontSize: 12,
  },

  rememberContainer: {
    flexDirection: "row-reverse", 
    alignItems: "center",
    justifyContent: "flex-end", 
    alignSelf: "flex-end", 
    width: "50%", 
    marginBottom: 20,
    paddingRight: 20, 
  },

  rememberText: {
    color: "#5A1A9B",
    fontSize: 16,
    marginRight: 10, 
  },

  loginButton: {
    backgroundColor: "#5A1A9B",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },

  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "TiltWarp-Regular",
  },

  createAccountButton: {
    marginTop: 10,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    borderColor: "#5A1A9B",
    borderWidth: 2,
    borderRadius: 12,
  },

  createAccountText: {
    color: "#5A1A9B",
    fontWeight: "bold",
    fontFamily: "TiltWarp-Regular",
    fontSize: 18,
  },
});

export default LoginScreen;

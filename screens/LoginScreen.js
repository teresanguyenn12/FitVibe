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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

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
    <ImageBackground
    source={require("../assets/background.png")} // Ensure this matches your file path
    style={styles.background}
    resizeMode="cover" // Ensures full coverage
  >
      <View style={styles.container}>
        {/* FitVibe Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>FitVibe</Text>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>FV</Text>
          </View>
        </View>

        {/* White Background for Inputs & Buttons */}
        <View style={styles.formContainer}>
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#511589"
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
              trackColor={{ false: "#ccc", true: "#511589" }}
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
    </ImageBackground>
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
    marginTop: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  logoBadge: {
    backgroundColor: "#D70040",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
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
    marginTop: height * 0.125,
  },
  inputContainer: {
    width: "100%",
    marginTop: 25,
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: "#511589",
    fontWeight: "bold",
    marginBottom: 5,
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
    color: "#511589",
    fontSize: 12,
  },
  rememberContainer: {
    flexDirection: "row-reverse", // 🔹 Moves text left of the switch
    alignItems: "center",
    justifyContent: "flex-end", // 🔹 Aligns items to the right
    alignSelf: "flex-end", // 🔹 Positions the whole container on the right
    width: "50%", // 🔹 Keeps it neatly inside the white container
    marginBottom: 20,
    paddingRight: 20, // 🔹 Ensures some spacing from the right edge
  },

  rememberText: {
    color: "#511589",
    fontSize: 16,
    marginRight: 10, // 🔹 Adds space between text and switch
  },

  loginButton: {
    backgroundColor: "#511589",
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
  },
  createAccountButton: {
    marginTop: 10,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    borderColor: "#511589",
    borderWidth: 2,
    borderRadius: 12,
  },
  createAccountText: {
    color: "#511589",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default LoginScreen;

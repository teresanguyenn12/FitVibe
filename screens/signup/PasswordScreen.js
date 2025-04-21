import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUserSignUp } from "../../contexts/UserSignUpContext";

export default function PasswordScreen() {
  const navigation = useNavigation();
  const { updateFormData, formData } = useUserSignUp();
  const [password, setPassword] = useState(formData.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const strongEnough = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
    setIsValid(strongEnough);
    setPasswordsMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const handleNext = () => {
    if (!isValid || !passwordsMatch) return;
    updateFormData({ password });
    navigation.navigate("ProfilePicture");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Create a password</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, password && !isValid ? styles.inputError : null]}
            placeholder="Enter password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, confirmPassword && !passwordsMatch ? styles.inputError : null]}
            placeholder="Confirm password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setShowConfirmPassword((prev) => !prev)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {!isValid && password.length > 0 && (
          <Text style={styles.hint}>
            Password must be at least 8 characters, contain an uppercase letter, a number, and a special character.
          </Text>
        )}
        {confirmPassword.length > 0 && !passwordsMatch && (
          <Text style={styles.hint}>Passwords do not match.</Text>
        )}

        <TouchableOpacity disabled={!isValid || !passwordsMatch} onPress={handleNext}>
          <View
            style={[styles.button, {
              backgroundColor: "#5A1A9B",
              opacity: isValid && passwordsMatch ? 1 : 0.5,
            }]}
          >
            <Text style={styles.buttonText}>Next</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 10,
    marginTop: 10,
  },
  contentWrapper: {
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 40,
    textAlign: "center",
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    borderColor: "#333",
    borderWidth: 1,
    paddingRight: 45,
  },
  inputError: {
    borderColor: "crimson",
    borderWidth: 1,
  },
  icon: {
    position: "absolute",
    right: 10,
    top: "50%",
    marginTop: -12,
  },
  hint: {
    color: "crimson",
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    marginTop: 20,
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

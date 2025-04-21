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

export default function PhoneScreen() {
  const navigation = useNavigation();
  const { updateFormData, formData } = useUserSignUp();
  const [phone, setPhone] = useState(formData.phone || "");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const isValidNumber = /^[0-9]{10,15}$/.test(phone);
    setIsValid(isValidNumber);
  }, [phone]);

  const handleNext = () => {
    if (!isValid) return;
    updateFormData({ phone });
    navigation.navigate("Email");
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
        <Text style={styles.title}>What's your phone number?</Text>

        <TextInput
          style={[styles.input, !isValid && phone ? styles.inputError : null]}
          placeholder="e.g. 5551234567"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
          maxLength={15}
        />

        {!isValid && phone.length > 0 && (
          <Text style={styles.hint}>Please enter a valid phone number (10–15 digits).</Text>
        )}

        <TouchableOpacity disabled={!isValid} onPress={handleNext}>
          <View
            style={[
              styles.button,
              { backgroundColor: "#5A1A9B", opacity: isValid ? 1 : 0.5 },
            ]}
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
  input: {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    borderColor: "#333",
    borderWidth: 1,
  },
  inputError: {
    borderColor: "crimson",
    borderWidth: 1,
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
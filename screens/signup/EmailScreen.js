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
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useUserSignUp } from "../../contexts/UserSignUpContext";
import { app } from "../../firebase";

const db = getFirestore(app);

export default function EmailScreen() {
  const navigation = useNavigation();
  const { updateFormData, formData } = useUserSignUp();
  const [email, setEmail] = useState(formData.email || "");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isUnique, setIsUnique] = useState(null);
  const [checking, setChecking] = useState(false);
  const [isValidFormat, setIsValidFormat] = useState(true);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const validateFormat = (value) => {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setIsValidFormat(valid);
      return valid;
    };

    const checkEmail = async () => {
      if (!email.trim() || !validateFormat(email)) {
        setIsUnique(null);
        return;
      }

      setChecking(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email.trim().toLowerCase()));
        const querySnapshot = await getDocs(q);
        setIsUnique(querySnapshot.empty);
      } catch (err) {
        console.error("Error checking email uniqueness:", err);
        setIsUnique(false);
      } finally {
        setChecking(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      checkEmail();
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [email]);

  const handleNext = () => {
    if (!email || !isUnique || !isValidFormat) return;
    updateFormData({ email });
    navigation.navigate("Password");
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
        <Text style={styles.title}>What's your email?</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, !isValidFormat && email ? styles.inputError : null]}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {checking ? (
            <ActivityIndicator size="small" color="#8e24aa" style={styles.icon} />
          ) : isUnique === true && isValidFormat ? (
            <Ionicons name="checkmark-circle" size={24} color="limegreen" style={styles.icon} />
          ) : isUnique === false || !isValidFormat ? (
            <Ionicons name="close-circle" size={24} color="crimson" style={styles.icon} />
          ) : null}
        </View>

        {!isValidFormat && email && (
          <Text style={styles.hint}>Please enter a valid email address.</Text>
        )}
        {isValidFormat && isUnique === false && (
          <Text style={styles.hint}>Email is already in use. Try another.</Text>
        )}

        <TouchableOpacity
          disabled={!email || !isUnique || !isValidFormat}
          onPress={handleNext}
        >
          <View
            style={[
              styles.button,
              {
                backgroundColor: "#5A1A9B",
                opacity: email && isUnique && isValidFormat ? 1 : 0.5,
              },
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
    paddingRight: 40,
    borderColor: "#333",
    borderWidth: 1,
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

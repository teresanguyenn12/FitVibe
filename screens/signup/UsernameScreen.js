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
import { app } from "../../firebase"; // adjust if needed

const db = getFirestore(app);

export default function UsernameScreen() {
  const navigation = useNavigation();
  const { updateFormData, formData } = useUserSignUp();
  const [username, setUsername] = useState(formData.username || "");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isUnique, setIsUnique] = useState(null); // null = not checked
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
      const valid = /^[a-zA-Z0-9_]{4,15}$/.test(value);
      setIsValidFormat(valid);
      return valid;
    };

    const checkUsername = async () => {
      if (!username.trim() || !validateFormat(username)) {
        setIsUnique(null);
        return;
      }

      setChecking(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username.trim()));
        const querySnapshot = await getDocs(q);
        setIsUnique(querySnapshot.empty);
      } catch (err) {
        console.error("Error checking username uniqueness:", err);
        setIsUnique(false);
      } finally {
        setChecking(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      checkUsername();
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleNext = () => {
    if (!username || !isUnique || !isValidFormat) return;
    updateFormData({ username });
    navigation.navigate("DateOfBirth");
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
        <Text style={styles.title}>Pick a username</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              !isValidFormat && username ? styles.inputError : null,
            ]}
            placeholder="@username"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          {checking ? (
            <ActivityIndicator size="small" color="#8e24aa" style={styles.icon} />
          ) : isUnique === true && isValidFormat ? (
            <Ionicons name="checkmark-circle" size={24} color="limegreen" style={styles.icon} />
          ) : isUnique === false || !isValidFormat ? (
            <Ionicons name="close-circle" size={24} color="crimson" style={styles.icon} />
          ) : null}
        </View>

        {!isValidFormat && (
          <Text style={styles.hint}>
            Username must be 4–15 characters long and contain only letters, numbers, or underscores.
          </Text>
        )}
        {isValidFormat && isUnique === false && (
          <Text style={styles.hint}>Username is already taken. Try another.</Text>
        )}

        <TouchableOpacity
          disabled={!username || !isUnique || !isValidFormat}
          onPress={handleNext}
        >
          <View
            style={[
              styles.button,
              {
                backgroundColor: "#5A1A9B",
                opacity: username && isUnique && isValidFormat ? 1 : 0.5,
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
    marginTop:10,
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

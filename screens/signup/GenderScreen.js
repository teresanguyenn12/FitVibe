import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUserSignUp } from "../../contexts/UserSignUpContext";

export default function GenderScreen() {
  const navigation = useNavigation();
  const { updateFormData, formData } = useUserSignUp();

  const [gender, setGender] = useState(formData.gender || "");
  const [showOptions, setShowOptions] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = () => {
    if (!gender) return;
    updateFormData({ gender });
    navigation.navigate("Phone");
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const selectGender = (val) => {
    setGender(val);
    setShowOptions(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollWrapper} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          <Text style={styles.title}>What's your gender?</Text>

          <TouchableOpacity style={styles.selector} onPress={toggleOptions}>
            <Text style={gender ? styles.selectedText : styles.placeholderText}>
              {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "Select Gender"}
            </Text>
            <Ionicons
              name={showOptions ? "chevron-up" : "chevron-down"}
              size={20}
              color="white"
            />
          </TouchableOpacity>

          {showOptions && (
            <View style={styles.optionsContainer}>
              {["male", "female", "other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.option,
                    gender === g && { backgroundColor: "#2e2e2e" },
                  ]}
                  onPress={() => selectGender(g)}
                >
                  <Text style={styles.optionText}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity disabled={!gender} onPress={handleNext}>
            <View
              style={[
                styles.button,
                {
                  backgroundColor: "#5A1A9B",
                  opacity: gender ? 1 : 0.5,
                },
              ]}
            >
              <Text style={styles.buttonText}>Next</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 10,
    marginTop: 10,
  },
  scrollWrapper: {
    paddingTop: 50,
    paddingBottom: 40,
  },
  contentWrapper: {
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 40,
  },
  selector: {
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 10,
    borderColor: "#333",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedText: { color: "white", fontSize: 16 },
  placeholderText: { color: "#aaa", fontSize: 16 },
  optionsContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  option: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  optionText: { color: "white", fontSize: 16 },
  button: {
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

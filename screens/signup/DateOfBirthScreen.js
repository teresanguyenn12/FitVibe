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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUserSignUp } from "../../contexts/UserSignUpContext";

export default function DateOfBirthScreen() {
  const navigation = useNavigation();
  const { updateFormData, formData } = useUserSignUp();
  const [dob, setDob] = useState(formData.dob ? new Date(formData.dob) : new Date(2005, 0, 1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isValidAge, setIsValidAge] = useState(true);

  const today = new Date();
  const minAge = 13;
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const ageValid = dob <= maxDate;
    setIsValidAge(ageValid);
  }, [dob]);

  const handleNext = () => {
    if (!dob || !isValidAge) return;
    updateFormData({ dob });
    navigation.navigate("Gender");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollWrapper} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          <Text style={styles.title}>When is your birthday?</Text>
          <Text style={styles.subtitle}>You must be at least 13 years old to register.</Text>

          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={dob}
              mode="date"
              display="spinner"
              maximumDate={maxDate}
              onChange={(e, selectedDate) => selectedDate && setDob(selectedDate)}
              textColor="white"
              style={styles.datePicker}
            />
          </View>

          {!isValidAge && (
            <Text style={styles.warning}>You must be at least 13 years old to continue.</Text>
          )}

          <TouchableOpacity
            style={styles.buttonWrapper}
            disabled={!isValidAge}
            onPress={handleNext}
          >
            <View
              style={[
                styles.button,
                {
                  backgroundColor: "#5A1A9B",
                  opacity: isValidAge ? 1 : 0.5,
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
  scrollWrapper: {
    paddingTop: 80,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 10,
    marginTop:10,
  },
  contentWrapper: {
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
  },
  pickerContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  warning: {
    color: "crimson",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  buttonWrapper: {
    alignItems: "center",
    marginTop: 30,
  },
  button: {
    padding: 16,
    width: "100%",
    borderRadius: 50,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

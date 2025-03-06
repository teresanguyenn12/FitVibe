import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Appearance } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../authProvider";
import { Ionicons } from "@expo/vector-icons"; // For back arrow icon
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient
//import { Ionicons } from "@expo/vector-icons";


export default function SignUpScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [showGenderPicker, setShowGenderPicker] = useState(false);
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
      await register(email, password, `${firstName} ${lastName}`);
      navigation.navigate("HomeTabs");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
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

      {/* Date of Birth Picker with Dropdown Arrow */}
      <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(!showDatePicker)}>
        <Text style={dob ? styles.dateText : styles.placeholderText}>
          {dob ? dob.toLocaleDateString("en-US") : "Select Date of Birth"}
        </Text>
        <Ionicons name={showDatePicker ? "chevron-up" : "chevron-down"} size={20} color="white" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dob || new Date()}
          mode="date"
          display="spinner" // iOS-friendly display
          textColor="white" // Ensures text is white
          onChange={onChangeDate}
        />
      )}

      {/* Gender Dropdown */}
      <TouchableOpacity style={styles.genderPicker} onPress={() => setShowGenderPicker(!showGenderPicker)}>
        <Text style={gender ? styles.genderText : styles.placeholderText}>
          {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "Select Gender"}
        </Text>
        <Ionicons name={showGenderPicker ? "chevron-up" : "chevron-down"} size={20} color="white" />
      </TouchableOpacity>

      {showGenderPicker && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => {
              setGender(itemValue);
              setShowGenderPicker(false);
            }}
            style={styles.picker}
            dropdownIconColor="white"
            mode="dropdown"
          >
            <Picker.Item label="Male" value="male" color="white" />
            <Picker.Item label="Female" value="female" color="white" />
            <Picker.Item label="Other" value="other" color="white" />
          </Picker>
        </View>
      )}

      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#aaa" keyboardType="phone-pad" onChangeText={setPhone} value={phone} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" keyboardType="email-address" onChangeText={setEmail} value={email} />
      <TextInput style={styles.input} placeholder="Create Password" placeholderTextColor="#aaa" secureTextEntry onChangeText={setPassword} value={password} />
      <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#aaa" secureTextEntry onChangeText={setConfirmPassword} value={confirmPassword} />
      
      {loading ? (
        <ActivityIndicator size="large" color="#8e24aa" />
      ) : (
        <TouchableOpacity onPress={handleSignUp}>
          <LinearGradient colors={["#800080", "#4B0082"]} style={styles.button}>
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
    marginTop: 30,
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
  datePicker: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    color: "white",
  },
  placeholderText: {
    color: "#aaa",
  },
  genderPicker: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  genderText: {
    color: "white",
  },
  pickerContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 10,
  },
  picker: {
    color: "white",
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

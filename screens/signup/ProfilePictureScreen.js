import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUserSignUp } from "../../contexts/UserSignUpContext";

export default function ProfilePictureScreen() {
  const navigation = useNavigation();
  const { updateFormData, formData } = useUserSignUp();
  const [image, setImage] = useState(formData.profilePicture || null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access media is required!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!image) return;
    updateFormData({ profilePicture: image });
    navigation.navigate("Review");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Add a profile picture</Text>

        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imageText}>Tap to select photo</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity disabled={!image} onPress={handleNext}>
          <View style={[styles.button, { opacity: image ? 1 : 0.5 }]}>
            <Text style={styles.buttonText}>Next</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
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
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 40,
  },
  imageBox: {
    height: 160,
    width: 160,
    borderRadius: 80,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#333",
    overflow: "hidden",
  },
  imageText: {
    color: "#aaa",
    textAlign: "center",
  },
  imagePreview: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
  },
  button: {
    marginTop: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#5A1A9B",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

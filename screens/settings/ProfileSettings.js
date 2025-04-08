import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { storage } from "../../firebase"; // Import the storage from firebase.js
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const ProfileSettings = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [localImageUri, setLocalImageUri] = useState(""); // For displaying local image preview
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (user) {
            setEmail(user.email);
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const data = userDoc.data();
                setFullName(data.fullName || "");

                if (data.profilePicture) {
                    setProfileImage(data.profilePicture);
                    setLocalImageUri(data.profilePicture);
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "You need to allow access to your gallery.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setLocalImageUri(result.assets[0].uri);
            // We'll upload the image during the save process
        }
    };

    const uploadImageToFirebase = async (uri) => {
        if (!uri) return null;

        // Convert URI to Blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Create a unique filename
        const filename = `profile_${user.uid}_${new Date().getTime()}`;
        const storageRef = ref(storage, `profile_images/${filename}`);

        // Create upload task
        const uploadTask = uploadBytesResumable(storageRef, blob);

        // Return a promise that resolves with the download URL
        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Track upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.error("Upload failed:", error);
                    reject(error);
                },
                async () => {
                    // Upload completed successfully, get download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    const saveChanges = async () => {
        setSaving(true);
        setUploadProgress(0);

        try {
            let imageUrl = profileImage;

            // If user selected a new image, upload it
            if (localImageUri && localImageUri !== profileImage) {
                imageUrl = await uploadImageToFirebase(localImageUri);
            }

            // Update user profile in Firebase Authentication
            await updateProfile(user, {
                displayName: fullName,
                photoURL: imageUrl
            });

            // Update user document in Firestore
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                fullName,
                profilePicture: imageUrl,
                updatedAt: new Date()
            });

            // Update state with the saved URL
            setProfileImage(imageUrl);

            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Could not update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4682B4" />
            </View>
        );
    }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile Settings</Text>
        </View>

        {/* Profile Image */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={profileImage ? { uri: profileImage } : require("../../assets/default-profile.png")}
              style={styles.profileImage}
            />
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#888"
          />
        </View>

        {/* Email (readonly) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#3A3D42" }]}
            value={email}
            editable={false}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={saveChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#131417",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 30,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -5,
    backgroundColor: "#8e24aa",
    padding: 6,
    borderRadius: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#2B2D31",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#8e24aa",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileSettings;

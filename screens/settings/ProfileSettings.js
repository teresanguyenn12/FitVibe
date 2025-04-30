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
import { storage } from "../../firebase"; // Adjust if needed
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useTheme } from "../../contexts/ThemeContext"; // Import ThemeContext

const ProfileSettings = () => {
    const navigation = useNavigation();
    const { theme } = useTheme(); // Use the theme
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
        }
    };

    const uploadImageToFirebase = async (uri) => {
        if (!uri) return null;
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `profile_${user.uid}_${new Date().getTime()}`;
        const storageRef = ref(storage, `profile_images/${filename}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    reject(error);
                },
                async () => {
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
            if (localImageUri && localImageUri !== profileImage) {
                imageUrl = await uploadImageToFirebase(localImageUri);
            }

            await updateProfile(user, {
                displayName: fullName,
                photoURL: imageUrl
            });

            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                fullName,
                profilePicture: imageUrl,
                updatedAt: new Date()
            });

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
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={30} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerText, { color: theme.text }]}>Profile Settings</Text>
                </View>

                {/* Profile Image */}
                <View style={styles.profileSection}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={profileImage ? { uri: profileImage } : require("../../assets/default-profile.png")}
                            style={styles.profileImage}
                        />
                        <View style={[styles.editIcon, { backgroundColor: theme.primary }]}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Full Name */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.subtext}
                    />
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                        value={email}
                        editable={false}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.primary }, saving && { opacity: 0.6 }]}
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
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        padding: 6,
        borderRadius: 15,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    input: {
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    saveButton: {
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

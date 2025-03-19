import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const ProfileSettings = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    // State for profile data
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch user data
    useEffect(() => {
        if (user) {
            setEmail(user.email); // Firebase Auth provides email
            fetchUserData();
        }
    }, [user]);

    // Fetch user profile details from Firestore
    const fetchUserData = async () => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const data = userDoc.data();
                setFullName(data.fullName || "");
                setProfileImage(data.profileImage || "");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Image Upload
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You need to allow access to your gallery.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // Save changes to Firestore and Firebase Auth
    const saveChanges = async () => {
        setSaving(true);
        try {
            // Update Firebase Auth display name
            await updateProfile(user, { displayName: fullName });
    
            // Update Firestore user document with new profile picture
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                fullName,
                profilePicture: profileImage  // Save updated profile pic
            });
    
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Could not update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8e24aa" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                    <Image source={profileImage ? { uri: profileImage } : require("../../assets/default-profile.png")} style={styles.profileImage} />
                    <View style={styles.editIcon}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Form */}
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

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: "#3A3D42" }]} // Read-only email
                    value={email}
                    editable={false}
                />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </TouchableOpacity>
        </View>
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
        paddingTop: 60,
        paddingBottom: 10,
    },
    backButton: {
        padding: 10,
    },
    headerText: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    profileSection: {
        alignItems: "center",
        marginVertical: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#8e24aa",
        padding: 5,
        borderRadius: 15,
    },
    inputContainer: {
        marginBottom: 15,
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
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 8,
        marginTop: 20,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default ProfileSettings;


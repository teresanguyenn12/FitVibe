import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// Import the local default profile image correctly
import defaultProfileImage from "../assets/default-profile.png";

// Import all settings screens from the settings folder
import { 
    ProfileSettings, 
    PrivacySettings, 
    ConnectedApps, 
    LogoutScreen, 
    ActivityTracking, 
    ConnectedDevices, 
    NotificationSettings, 
    ThemeSettings, 
    LanguageSettings, 
    UnitsSettings, 
    HelpCenter, 
    ReportProblem, 
    PrivacyPolicy, 
    DeleteAccount 
} from "./settings";  // <- Imports from settings/index.js

const SettingsScreen = () => {
    const navigation = useNavigation();
    const [profileImage, setProfileImage] = useState(null); 

    useEffect(() => {
        const auth = getAuth();
        if (!auth.currentUser) return;

        const db = getFirestore();
        const userDocRef = doc(db, "users", auth.currentUser.uid);

        // Listen for profile picture updates in real time
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                console.log("Profile picture updated in Firestore:", data.profilePicture);
                setProfileImage(data.profilePicture || null);
            }
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    const settingsSections = [
        {
            title: "Account",
            options: [
                { title: "Profile", icon: "user", screen: ProfileSettings },
                { title: "Privacy", icon: "lock", screen: PrivacySettings },
                { title: "Connected Apps", icon: "link", screen: ConnectedApps },
                { title: "Log Out", icon: "log-out", screen: LogoutScreen },
            ],
        },
        {
            title: "Fitness & Activity",
            options: [
                { title: "Activity Tracking", icon: "trending-up", screen: ActivityTracking },
                { title: "Connected Devices", icon: "watch", screen: ConnectedDevices },
                { title: "Notifications", icon: "bell", screen: NotificationSettings },
            ],
        },
        {
            title: "App Preferences",
            options: [
                { title: "Theme Mode", icon: "moon", screen: ThemeSettings },
                { title: "Language", icon: "globe", screen: LanguageSettings },
                { title: "Units of Measurement", icon: "bar-chart", screen: UnitsSettings },
            ],
        },
        {
            title: "Help & Support",
            options: [
                { title: "Help Center", icon: "help-circle", screen: HelpCenter },
                { title: "Report a Problem", icon: "alert-circle", screen: ReportProblem },
                { title: "Privacy Policy & Terms", icon: "file-text", screen: PrivacyPolicy },
                { title: "Delete My Account", icon: "trash-2", screen: DeleteAccount },
            ],
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Settings</Text>
                <Image 
                    source={profileImage ? { uri: profileImage } : defaultProfileImage} 
                    style={styles.profileAvatar} 
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.optionsContainer}>
                            {section.options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.option,
                                        index === section.options.length - 1 ? styles.lastOption : null,
                                    ]}
                                    onPress={() => navigation.navigate(option.screen)}
                                >
                                    <Feather name={option.icon} size={20} color="#FFFFFF" style={styles.optionIcon} />
                                    <Text style={styles.optionText}>{option.title}</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#131417", 
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", 
        paddingTop: 60,
        paddingHorizontal: 15, 
        paddingBottom: 10,
        backgroundColor: "#131417",
    },
    backButton: {
        padding: 10,
    },
    headerText: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1, // Centers the title
    },
    profileAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20, // Circular image
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#FFFFFF",
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        paddingHorizontal: 20,
        marginBottom: 10,
        opacity: 0.7,
    },
    optionsContainer: {
        backgroundColor: "#2B2D31",
        borderRadius: 12,
        marginHorizontal: 15, 
        paddingVertical: 5,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: "#3A3D42",
    },
    lastOption: {
        borderBottomWidth: 0,
    },
    optionIcon: {
        marginRight: 12,
    },
    optionText: {
        color: "#FFFFFF",
        fontSize: 17,
        flex: 1,
        fontWeight: "500",
    },
});

export default SettingsScreen;

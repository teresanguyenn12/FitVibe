import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import { unregisterIndieDevice } from 'native-notify';
import { useTheme } from "../../contexts/ThemeContext"; // Import useTheme
import { useColorScheme } from "react-native"; // Import system theme

const LogoutScreen = () => {
    const navigation = useNavigation();
    const { theme, themeMode } = useTheme();
    const systemColorScheme = useColorScheme();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const handleLogout = async () => {
        try {
            if (currentUser && currentUser.uid) {
                unregisterIndieDevice(currentUser.uid, 29298, 'u04gYyaVKbAobwZ9ojzShp');
                console.log("Device unregistered for push notifications");
            }

            await signOut(auth);
            console.log("User signed out successfully.");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const headerTextColor = themeMode === "dark"
      ? "#FFFFFF"
      : themeMode === "light"
        ? "#111"
        : systemColorScheme === "dark"
          ? "#FFFFFF"
          : "#111";

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.headerText, { color: headerTextColor }]}>Log Out</Text>

            <Text style={[styles.message, { color: theme.text }]}>
                Are you sure you want to log out?
            </Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
                <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    message: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 30,
    },
    logoutButton: {
        backgroundColor: "#FF3B30", // RED button stays the same
        paddingVertical: 12,
        width: "80%",
        alignItems: "center",
        borderRadius: 10,
        marginBottom: 15,
    },
    logoutText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    cancelButton: {
        paddingVertical: 12,
        width: "80%",
        alignItems: "center",
        borderRadius: 10,
    },
    cancelText: {
        fontSize: 18,
    },
});

export default LogoutScreen;

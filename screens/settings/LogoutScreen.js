import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";

const LogoutScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User signed out successfully.");
            navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Log Out</Text>

            <Text style={styles.message}>Are you sure you want to log out?</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#131417",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    headerText: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    message: {
        color: "#FFFFFF",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 30,
    },
    logoutButton: {
        backgroundColor: "#FF3B30",
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
        backgroundColor: "#3A3D42",
        paddingVertical: 12,
        width: "80%",
        alignItems: "center",
        borderRadius: 10,
    },
    cancelText: {
        color: "#FFFFFF",
        fontSize: 18,
    },
});

export default LogoutScreen;

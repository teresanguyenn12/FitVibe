import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../authProvider";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for back button
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation(); // Access navigation

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.text}>Profile Screen</Text>
            <Text style={styles.text}>Logged in as: {user?.fullName}</Text>
            <Button title="Logout" onPress={logout} color="#8e24aa" />

            {/* Goals Button */}
            <LinearGradient
                colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} // Gradient colors
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardBorder}
            >
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate("Goals")}
                >
                    <Ionicons name="flag" size={40} color="#fff" />
                    <Text style={styles.cardText}>Goals</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50, // Adjust padding to accommodate the back button
    },
    backButton: {
        position: "absolute",
        top: 90,
        left: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: 10,
        borderRadius: 10,
    },
    text: {
        color: "#fff",
        fontSize: 20,
        marginBottom: 10,
    },
    cardBorder: {
        width: "50%", // Adjust width as needed
        height: 155, // Same height as the HomeScreen buttons
        borderRadius: 20, // Matches card border
        padding: 3, // Creates the border effect
        marginTop: 20,
    },
    card: {
        flex: 1, // Ensures it fills the gradient container
        backgroundColor: "#000", // Inner card background
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    cardText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
        fontFamily: "TiltWarp-Regular",
    },
});

export default ProfileScreen;

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.text}>⚙️ Settings</Text>

            {/* Placeholder for future settings options */}
            <View style={styles.option}>
                <Text style={styles.optionText}>Account Settings</Text>
            </View>

            <View style={styles.option}>
                <Text style={styles.optionText}>Notifications</Text>
            </View>

            <View style={styles.option}>
                <Text style={styles.optionText}>Privacy & Security</Text>
            </View>

            <View style={styles.option}>
                <Text style={styles.optionText}>About App</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
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
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
    },
    option: {
        width: "80%",
        padding: 15,
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
    },
    optionText: {
        color: "#fff",
        fontSize: 18,
    },
});

export default SettingsScreen;

import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../../contexts/ThemeContext";

const ThemeSettings = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();
    const { theme, setTheme } = useContext(ThemeContext);
    const [selectedTheme, setSelectedTheme] = useState("automatic");

    useEffect(() => {
        if (user) fetchUserTheme();
    }, [user]);

    const fetchUserTheme = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem("themeMode");
            if (storedTheme) {
                setSelectedTheme(storedTheme);
                setTheme(storedTheme);
                return;
            }

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.themeMode) {
                    setSelectedTheme(userData.themeMode);
                    setTheme(userData.themeMode);
                    await AsyncStorage.setItem("themeMode", userData.themeMode);
                }
            }
        } catch (error) {
            console.error("Error fetching theme:", error);
        }
    };

    const updateTheme = async (newTheme) => {
        setSelectedTheme(newTheme);
        setTheme(newTheme);

        try {
            await AsyncStorage.setItem("themeMode", newTheme);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                await updateDoc(userDocRef, { themeMode: newTheme });
            }
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Theme Mode</Text>
            </View>

            {/* Theme Options */}
            <View style={styles.optionsContainer}>
                {["dark", "light", "automatic"].map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[styles.option, selectedTheme === mode && styles.selectedOption]}
                        onPress={() => updateTheme(mode)}
                    >
                        <Text style={styles.optionText}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </Text>
                        {selectedTheme === mode && (
                            <Ionicons name="checkmark" size={22} color="#8e24aa" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
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
        paddingTop: 70,
        paddingHorizontal: 10,
    },
    backButton: {
        padding: 10,
    },
    headerText: {
        flex: 1,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginRight: 40, // To balance the space from the back button
    },
    optionsContainer: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    option: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#2B2D31",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    selectedOption: {
        borderColor: "#8e24aa",
        borderWidth: 2,
    },
    optionText: {
        color: "#FFFFFF",
        fontSize: 18,
    },
});

export default ThemeSettings;

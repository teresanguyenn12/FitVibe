import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Alert } from "react-native";

const CardioScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("Walking");
    const [notes, setNotes] = useState({
        Walking: "",
        Running: "",
    });
    const timers = useRef({
        Walking: { time: 0, isRunning: false, laps: [] },
        Running: { time: 0, isRunning: false, laps: [] }
    });
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const switchTab = (tab) => {
        clearInterval(timerRef.current);
        timerRef.current = null;

        // Save the current state before switching
        timers.current[activeTab] = { time, isRunning, laps };

        setActiveTab(tab);
        setTime(timers.current[tab].time);
        setIsRunning(false);
        setLaps(timers.current[tab].laps);

        // Reset the note input field when switching tabs
        setNotes((prev) => ({ ...prev, [tab]: "" }));
    };

    const toggleTimer = () => {
        if (isRunning) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        } else {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsRunning(false);
        setTime(0);
        setLaps([]);
    };

    const recordLap = () => {
        setLaps([...laps, time]);
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSavePress = () => {
        Alert.alert(
            "Do you want your workout to be recorded?", // Title
            "", // No additional message
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Save",
                    onPress: () => console.log("Workout saved!"), // Replace with actual save logic
                    style: "default", // Uses the default button styling
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Cardio</Text>
            
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.centeredContent}>
                    <View style={styles.tabs}>
                        <TouchableOpacity onPress={() => switchTab("Walking")} style={[styles.tab, activeTab === "Walking" && styles.activeTab]}>
                            <Text style={styles.tabText}>Walking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => switchTab("Running")} style={[styles.tab, activeTab === "Running" && styles.activeTab]}>
                            <Text style={styles.tabText}>Running</Text>
                        </TouchableOpacity>
                    </View>
            
                    <View style={styles.timerContainer}>
                        <Text style={styles.timer}>{formatTime(time)}</Text>
                        <TouchableOpacity onPress={recordLap} style={styles.lapButton}>
                            <Text style={styles.lapButtonText}>Lap</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleTimer} style={[styles.button, isRunning && styles.stopButton]}>
                            <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start"}</Text>
                        </TouchableOpacity>
                        {!isRunning && time > 0 && (
                            <TouchableOpacity onPress={resetTimer} style={styles.button}>
                                <Text style={styles.buttonText}>Reset</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {laps.length > 0 && (
                        <View style={styles.lapsContainer}>
                            {laps.map((lap, index) => (
                                <View key={index} style={styles.lapRow}>
                                    <Text style={styles.lapNumber}>Lap {index + 1}</Text>
                                    <Text style={styles.lapTime}>{formatTime(lap)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <TextInput
                        style={[
                            styles.notesBox, 
                            { marginTop: laps.length > 0 ? 20 : 30 }
                        ]}
                        placeholder="Enter notes here"
                        placeholderTextColor="#999"
                        multiline
                        value={notes[activeTab]}
                        onChangeText={(text) => setNotes((prev) => ({ ...prev, [activeTab]: text }))}
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
                        <LinearGradient
                            colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>    
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        paddingTop: 80,
    },
    backButton: {
        position: "absolute",
        top: 80,
        left: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 40,
        fontFamily: "TiltWarp-Regular",
    },
    centeredContent: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    tabs: {
        flexDirection: "row",
        width: "90%", 
        justifyContent: "space-between",
        marginBottom: 20, 
    },
    tab: {
        flex: 1, 
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: "#1e1e1e", 
        marginHorizontal: 5, 
    },
    activeTab: {
        backgroundColor: "#5A1A9B", 
    },
    tabText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    timerContainer: {
        backgroundColor: "#1e1e1e",
        padding: 30,
        borderRadius: 10,
        alignItems: "center",
        width: "90%",
    },
    timer: {
        fontSize: 50,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        width: "60%",
        alignItems: "center",
        marginVertical: 8,
    },
    stopButton: {
        backgroundColor: "#FF7F7F",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#121212",
    },
    lapsContainer: {
        marginTop: 10,
        width: "90%",
    },
    lapRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 0.5, 
        borderBottomColor: "#A9A9A9", 
    },
    lapNumber: {
        color: "#fff",
        fontSize: 18,
    },
    lapTime: {
        color: "#fff",
        fontSize: 18,
        textAlign: "right",
    },
    lapButton: {
        backgroundColor: "#333", 
        padding: 12,
        borderRadius: 10,
        width: "60%",
        alignItems: "center",
        marginVertical: 8,
    },
    lapButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#B0B0B0", 
    },
    lapText: {
        color: "#fff", 
        fontSize: 18,
        marginBottom: 5,
    },
    notesBox: {
        width: "100%",
        height: 100,
        backgroundColor: "#1e1e1e",
        color: "#fff",
        padding: 10,
        borderRadius: 10,
        textAlignVertical: "top",
    },
    saveButton: {
        marginTop: 20, 
        alignItems: "center",
        width: "40%", 
        borderRadius: 10,
        padding: 8,
    },
    gradientButton: {
        padding: 15,  
        borderRadius: 10,
        alignItems: "center",
        width: "100%", 
    },
    saveButtonText: {
        color: "#fff", 
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default CardioScreen;

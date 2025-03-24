import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Platform } from "react-native";

const screenWidth = Dimensions.get("window").width;

const SwimmingScreen = () => {
    const navigation = useNavigation();
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const [notes, setNotes] = useState("");
    const timerRef = useRef(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const toggleTimer = () => {
        if (isRunning) {
            clearInterval(timerRef.current);
        } else {
            timerRef.current = setInterval(() => {
                setTime((prev) => prev + 1);
            }, 1000);
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
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
            "Do you want your workout to be recorded?",
            "",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Save", onPress: () => console.log("Swimming workout saved!") }
            ]
        );
    };

    const handleDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Swimming</Text>
            <View style={styles.titleUnderline} />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                horizontal={false} 
                showsHorizontalScrollIndicator={false} 
            >
                <View style={styles.centeredContent}>
                    {/* Date Picker */}
                    <View style={styles.datePickerContainer}>
                        <Text style={styles.datePickerLabel}>Select Date:</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                            <Text style={styles.datePickerButtonText}>
                                {selectedDate.toDateString()}
                            </Text>
                        </TouchableOpacity>

                        <Modal
                            transparent={true}
                            animationType="slide"
                            visible={showDatePicker}
                            onRequestClose={() => setShowDatePicker(false)}
                        >
                            <View style={styles.modalBackground}>
                                <View style={styles.iosDatePickerContainer}>
                                    <View style={styles.darkPickerBackground}>
                                        <DateTimePicker
                                            value={selectedDate}
                                            mode="date"
                                            display="spinner"
                                            onChange={handleDateChange}
                                            themeVariant="dark"
                                        />
                                    </View>
                                    <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneButton}>
                                        <Text style={styles.doneButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                    {/* Timer Section */}
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
                                    <Text style={styles.lapNumber}>{`Lap ${index + 1}`}</Text>
                                    <Text style={styles.lapTime}>{formatTime(lap)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.notesContainer}>
                        <Text style={styles.notesHeading}>Notes</Text>
                        <TextInput
                            style={styles.notesBox}
                            
                            placeholder="Enter notes here"
                            placeholderTextColor="#999"
                            multiline
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>

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
        marginBottom: 15,
        fontFamily: "TiltWarp-Regular",
    },
    titleUnderline: {
        height: 1,
        backgroundColor: "#aaa",
        width: "90%",
    },
    centeredContent: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    timerContainer: {
        backgroundColor: "#1e1e1e",
        padding: 45,
        borderRadius: 10,
        alignItems: "center",
        width: screenWidth * 0.8, 
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
        width: 160,
        alignItems: "center",
        alignSelf: "center",
        marginVertical: 8,
        marginHorizontal: 80,
        flexGrow: 1,
        maxWidth: "90%",
    },
    stopButton: {
        backgroundColor: "#FF7F7F",
        width: 160,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#121212",
    },
    lapsContainer: {
        marginTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
        width: "85%",
    },
    lapRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#A9A9A9",
        width: "100%",
    },
    lapNumber: {
        color: "#fff",
        fontSize: 18,
    },
    lapTime: {
        color: "#fff",
        fontSize: 18,
    },
    lapButton: {
        backgroundColor: "#333",
        padding: 12,
        borderRadius: 10,
        width: 160,
        alignItems: "center",
        verticalAlign: "center",
        marginVertical: 8,
    },
    lapButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#B0B0B0",
    },
    notesContainer: {
        width: "100%",
        alignItems: "center",
    },
    notesHeading: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        alignSelf: "flex-start", 
        marginLeft: 5, 
        marginTop: 30,
    },
    notesBox: {
        width: 320,
        height: 100,
        backgroundColor: "#1e1e1e",
        color: "#fff",
        paddingLeft: 10,
        paddingTop: 10,
        borderRadius: 10,
        textAlignVertical: "top",
        marginTop: 10,
    },
    saveButton: {
        marginTop: 20,
        alignItems: "center",
        width: 140,
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
    datePickerContainer: {
        marginTop: 30,
        marginBottom: 20,
        width: "100%",
        alignItems: "center",
    },
    datePickerLabel: {
        color: "#fff",
        fontSize: 20,
        marginBottom: 10,
        fontWeight: "bold",
    },
    datePickerButton: {
        backgroundColor: "#1e1e1e",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    datePickerButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    iosDatePickerContainer: {
        backgroundColor: "#1e1e1e",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: "center",
    },
    darkPickerBackground: {
        backgroundColor: "#1e1e1e",
        borderRadius: 10,
        overflow: "hidden",
    },
    doneButton: {
        marginTop: 10,
        backgroundColor: "#5A1A9B",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    doneButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default SwimmingScreen;

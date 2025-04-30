import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTheme } from "../contexts/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const SwimmingScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
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

    const handleSavePress = async () => {
        if (isSaving) return;
        
        const user = auth.currentUser;
    
        if (!user) {
            Alert.alert("Not signed in", "You must be signed in to save workouts.");
            return;
        }
    
        if (time === 0) {
            Alert.alert("Workout Not Started", "Please start the timer before saving your workout.");
            return;
        }
    
        setIsSaving(true);
        const workoutData = {
            userId: user.uid,
            type: "swimming",
            date: selectedDate.toISOString().split("T")[0],
            duration: time,
            notes: notes.trim(),
            timestamp: serverTimestamp(),
        };
    
        if (laps.length > 0) {
            workoutData.laps = laps;
        }
    
        try {
            await addDoc(collection(db, "workouts"), workoutData);
            Alert.alert("Saved!", "Your swimming workout has been recorded.");
            navigation.goBack();
        } catch (error) {
            console.error("Error saving workout:", error);
            let errorMessage = "Could not save workout. Please try again.";
            if (error.code === 'permission-denied') {
                errorMessage = "You don't have permission to save workouts.";
            } else if (error.code === 'unavailable') {
                errorMessage = "Network error. Please check your connection.";
            }
            Alert.alert("Error", errorMessage);
        } finally {
            setIsSaving(false);
        }
    };
    

    const handleDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
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
            color: theme.text,
            marginBottom: 15,
            fontFamily: "TiltWarp-Regular",
        },
        titleUnderline: {
            height: 1,
            backgroundColor: theme.border,
            width: "90%",
        },
        centeredContent: {
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
        },
        scrollContainer: {
            paddingBottom: 50,
        },
        timerContainer: {
            backgroundColor: theme.card,
            padding: 30,
            borderRadius: 10,
            alignItems: "center",
            width: "90%",
            marginBottom: 20,
            borderColor: theme.border,
            borderWidth: 1,
        },
        timer: {
            fontSize: 50,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 20,
        },
        button: {
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 30,
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
            color: "#fff",
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
            borderBottomColor: theme.border,
        },
        lapNumber: {
            color: theme.text,
            fontSize: 18,
        },
        lapTime: {
            color: theme.text,
            fontSize: 18,
        },
        lapButton: {
            backgroundColor: theme.mode === 'dark' ? '#333' : '#e0e0e0',
            padding: 12,
            borderRadius: 30,
            width: "60%",
            alignItems: "center",
            marginVertical: 8,
        },
        lapButtonText: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.text,
        },
        notesContainer: {
            width: "100%",
            alignItems: "center",
        },
        notesHeading: {
            color: theme.text,
            fontSize: 20,
            fontWeight: "bold",
            alignSelf: "flex-start",
            marginLeft: 20,
            marginTop: 30,
        },
        notesBox: {
            width: 320,
            height: 100,
            backgroundColor: theme.card,
            color: theme.text,
            paddingLeft: 10,
            paddingTop: 10,
            borderRadius: 10,
            textAlignVertical: "top",
            marginTop: 10,
            borderColor: theme.border,
            borderWidth: 1,
        },
        saveButton: {
            marginTop: 20,
            alignItems: "center",
            width: "40%",
            borderRadius: 30,
            padding: 8,
        },
        gradientButton: {
            padding: 15,
            borderRadius: 30,
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
            color: theme.text,
            fontSize: 20,
            marginBottom: 10,
            fontWeight: "bold",
        },
        datePickerButton: {
            backgroundColor: theme.card,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            borderColor: theme.border,
            borderWidth: 1,
        },
        datePickerButtonText: {
            color: theme.text,
            fontSize: 16,
        },
        modalBackground: {
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        iosDatePickerContainer: {
            backgroundColor: theme.card,
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            alignItems: "center",
        },
        darkPickerBackground: {
            backgroundColor: theme.card,
            borderRadius: 10,
            overflow: "hidden",
        },
        doneButton: {
            marginTop: 10,
            backgroundColor: theme.primary,
            paddingVertical: 10,
            paddingHorizontal: 30,
            borderRadius: 30,
        },
        doneButtonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
        },
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Swimming</Text>
            <View style={styles.titleUnderline} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.centeredContent}>
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
                                            themeVariant={theme.mode === 'dark' ? 'dark' : 'light'}
                                        />
                                    </View>
                                    <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneButton}>
                                        <Text style={styles.doneButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
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
                            placeholderTextColor={theme.subtext || "#999"}
                            multiline
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={handleSavePress}
                        disabled={isSaving}
                    >
                        <LinearGradient
                            colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSaving ? "Saving..." : "Save"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default SwimmingScreen;
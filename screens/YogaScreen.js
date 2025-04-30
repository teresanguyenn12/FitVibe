import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTheme } from "../contexts/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const YogaScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [notes, setNotes] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [routineName, setRoutineName] = useState("");
    const [routineTime, setRoutineTime] = useState("");
    const [loggedRoutines, setLoggedRoutines] = useState([]);
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
            if (time === 0) return;
            timerRef.current = setInterval(() => {
                setTime((prev) => {
                    if (prev === 0) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);
        setTime(0);
    };

    const addTime = () => {
        if (!isRunning) setTime((prev) => prev + 30);
    };

    const subtractTime = () => {
        if (!isRunning) setTime((prev) => (prev <= 30 ? 0 : prev - 30));
    };

    const handleDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleRoutineSave = () => {
        const timeNum = Number(routineTime);
        
        if (routineName.trim() === "" || isNaN(timeNum)) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (timeNum <= 0) {
            Alert.alert("Error", "Routine time must be a valid number.");
            return;
        }

        const newRoutine = {
            name: routineName.trim(),
            time: timeNum
        };
        setLoggedRoutines([...loggedRoutines, newRoutine]);
        setModalVisible(false);
        setRoutineName("");
        setRoutineTime("");
    };

    const deleteRoutine = (index) => {
        const updatedRoutines = loggedRoutines.filter((_, i) => i !== index);
        setLoggedRoutines(updatedRoutines);
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

        if (loggedRoutines.length === 0) {
            Alert.alert("Empty Workout", "Please log at least one routine before saving.");
            return;
        }

        setIsSaving(true);
        try {
            await addDoc(collection(db, "workouts"), {
                userId: user.uid,
                type: "yoga",
                date: selectedDate.toISOString().split("T")[0],
                duration: time,
                routines: loggedRoutines,
                notes: notes.trim(),
                timestamp: serverTimestamp(),
            });

            Alert.alert("Saved!", "Your yoga workout has been recorded.");
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
        scrollContainer: {
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
        },
        centeredContent: {
            width: "90%",
            alignItems: "center",
        },
        timerContainer: {
            backgroundColor: theme.card,
            padding: 45,
            borderRadius: 10,
            alignItems: "center",
            width: "100%",
            borderColor: theme.border,
            borderWidth: 1,
        },
        timer: {
            fontSize: 50,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 20,
        },
        timeAdjustButtons: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: "60%",
            marginBottom: 20,
        },
        timeAdjustButton: {
            backgroundColor: theme.primary,
            padding: 10,
            borderRadius: 10,
            width: "45%",
            alignItems: "center",
        },
        timeAdjustButtonText: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
        },
        button: {
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 10,
            width: 160,
            alignItems: "center",
            marginVertical: 10,
        },
        buttonText: {
            fontSize: 14,
            fontWeight: "bold",
            color: "#fff",
        },
        stopButton: {
            backgroundColor: "#FF7F7F",
        },
        logRoutineHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginTop: 20,
            marginBottom: 20,
        },
        logRoutineText: {
            fontSize: 20,
            fontWeight: "bold",
            color: theme.text,
            marginLeft: 20,
        },
        plusButton: {
            padding: 5,
        },
        plusButtonBorder: {
            backgroundColor: theme.primary, 
            borderRadius: 20, 
            width: 40, 
            height: 40, 
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10,
        },
        loggedRoutine: {
            width: 320,
            backgroundColor: theme.card,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            position: "relative",
            borderColor: theme.border,
            borderWidth: 1,
        },
        routineHeader: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 5,
        },
        separatorLine: {
            height: 0.5,
            backgroundColor: theme.border,
            marginBottom: 10,
        },
        loggedRoutineText: {
            fontSize: 16,
            color: theme.text,
        },
        trashButton: {
            position: "absolute",
            top: 10,
            right: 10,
        },
        boldText: {
            fontWeight: "bold",
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
            marginLeft: 5,
            marginTop: 1,
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
            width: 140,
            borderRadius: 10,
            padding: 8,
            alignSelf: "center",
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
        modalContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        modalContent: {
            width: "80%",
            backgroundColor: theme.card,
            borderRadius: 10,
            padding: 20,
            borderColor: theme.border,
            borderWidth: 1,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 20,
            textAlign: "center",
        },
        modalInput: {
            backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0',
            color: theme.text,
            borderRadius: 5,
            padding: 10,
            marginBottom: 15,
            borderColor: theme.border,
            borderWidth: 1,
        },
        modalButtons: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        modalCancelButton: {
            backgroundColor: theme.mode === 'dark' ? '#333' : '#e0e0e0',
            padding: 10,
            borderRadius: 5,
            width: "45%",
            alignItems: "center",
        },
        exerciseSaveButton: {
            backgroundColor: theme.primary,
            padding: 10,
            borderRadius: 5,
            width: "45%",
            alignItems: "center",
        },
        modalButtonText: {
            fontSize: 16,
            fontWeight: "bold",
            color: theme.text,
        },
        exerciseSaveButtonText: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
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
            borderRadius: 10,
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
            <Text style={styles.title}>Yoga</Text>
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
                    
                    {/* Timer Container */}
                    <View style={styles.timerContainer}>
                        <Text style={styles.timer}>{formatTime(time)}</Text>

                        {/* -30 and +30 Buttons */}
                        <View style={styles.timeAdjustButtons}>
                            <TouchableOpacity onPress={subtractTime} style={styles.timeAdjustButton} disabled={isRunning}>
                                <Text style={styles.timeAdjustButtonText}>-30</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={addTime} style={styles.timeAdjustButton} disabled={isRunning}>
                                <Text style={styles.timeAdjustButtonText}>+30</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Start/Stop Button */}
                        <TouchableOpacity onPress={toggleTimer} style={[styles.button, isRunning && styles.stopButton]}>
                            <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start Routine Timer"}</Text>
                        </TouchableOpacity>

                        {/* Reset Button */}
                        {!isRunning && time > 0 && (
                            <TouchableOpacity onPress={resetTimer} style={styles.button}>
                                <Text style={styles.buttonText}>Reset</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Log Routine Heading and + Button */}
                    <View style={styles.logRoutineHeader}>
                        <Text style={styles.logRoutineText}>Log Routine</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.plusButton}>
                            <View style={styles.plusButtonBorder}>
                                <Ionicons name="add" size={28} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Logged Routines */}
                    {loggedRoutines.map((routine, index) => (
                        <View key={index} style={styles.loggedRoutine}>
                            <TouchableOpacity
                                style={styles.trashButton}
                                onPress={() => deleteRoutine(index)}
                            >
                                <Ionicons name="trash" size={20} color="#FF7F7F" />
                            </TouchableOpacity>
                            <Text style={styles.routineHeader}>Routine {index + 1}: {routine.name}</Text>
                            <View style={styles.separatorLine} />
                            <Text style={styles.loggedRoutineText}>
                                <Text style={styles.boldText}>Time (secs): </Text>
                                <Text>{routine.time}</Text>
                            </Text>
                        </View>
                    ))}

                    {/* Notes Section */}
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

                    {/* Save Button */}
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

            {/* Modal for Logging Routines */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Routine</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Routine Name"
                            placeholderTextColor={theme.subtext || "#999"}
                            value={routineName}
                            onChangeText={setRoutineName}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Routine time (secs)"
                            placeholderTextColor={theme.subtext || "#999"}
                            keyboardType="numeric"
                            value={routineTime}
                            onChangeText={setRoutineTime}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancelButton}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRoutineSave} style={styles.exerciseSaveButton}>
                                <Text style={styles.exerciseSaveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default YogaScreen;
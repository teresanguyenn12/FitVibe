import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTheme } from "../contexts/ThemeContext";

const StrengthTrainingScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [sets, setSets] = useState([]);
    const [notes, setNotes] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [exercise, setExercise] = useState("");
    const [setsCount, setSetsCount] = useState("");
    const [reps, setReps] = useState("");
    const [weight, setWeight] = useState("");
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
        if (!isRunning) {
            setTime((prev) => prev + 30);
        }
    };

    const subtractTime = () => {
        if (!isRunning) {
            setTime((prev) => (prev <= 30 ? 0 : prev - 30));
        }
    };

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setExercise("");
        setSetsCount("");
        setReps("");
        setWeight("");
    };

    const saveSet = () => {
        const setsNum = Number(setsCount);
        const repsNum = Number(reps);
        const weightNum = Number(weight);

        if (exercise.trim() === "" || isNaN(setsNum) || isNaN(repsNum) || isNaN(weightNum)) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (setsNum <= 0 || repsNum <= 0 || weightNum < 0) {
            Alert.alert("Error", "Sets, reps, and weight must be valid numbers.");
            return;
        }

        const newSet = {
            exercise: exercise.trim(),
            sets: setsNum,
            reps: repsNum,
            weight: weightNum
        };
        setSets([...sets, newSet]);
        closeModal();
    };

    const deleteSet = (index) => {
        const updatedSets = sets.filter((_, i) => i !== index);
        setSets(updatedSets);
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

        if (sets.length === 0) {
            Alert.alert("Empty Workout", "Please log at least one exercise before saving.");
            return;
        }
    
        setIsSaving(true);
        try {
            await addDoc(collection(db, "workouts"), {
                userId: user.uid,
                type: "strength",
                date: selectedDate.toISOString().split("T")[0],
                duration: time,
                exercises: sets,
                notes: notes.trim(),
                timestamp: serverTimestamp(),
            });
    
            Alert.alert("Saved!", "Your strength training workout has been recorded.");
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
            fontSize: 25,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 18,
            //fontFamily: "TiltWarp-Regular",
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
            padding: 30,
            alignItems: "center",
            width: "100%",
        },
        timer: {
            fontSize: 55,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 20,
        },
        timeAdjustButtons: {
            flexDirection: "row",
            justifyContent: "center",
            width: "100%",
            //marginBottom: 20,
            alignItems: "center",
            //paddingHorizontal: 10, // Added padding to prevent squishing
        },
        circleButton: {
            backgroundColor: theme.mode === 'dark' ? theme.card : '#E0E0E0',
            width: 45, // Reduced from 60
            height: 45, // Reduced from 60
            borderRadius: 25, // Half of width/height
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: 8, // Added spacing between buttons
        },
        circleButtonText: {
            fontSize: 13,
            fontWeight: "bold",
            color: theme.text,
        },
        timerControlButtons: {
            flexDirection: "column",
            alignItems: "center",
            width: "45%", // Slightly increased to accommodate larger start button
            marginHorizontal: 10, // Added spacing
        },
        ovalButton: {
            backgroundColor: theme.mode === 'dark' ? theme.card : '#E0E0E0',
            paddingVertical: 12,
            paddingHorizontal: 30, // Increased horizontal padding
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 5,
            minWidth: 140, // Increased minWidth
        },
        stopButton: {
            backgroundColor: "#D32F2F",
        },
        buttonText: {
            fontSize: 16,
            fontWeight: "bold",
            color: theme.text,
        },
        logRoutineHeader: {
            width: "100%",
            marginTop: 5,  // Reduced from 20 to make the gap smaller
            marginBottom: 10,  // Reduced from 20
            alignItems: 'center',  // Added to center the button
        },
        logRoutineButton: {
            backgroundColor: theme.primary,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 30,
            alignItems: "center",
            width: 320,  // Set to match notes box width
        },
        logRoutineButtonText: {
            fontSize: 15,
            fontWeight: "bold",
            color: "#fff",
        },
        loggedSet: {
            width: 320,
            backgroundColor: theme.card,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            position: "relative",
            borderColor: theme.border,
            borderWidth: 1,
        },
        loggedSetText: {
            fontSize: 16,
            color: theme.text,
        },
        exerciseHeader: {
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
            marginTop: 10,
        },
        notesBox: {
            width: 320,
            height: 150,
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
            width: 320,  // Set to match notes box width
            borderRadius: 30,
            paddingVertical: 12,
            backgroundColor: theme.primary,
        },
        saveButtonText: {
            color: "#fff",
            fontSize: 15,
            fontWeight: "bold",
        },
        datePickerContainer: {
            marginTop: 30,
            marginBottom: 10,
            width: "100%",
            alignItems: "center",
        },
        datePickerLabel: {
            color: theme.text,
            fontSize: 18,
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
            <Text style={styles.title}>Strength Training</Text>
            <View style={styles.titleUnderline} />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={true}
            >
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

                        <View style={styles.timeAdjustButtons}>
                            {/* -30 Button - now with more spacing */}
                            <TouchableOpacity 
                            onPress={subtractTime} 
                            style={styles.circleButton} 
                            disabled={isRunning}
                            >
                            <Text style={styles.circleButtonText}>-30</Text>
                            </TouchableOpacity>
                            
                            {/* Start/Stop and Reset Buttons - centered with spacing */}
                            <View style={styles.timerControlButtons}>
                            <TouchableOpacity 
                                onPress={toggleTimer} 
                                style={[styles.ovalButton, isRunning && styles.stopButton]}
                            >
                                <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start Rest"}</Text>
                            </TouchableOpacity>

                            {!isRunning && time > 0 && (
                                <TouchableOpacity 
                                onPress={resetTimer} 
                                style={styles.ovalButton}
                                >
                                <Text style={styles.buttonText}>Reset</Text>
                                </TouchableOpacity>
                            )}
                            </View>
                            
                            {/* +30 Button - now with more spacing */}
                            <TouchableOpacity 
                            onPress={addTime} 
                            style={styles.circleButton} 
                            disabled={isRunning}
                            >
                            <Text style={styles.circleButtonText}>+30</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.logRoutineHeader}>
                        <TouchableOpacity onPress={openModal} style={styles.logRoutineButton}>
                            <Text style={styles.logRoutineButtonText}>Log Routine</Text>
                        </TouchableOpacity>
                    </View>

                    {sets.map((set, index) => (
                        <View key={index} style={styles.loggedSet}>
                            <TouchableOpacity
                                style={styles.trashButton}
                                onPress={() => deleteSet(index)}
                            >
                                <Ionicons name="trash" size={20} color="#D32F2F" />
                            </TouchableOpacity>
                            <Text style={styles.exerciseHeader}>Exercise {index + 1}: {set.exercise}</Text>
                            <View style={styles.separatorLine} />
                            <Text style={styles.loggedSetText}>
                                <Text style={styles.boldText}>Sets: </Text>
                                <Text>{set.sets}</Text>
                                {"\n"}
                                <Text style={styles.boldText}>Reps: </Text>
                                <Text>{set.reps}</Text>
                                {"\n"}
                                <Text style={styles.boldText}>Weight (lbs): </Text>
                                <Text>{set.weight}</Text>
                            </Text>
                        </View>
                    ))}

                    <View style={styles.notesContainer}>
                        <Text style={styles.notesHeading}>Notes</Text>
                        <TextInput
                            style={styles.notesBox}
                            placeholder="Enter notes here"
                            placeholderTextColor={theme.subtext}
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
                        <Text style={styles.saveButtonText}>
                            {isSaving ? "Saving..." : "Save"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Exercise</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Exercise Name"
                            placeholderTextColor={theme.subtext}
                            value={exercise}
                            onChangeText={setExercise}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Sets"
                            placeholderTextColor={theme.subtext}
                            keyboardType="numeric"
                            value={setsCount}
                            onChangeText={setSetsCount}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Reps"
                            placeholderTextColor={theme.subtext}
                            keyboardType="numeric"
                            value={reps}
                            onChangeText={setReps}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Weight (lbs)"
                            placeholderTextColor={theme.subtext}
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={closeModal} style={styles.modalCancelButton}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveSet} style={styles.exerciseSaveButton}>
                                <Text style={styles.exerciseSaveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default StrengthTrainingScreen;
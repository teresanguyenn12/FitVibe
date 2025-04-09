import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Dimensions, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const screenWidth = Dimensions.get("window").width;

const PilatesScreen = () => {
    const navigation = useNavigation();
    const [time, setTime] = useState(0); // Time in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [notes, setNotes] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [routineName, setRoutineName] = useState("");
    const [reps, setReps] = useState("");
    const [loggedRoutines, setLoggedRoutines] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const timerRef = useRef(null);

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

    const handleSavePress = async () => {
        const user = auth.currentUser;
    
        if (!user) {
            Alert.alert("Not signed in", "You must be signed in to save workouts.");
            return;
        }
    
        if (loggedRoutines.length === 0) {
            Alert.alert("Empty Workout", "Please log at least one Pilates routine before saving.");
            return;
        }
    
        try {
            await addDoc(collection(db, "workouts"), {
                userId: user.uid,
                type: "pilates",
                date: selectedDate.toISOString().split("T")[0],
                duration: time, // in seconds
                routines: loggedRoutines,
                notes: notes.trim(),
                timestamp: serverTimestamp(),
            });
    
            Alert.alert("Saved!", "Your Pilates workout has been recorded.");
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
        }
    };
    

    const handleRoutineSave = () => {
        const repsNum = Number(reps);
    
        if (routineName.trim() === "" || reps.trim() === "") {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
    
        if (isNaN(repsNum) || repsNum <= 0) {
            Alert.alert("Invalid Reps", "Reps must be a valid number.");
            return;
        }
    
        const newRoutine = {
            routineName: `Routine ${loggedRoutines.length + 1}: ${routineName}`,
            reps: repsNum,
        };
    
        setLoggedRoutines([...loggedRoutines, newRoutine]);
        setModalVisible(false);
        setRoutineName("");
        setReps("");
    };
    

    const deleteRoutine = (index) => {
        const updatedRoutines = loggedRoutines.filter((_, i) => i !== index);
        const renumberedRoutines = updatedRoutines.map((routine, i) => ({
            ...routine,
            routineName: `Routine ${i + 1}: ${routine.routineName.split(": ")[1]}`,
        }));
        setLoggedRoutines(renumberedRoutines);
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
            <Text style={styles.title}>Pilates</Text>
            <View style={styles.titleUnderline} />

            <ScrollView contentContainerStyle={styles.scrollContainer} horizontal={false} showsHorizontalScrollIndicator={false}>
                <View style={styles.centeredContent}>
                    {/* Date Picker */}
                    <View style={styles.datePickerContainer}>
                        <Text style={styles.datePickerLabel}>Select Date:</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                            <Text style={styles.datePickerButtonText}>
                                {selectedDate.toDateString()}
                            </Text>
                        </TouchableOpacity>

                        {/* iOS Modal Date Picker */}
                        <Modal
                            transparent={true}
                            animationType="slide"
                            visible={showDatePicker}
                            onRequestClose={() => setShowDatePicker(false)}
                        >
                            <View style={styles.modalBackground}>
                                <View style={styles.iosDatePickerContainer}>
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display="spinner"
                                        onChange={handleDateChange}
                                        //style={{ backgroundColor: "#1e1e1e" }}
                                        themeVariant="dark"
                                    />
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
                        <View style={styles.timeAdjustButtons}>
                            <TouchableOpacity onPress={subtractTime} style={styles.timeAdjustButton} disabled={isRunning}>
                                <Text style={styles.timeAdjustButtonText}>-30</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={addTime} style={styles.timeAdjustButton} disabled={isRunning}>
                                <Text style={styles.timeAdjustButtonText}>+30</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={toggleTimer} style={[styles.button, isRunning && styles.stopButton]}>
                            <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start Routine Timer"}</Text>
                        </TouchableOpacity>
                        {!isRunning && time > 0 && (
                            <TouchableOpacity onPress={resetTimer} style={styles.button}>
                                <Text style={styles.buttonText}>Reset</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Log Routine Header */}
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
                            <TouchableOpacity style={styles.trashButton} onPress={() => deleteRoutine(index)}>
                                <Ionicons name="trash" size={20} color="#FF7F7F" />
                            </TouchableOpacity>
                            <Text style={styles.routineHeader}>{routine.routineName}</Text>
                            <View style={styles.separatorLine} />
                            <Text style={styles.loggedRoutineText}>
                                <Text style={styles.boldText}>Reps: </Text>
                                <Text>{routine.reps}</Text>
                            </Text>
                        </View>
                    ))}

                    {/* Notes */}
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

                    {/* Save */}
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

            {/* Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Routine</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Routine Name"
                            placeholderTextColor="#999"
                            value={routineName}
                            onChangeText={setRoutineName}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Reps"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={reps}
                            onChangeText={setReps}
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
        backgroundColor: "#1e1e1e",
        padding: 45,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
    },
    timer: {
        fontSize: 50,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
    },
    timeAdjustButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "60%",
        marginBottom: 20,
    },
    timeAdjustButton: {
        backgroundColor: "#444",
        padding: 10,
        borderRadius: 5,
        width: "45%",
        alignItems: "center",
    },
    timeAdjustButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    button: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        width: 160,
        alignItems: "center",
        marginVertical: 10,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#121212",
    },
    stopButton: {
        backgroundColor: "#FF7F7F",
    },
    logRoutineHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginTop: 4,
        marginBottom: 20,
    },
    logRoutineText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 20,
    },
    plusButton: {
        padding: 5,
    },
    loggedRoutine: {
        width: 320,
        backgroundColor: "#1e1e1e",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        position: "relative",
    },
    routineHeader: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
    },
    separatorLine: {
        height: 0.5,
        backgroundColor: "#fff",
        marginBottom: 10,
    },
    loggedRoutineText: {
        fontSize: 16,
        color: "#fff",
    },
    plusButton: {
        padding: 5,
    },
    plusButtonBorder: {
        backgroundColor: "#333", 
        borderRadius: 20, 
        width: 40, 
        height: 40, 
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
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
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        alignSelf: "flex-start", // Align to the left
        marginLeft: 5, // Match the padding of the notesBox
        marginTop: 10,
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
        //borderWidth: 0.5,
        //borderColor: "#A9A9A9",
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
        backgroundColor: "#1e1e1e",
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },
    modalInput: {
        backgroundColor: "#333",
        color: "#fff",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalCancelButton: {
        backgroundColor: "#333",
        padding: 10,
        borderRadius: 5,
        width: "45%",
        alignItems: "center",
    },
    exerciseSaveButton: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 5,
        width: "45%",
        alignItems: "center",
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    exerciseSaveButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#121212",
    },
    datePickerContainer: {
        marginTop: 20,
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
        backgroundColor: "#333",
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
        backgroundColor: "#444",
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

export default PilatesScreen;
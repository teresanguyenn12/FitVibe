import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";

const StrengthTrainingScreen = () => {
    const navigation = useNavigation();
    const [time, setTime] = useState(0); // Time in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [sets, setSets] = useState([]);
    const [notes, setNotes] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [exercise, setExercise] = useState("");
    const [setsCount, setSetsCount] = useState(""); // New state for sets
    const [reps, setReps] = useState(""); // Reps state
    const [weight, setWeight] = useState(""); // Weight state
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
            if (time === 0) return; // Don't start if time is 0
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
        if (exercise.trim() === "" || setsCount.trim() === "" || reps.trim() === "" || weight.trim() === "") {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        const newSet = {
            exercise: `Exercise ${sets.length + 1}: ${exercise}`,
            sets: setsCount, // Save sets separately
            reps, // Save reps separately
            weight,
        };
        setSets([...sets, newSet]);
        closeModal();
    };

    const deleteSet = (index) => {
        const updatedSets = sets.filter((_, i) => i !== index);
        // Update exercise numbers after deletion
        const renumberedSets = updatedSets.map((set, i) => ({
            ...set,
            exercise: `Exercise ${i + 1}: ${set.exercise.split(": ")[1]}`,
        }));
        setSets(renumberedSets);
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSavePress = () => {
        Alert.alert(
            "Do you want to save your workout?",
            "",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Save", onPress: () => console.log("Strength training workout saved!") }
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
            <Text style={styles.title}>Strength Training</Text>
            <View style={styles.titleUnderline} />

            {/* ScrollView with only vertical scrolling */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                horizontal={false} // Disable horizontal scrolling
                showsHorizontalScrollIndicator={false} // Hide horizontal scroll indicator
                showsVerticalScrollIndicator={true} // Show vertical scroll indicator
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
                            <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start Rest Timer"}</Text>
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
                        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.plusButton}>
                            <View style={styles.plusButtonBorder}>
                                <Ionicons name="add" size={28} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Logged Sets */}
                    {sets.map((set, index) => (
                        <View key={index} style={styles.loggedSet}>
                            <TouchableOpacity
                                style={styles.trashButton}
                                onPress={() => deleteSet(index)}
                            >
                                <Ionicons name="trash" size={20} color="#FF7F7F" />
                            </TouchableOpacity>
                            <Text style={styles.exerciseHeader}>{set.exercise}</Text>
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
                            placeholderTextColor="#999"
                            multiline
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>

                    {/* Save Button */}
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

            {/* Modal for Logging Sets */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Exercise</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Exercise Name"
                            placeholderTextColor="#999"
                            value={exercise}
                            onChangeText={setExercise}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Sets"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={setsCount}
                            onChangeText={setSetsCount}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Reps"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={reps}
                            onChangeText={setReps}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Weight (lbs)"
                            placeholderTextColor="#999"
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
        marginBottom: 18,
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
        fontSize: 17,
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
        width: "100%", // Ensure it does not exceed screen width
        marginTop: 20,
        marginBottom: 20,
        //marginLeft: 40,
        paddingleft: 20,
        paddingRight: 10,
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
    plusButtonBorder: {
        backgroundColor: "#333", 
        borderRadius: 20, 
        width: 40, 
        height: 40, 
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    loggedSet: {
        width: 320, // Ensure it does not exceed screen width
        backgroundColor: "#1e1e1e",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        position: "relative",
    },
    loggedSetText: {
        fontSize: 16,
        color: "#fff",
    },
    exerciseHeader: {
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
        alignSelf: "flex-start", 
        marginLeft: 5, 
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
        backgroundColor: "#121212",
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

export default StrengthTrainingScreen;

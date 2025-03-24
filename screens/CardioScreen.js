import React, { useState, useRef, useEffect } from "react";
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Platform } from "react-native";

const getDistanceFromLatLonInMiles = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const deg2rad = (deg) => deg * (Math.PI / 180);

const CardioScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("Walking");
    const [notes, setNotes] = useState({ Walking: "", Running: "" });

    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const [distance, setDistance] = useState(0);
    const [pace, setPace] = useState("0:00");
    const [prevLocation, setPrevLocation] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const timers = useRef({
        Walking: { time: 0, isRunning: false, laps: [] },
        Running: { time: 0, isRunning: false, laps: [] }
    });

    const timerRef = useRef(null);
    const locationSubscription = useRef(null);

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (distance > 0 && time > 0) {
            const paceInSeconds = time / distance;
            const minutes = Math.floor(paceInSeconds / 60);
            const seconds = Math.floor(paceInSeconds % 60);
            setPace(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
            setPace("0:00");
        }
    }, [time, distance]);

    const switchTab = (tab) => {
        clearInterval(timerRef.current);
        timerRef.current = null;

        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        timers.current[activeTab] = { time, isRunning, laps };
        setActiveTab(tab);
        setTime(timers.current[tab].time);
        setIsRunning(false);
        setLaps(timers.current[tab].laps);
        setNotes((prev) => ({ ...prev, [tab]: "" }));
        setDistance(0);
        setPace("0:00");
        setPrevLocation(null);
    };

    const toggleTimer = () => {
        if (isRunning) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }
        } else {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);

            const startTracking = async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission to access location was denied.");
                    return;
                }

                locationSubscription.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    (location) => {
                        if (prevLocation) {
                            const dist = getDistanceFromLatLonInMiles(
                                prevLocation.coords.latitude,
                                prevLocation.coords.longitude,
                                location.coords.latitude,
                                location.coords.longitude
                            );
                            setDistance((prev) => prev + dist);
                        }
                        setPrevLocation(location);
                    }
                );
            };

            startTracking();
        }

        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = null;

        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        setIsRunning(false);
        setTime(0);
        setLaps([]);
        setDistance(0);
        setPace("0:00");
        setPrevLocation(null);
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
        Alert.alert("Do you want your workout to be recorded?", "", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Save",
                onPress: () => console.log("Cardio workout saved!"),
                style: "default",
            },
        ]);
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
            <Text style={styles.title}>Cardio</Text>
            <View style={styles.titleUnderline} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                    
                    {/* Distance and Pace Section */}
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricBox}>
                            <Text style={styles.metricHeading}>Distance Traveled</Text>
                            <Text style={styles.metricValue}>{distance.toFixed(2)} miles</Text>
                        </View>
                        <View style={styles.metricBox}>
                            <Text style={styles.metricHeading}>Pace/Mile</Text>
                            <Text style={styles.metricValue}>{pace} /mi</Text>
                        </View>
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

                    <View style={styles.notesContainer}>
                        <Text style={styles.notesHeading}>Notes</Text>
                        <TextInput
                            style={styles.notesBox}
                            placeholder="Enter notes here"
                            placeholderTextColor="#999"
                            multiline
                            textAlignVertical="top"
                            value={notes[activeTab]}
                            onChangeText={(text) =>
                                setNotes((prev) => ({ ...prev, [activeTab]: text }))
                            }
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
        paddingBottom: 50,
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
    notesContainer: {
        width: "100%",
        alignItems: "center",
    },
    notesHeading: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        alignSelf: "flex-start",
        marginLeft: 20,
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
    metricsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "90%",
        marginTop: 20,
    },
    metricBox: {
        backgroundColor: "#1e1e1e",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        width: "45%",
    },
    metricHeading: {
        color: "#B0B0B0",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    metricValue: {
        color: "#fff",
        fontSize: 20,
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

export default CardioScreen;

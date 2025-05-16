import React, { useState, useRef, useEffect } from "react";
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal } from "react-native";
import haversine from "haversine-distance";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTheme } from "../contexts/ThemeContext";

const screenWidth = Dimensions.get("window").width;

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
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("Walking");
    const [notes, setNotes] = useState({ Walking: "", Running: "" });
    const [isSaving, setIsSaving] = useState(false);

    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const [distance, setDistance] = useState(0);
    const [pace, setPace] = useState("0:00");
    const [prevLocation, setPrevLocation] = useState(null);
    const [initialLocation, setInitialLocation] = useState(null);
    const [mileMarkers, setMileMarkers] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const timers = useRef({
        Walking: { time: 0, isRunning: false, laps: [], distance: 0, mileMarkers: [] },
        Running: { time: 0, isRunning: false, laps: [], distance: 0, mileMarkers: [] }
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
        const currentMile = Math.floor(distance);
        if (currentMile > 0 && currentMile > mileMarkers.length) {
            setMileMarkers(prev => [...prev, time]);
        }

        if (mileMarkers.length > 0) {
            const totalMiles = mileMarkers.length;
            const lastMileTime = mileMarkers[mileMarkers.length - 1];
            const averagePacePerMile = lastMileTime / totalMiles;
            const minutes = Math.floor(averagePacePerMile / 60);
            const seconds = Math.floor(averagePacePerMile % 60);
            setPace(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else if (distance > 0 && time > 0) {
            const paceInSeconds = time / distance;
            const minutes = Math.floor(paceInSeconds / 60);
            const seconds = Math.floor(paceInSeconds % 60);
            setPace(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
            setPace("0:00");
        }
    }, [time, distance, mileMarkers]);

    const switchTab = (tab) => {
        clearInterval(timerRef.current);
        timerRef.current = null;

        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        timers.current[activeTab] = { 
            time, 
            isRunning, 
            laps, 
            distance, 
            mileMarkers 
        };
        
        setActiveTab(tab);
        const tabData = timers.current[tab];
        setTime(tabData.time);
        setIsRunning(false);
        setLaps(tabData.laps);
        setDistance(tabData.distance);
        setMileMarkers(tabData.mileMarkers);
        setPrevLocation(null);
        setInitialLocation(null);
    };

    const toggleTimer = async () => {
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
    
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission to access location was denied.");
                return;
            }
    
            try {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                });
                console.log("Manual fetch of current location:", loc.coords);
            } catch (error) {
                console.log("Error fetching current location:", error);
            }
    
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (newLocation) => {
                    const { latitude, longitude } = newLocation.coords;
                    const newCoord = { latitude, longitude };
                    console.log("📍 New GPS coords received:", newCoord);
    
                    if (!initialLocation) {
                        setInitialLocation(newCoord);
                        setPrevLocation(newCoord);
                        console.log("✅ Initial location set:", newCoord);
                        return;
                    }
    
                    if (prevLocation) {
                        const dist = haversine(prevLocation, newCoord) / 1609.34;
                        console.log("📏 Distance between points:", dist.toFixed(6), "miles");
    
                        if (dist > 0.00001) {
                            setDistance((prev) => {
                                const updatedDistance = prev + dist;
    
                                const completedMile = Math.floor(updatedDistance);
                                if (completedMile > mileMarkers.length) {
                                    console.log(`🏁 Mile ${completedMile} completed at time: ${time}s`);
                                    setMileMarkers((prevMarkers) => [...prevMarkers, time]);
                                }
    
                                return updatedDistance;
                            });
    
                            setPrevLocation(newCoord);
                        }
                    }
                }
            );
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
        setInitialLocation(null);
        setMileMarkers([]);
    };

    const recordLap = () => {
        setLaps([...laps, { time, distance }]);
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

        if (time === 0 || distance === 0) {
            Alert.alert("Empty Workout", "Please complete a workout before saving.");
            return;
        }
    
        setIsSaving(true);
        try {
            await addDoc(collection(db, "workouts"), {
                userId: user.uid,
                type: activeTab.toLowerCase(),
                date: selectedDate.toISOString().split("T")[0],
                time,
                distance: parseFloat(distance.toFixed(2)),
                pace,
                notes: notes[activeTab].trim(),
                laps,
                timestamp: serverTimestamp(),
            });
    
            Alert.alert("Saved!", `Your ${activeTab.toLowerCase()} workout has been recorded.`);
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
            marginBottom: 15,
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
        tabWrapper: {
            flexDirection: "row",
            backgroundColor: theme.mode === "dark" ? "#2B2D31" : "#E0E0E0", // similar to card/border
            borderRadius: 50,
            width: "90%",
            marginBottom: 12,
        },
        tabButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
        },
        activeTabButton: {
            backgroundColor: theme.primary,
        },
        inactiveTabButton: {
            backgroundColor: "transparent",
        },
        tabText: {
            fontSize: 15,
            fontWeight: "bold",
        },
        activeTabText: {
            color: "#fff",
        },
        inactiveTabText: {
            color: theme.text,
        },
        tabs: {
            flexDirection: "row",
            width: "90%",
            justifyContent: "center",
            marginBottom: 20,
            gap: 30, // Add space between tabs
        },
        timerHeading: {
            color: theme.subtext,
            fontSize: 17,
            marginBottom: 5,
        },
        timerContainer: {
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
            width: "90%",
            marginBottom: 20,
            backgroundColor: 'transparent',
        },
        timer: {
            fontSize: 50,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 20,
        },
        metricsRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: "85%",
            marginBottom: 20,
        },
        metricBox: {
            backgroundColor: theme.card,
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
            width: "48%",
        },
        metricHeading: {
            color: theme.subtext,
            fontSize: 14,
            marginTop: 5,
            textAlign: "center",
        },
        metricValue: {
            color: theme.text,
            fontSize: 37,
            fontWeight: "bold",
        },
        button: {
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 30,
            width: 320,
            alignItems: "center",
            marginVertical: 8,
        },
        stopButton: {
            backgroundColor: "#D32F2F",
        },
        buttonText: {
            fontSize: 15,
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
            textAlign: "right",
        },
        lapDistance: {
            color: theme.subtext,
            fontSize: 14,
            textAlign: "right",
        },
        lapButton: {
            backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0',
            padding: 12,
            borderRadius: 30,
            width: 320,
            alignItems: "center",
            marginVertical: 8,
        },
        lapButtonText: {
            fontSize: 15,
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
            marginLeft: 30,
            marginTop: 20,
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
            width: 320,
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
            marginBottom: 30,
            width: "100%",
            alignItems: "center",
        },
        datePickerLabel: {
            color: theme.text,
            fontSize: 17,
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
            <Text style={styles.title}>Cardio</Text>
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
                    <View style={styles.tabWrapper}>
                        <TouchableOpacity
                            onPress={() => switchTab("Walking")}
                            style={[
                            styles.tabButton,
                            activeTab === "Walking" ? styles.activeTabButton : styles.inactiveTabButton,
                            ]}
                        >
                            <Text
                            style={[
                                styles.tabText,
                                activeTab === "Walking" ? styles.activeTabText : styles.inactiveTabText,
                            ]}
                            >
                            Walking
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => switchTab("Running")}
                            style={[
                            styles.tabButton,
                            activeTab === "Running" ? styles.activeTabButton : styles.inactiveTabButton,
                            ]}
                        >
                            <Text
                            style={[
                                styles.tabText,
                                activeTab === "Running" ? styles.activeTabText : styles.inactiveTabText,
                            ]}
                            >
                            Running
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timerContainer}>
                        <Text style={styles.timerHeading}>Duration</Text>
                        <Text style={styles.timer}>{formatTime(time)}</Text>
                        <TouchableOpacity onPress={recordLap} style={styles.lapButton}>
                            <Text style={styles.lapButtonText}>Lap</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleTimer} style={[styles.button, isRunning && styles.stopButton]}>
                            <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start"}</Text>
                        </TouchableOpacity>
                        {!isRunning && time > 0 && (
                            <TouchableOpacity onPress={resetTimer} style={styles.lapButton}>
                                <Text style={styles.lapButtonText}>Reset</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <View style={styles.metricsRow}>
                        <View style={styles.metricBox}>
                            <Text style={styles.metricValue}>{distance.toFixed(2)}</Text>
                            <Text style={styles.metricHeading}>Distance (miles)</Text>
                        </View>
                        <View style={styles.metricBox}>
                            <Text style={styles.metricValue}>{pace}</Text>
                            <Text style={styles.metricHeading}>Pace/Mile</Text>
                        </View>
                    </View>

                    {laps.length > 0 && (
                        <View style={styles.lapsContainer}>
                            {laps.map((lap, index) => (
                                <View key={index} style={styles.lapRow}>
                                    <Text style={styles.lapNumber}>Lap {index + 1}</Text>
                                    <View>
                                        <Text style={styles.lapTime}>{formatTime(lap.time)}</Text>
                                        <Text style={styles.lapDistance}>{lap.distance.toFixed(2)} miles</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.notesContainer}>
                        <Text style={styles.notesHeading}>Notes</Text>
                        <TextInput
                            style={styles.notesBox}
                            placeholder="Enter notes here"
                            placeholderTextColor={theme.subtext}
                            multiline
                            textAlignVertical="top"
                            value={notes[activeTab]}
                            onChangeText={(text) =>
                                setNotes((prev) => ({ ...prev, [activeTab]: text }))
                            }
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
        </View>
    );
};

export default CardioScreen;
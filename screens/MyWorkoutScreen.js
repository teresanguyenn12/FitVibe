import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { startOfMonth, endOfMonth } from "date-fns"; 
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { useTheme } from "../contexts/ThemeContext";

const MyWorkoutsScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState("");
    const [workouts, setWorkouts] = useState([]);
    const [cachedWorkouts, setCachedWorkouts] = useState([]); 
    const cacheFetchedRef = useRef(false);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const fetchWorkouts = async () => {
        if (!selectedDate) return;

        const user = auth.currentUser;
        if (!user) return;

        try {
            // First time in this session: fetch all this month's workouts
            if (!cacheFetchedRef.current) {
                const now = new Date();
                const startDate = startOfMonth(now).toISOString().slice(0, 10);
                const endDate = endOfMonth(now).toISOString().slice(0, 10);

                const q = query(
                    collection(db, "workouts"),
                    where("userId", "==", user.uid),
                    where("date", ">=", startDate),
                    where("date", "<=", endDate)
                );
                const snapshot = await getDocs(q);
                const monthWorkouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setCachedWorkouts(monthWorkouts); // cache workouts
                cacheFetchedRef.current = true;
            }

            //  Filter cached workouts by selected date
            const dailyWorkouts = cachedWorkouts.filter(workout => workout.date === selectedDate);
            setWorkouts(dailyWorkouts);

            await updateWorkoutCareerStats();
        } catch (error) {
            console.error("Error fetching workouts:", error);
        }
    };

    const updateWorkoutCareerStats = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const workoutCount = cachedWorkouts.length;

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            workouts: workoutCount,
        });
    };

    const handleDeleteWorkout = (id) => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "workouts", id));
                            cacheFetchedRef.current = false; //  reset cache when delete
                            fetchWorkouts(); // reload
                            Alert.alert("Deleted", "Workout has been deleted.");
                        } catch (error) {
                            console.error("Error deleting workout:", error);
                            Alert.alert("Error", "Could not delete workout. Please try again.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    useEffect(() => {
        fetchWorkouts();
    }, [selectedDate]);

    const renderWorkoutItem = ({ item, drag }) => (
        <ScaleDecorator>
            <View style={styles.swipeableWrapper}>
                <Swipeable
                    renderRightActions={() => (
                        <View style={styles.swipeDeleteContainer}>
                            <TouchableOpacity style={styles.swipeDelete} onPress={() => handleDeleteWorkout(item.id)}>
                                <Text style={styles.swipeDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                >
                    <TouchableOpacity
                        onLongPress={drag}
                        delayLongPress={200}
                        activeOpacity={0.9}
                        style={styles.workoutCard}
                    >
                        <View style={styles.infoBoxHeader}>
                            <Text style={styles.workoutTitle}>
                                {item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || "Workout"}
                            </Text>
                            <Ionicons name="menu" size={20} color="#fff" />
                        </View>

                        {item.time != null && (
                            <Text style={styles.infoText}>Duration: {formatTime(item.time)}</Text>
                        )}
                        {item.distance != null && (
                            <Text style={styles.infoText}>Distance: {item.distance.toFixed(2)} miles</Text>
                        )}
                        {item.pace && (
                            <Text style={styles.infoText}>Pace: {item.pace}</Text>
                        )}
                        {item.exercises?.length > 0 && (
                            <>
                                <Text style={[styles.infoText, { fontWeight: "bold", marginTop: 5 }]}>Exercises:</Text>
                                {item.exercises.map((ex, idx) => (
                                    <Text key={idx} style={styles.infoText}>
                                        {ex.exercise} – {ex.sets} sets x {ex.reps} reps @ {ex.weight} lbs
                                    </Text>
                                ))}
                            </>
                        )}
                        {item.routines?.length > 0 && (
                            <>
                                <Text style={[styles.infoText, { fontWeight: "bold", marginTop: 5 }]}>Routines:</Text>
                                {item.routines.map((routine, idx) => (
                                    <Text key={idx} style={styles.infoText}>
                                        {routine.routineName} – {routine.reps} reps
                                    </Text>
                                ))}
                            </>
                        )}
                        {item.laps?.length > 0 && (
                            <>
                                <Text style={[styles.infoText, { fontWeight: "bold", marginTop: 5 }]}>Laps:</Text>
                                {item.laps.map((lap, idx) => (
                                    <Text key={idx} style={styles.infoText}>
                                        {lap.time !== undefined
                                            ? `Lap ${idx + 1}: ${formatTime(lap.time)}`
                                            : `Lap ${idx + 1}`}
                                        {lap.distance !== undefined
                                            ? ` – ${lap.distance.toFixed(2)} miles`
                                            : ""}
                                    </Text>
                                ))}
                            </>
                        )}
                        {item.notes && (
                            <Text style={styles.infoText}>Notes: {item.notes}</Text>
                        )}
                    </TouchableOpacity>
                </Swipeable>
            </View>
        </ScaleDecorator>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>My Workouts</Text>
            </View>

            <DraggableFlatList
                data={workouts}
                keyExtractor={(item) => item.id}
                renderItem={renderWorkoutItem}
                onDragEnd={({ data }) => setWorkouts(data)}
                ListHeaderComponent={
                    <View>
                        <View style={[styles.calendarContainer, { backgroundColor: theme.cardBackground }]}>
                            <Calendar
                                theme={{
                                    backgroundColor: theme.cardBackground,
                                    calendarBackground: theme.cardBackground,
                                    textSectionTitleColor: theme.text,
                                    selectedDayBackgroundColor: "#7C3AED", // Kept purple
                                    selectedDayTextColor: "#fff",
                                    todayTextColor: "#7C3AED", // Kept purple
                                    dayTextColor: theme.text,
                                    arrowColor: theme.text,
                                    monthTextColor: theme.text,
                                    textDisabledColor: theme.disabledText,
                                }}
                                onDayPress={(day) => setSelectedDate(day.dateString)}
                                style={styles.calendar}
                            />
                        </View>

                        {selectedDate && (
                            <View style={[styles.infoBox, { backgroundColor: theme.cardBackground }]}>
                                <Text style={[styles.infoText, { color: theme.subtext }]}>Selected Date:</Text>
                                <Text style={[styles.selectedDate, { color: theme.text }]}>{selectedDate}</Text>
                            </View>
                        )}
                        {!selectedDate && (
                            <Text style={[styles.placeholderText, { color: theme.text }]}>Select a date to see workouts</Text>
                        )}
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        paddingTop: 60 
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        marginBottom: 15,
        position: "relative",
    },
    backButton: { 
        padding: 10, 
        borderRadius: 10 
    },
    title: { 
        fontSize: 24, 
        fontWeight: "bold", 
        textAlign: "center", 
        flex: 1, 
        marginRight: 40 
    },
    calendarContainer: {
        alignSelf: "center",
        width: Dimensions.get("window").width * 0.9,
        borderRadius: 15,
        padding: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    calendar: { 
        borderRadius: 15, 
        padding: 10 
    },
    workoutCard: { 
        backgroundColor: "#1E1E1E", 
        borderColor: "#7C3AED", 
        borderWidth: 1, 
        borderRadius: 12, 
        marginVertical: 8, 
        padding: 12, 
        width: Dimensions.get("window").width * 0.85, 
        alignSelf: "center" 
    },
    swipeableWrapper: { 
        marginHorizontal: Dimensions.get("window").width * 0.075 
    },
    swipeDeleteContainer: { 
        justifyContent: "center" 
    },
    swipeDelete: { 
        backgroundColor: "#ff4d4d", 
        justifyContent: "center", 
        alignItems: "center", 
        width: 80, 
        height: "90%", 
        borderRadius: 10 
    },
    swipeDeleteText: { 
        color: "#fff", 
        fontWeight: "bold" 
    },
    infoBoxHeader: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 8 
    },
    workoutTitle: { 
        fontSize: 18, 
        fontWeight: "bold", 
        color: "#fff" 
    },
    infoText: { 
        color: "#bbb", 
        fontSize: 15, 
        marginBottom: 4 
    },
    selectedDate: { 
        fontSize: 18, 
        fontWeight: "bold" 
    },
    placeholderText: { 
        textAlign: "center", 
        fontSize: 16, 
        marginTop: 20 
    },
    infoBox: { 
        alignSelf: "center", 
        padding: 10, 
        borderRadius: 10, 
        width: Dimensions.get("window").width * 0.85, 
        marginTop: 10 
    },
});

export default MyWorkoutsScreen;

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

const { width } = Dimensions.get("window");

const MyWorkoutsScreen = () => {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState("");

    return (
        <View style={styles.container}>
            {/* Header Section (Back Button + Title) */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>My Workouts</Text>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
                <Calendar
                    theme={{
                        backgroundColor: "#1E1E1E",
                        calendarBackground: "#1E1E1E",
                        textSectionTitleColor: "#fff",
                        selectedDayBackgroundColor: "#8e24aa",
                        selectedDayTextColor: "#fff",
                        todayTextColor: "#8e24aa",
                        dayTextColor: "#fff",
                        arrowColor: "#fff",
                        monthTextColor: "#fff",
                        textDisabledColor: "#555",
                    }}
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    style={styles.calendar}
                />
            </View>

            {/* Selected Date Display */}
            {selectedDate ? (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>Selected Date:</Text>
                    <Text style={styles.selectedDate}>{selectedDate}</Text>
                </View>
            ) : (
                <Text style={styles.placeholderText}>Select a date to see workouts</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        paddingTop: 60,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center", 
      paddingHorizontal: 20,
      marginBottom: 25, 
      position: "relative",
    },
    backButton: {
        padding: 10,
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        flex: 1, 
        marginRight: 40,
        fontFamily: "TiltWarp-Regular",
    },
    calendarContainer: {
        alignSelf: "center",
        width: width * 0.9,
        backgroundColor: "#1E1E1E",
        borderRadius: 15,
        padding: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    calendar: {
        borderRadius: 15,
        padding: 10,
    },
    infoBox: {
        backgroundColor: "#1E1E1E",
        marginTop: 15,
        padding: 10,
        borderRadius: 10,
        alignSelf: "center",
        width: width * 0.8,
        alignItems: "center",
        elevation: 3,
    },
    infoText: {
        color: "#bbb",
        fontSize: 16,
    },
    selectedDate: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    placeholderText: {
        textAlign: "center",
        color: "#666",
        fontSize: 16,
        marginTop: 20,
    },
});

export default MyWorkoutsScreen;

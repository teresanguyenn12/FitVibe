import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const workoutOptions = [
    { name: "StrengthTraining", image: require("../assets/workouts/strength.jpg") },
    { name: "Cardio", image: require("../assets/workouts/cardio.jpg") },
    { name: "Yoga", image: require("../assets/workouts/yoga.jpg") },
    { name: "Cycling", image: require("../assets/workouts/cycling.jpg") },
    { name: "Swimming", image: require("../assets/workouts/swimming.jpg") },
    { name: "Hiking", image: require("../assets/workouts/hiking.jpg") },
    { name: "Pilates", image: require("../assets/workouts/pilates.jpg") },
];

const StartWorkoutScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Start Workout</Text>
            </View>

            {/* Workout Options List */}
            <ScrollView contentContainerStyle={styles.listContainer}>
                {workoutOptions.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.workoutCard}
                        onPress={() => {navigation.navigate(item.name)}
                        }
                    >
                        
                        <Image source={item.image} style={styles.image} />
                        <View style={styles.overlay} />
                        <Text style={styles.workoutText}>
                            {item.name === "StrengthTraining" ? "Strength Training" : item.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        paddingTop: 80, 
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", 
        paddingHorizontal: 20,
        marginBottom: 25, 
        position: "relative",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center", 
      flex: 1, 
      marginRight: 21, 
      fontFamily: "TiltWarp-Regular",
  },
  
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    workoutCard: {
        width: "100%",
        borderRadius: 15,
        overflow: "hidden",
        marginBottom: 15,
        position: "relative",
        backgroundColor: "#1E1E1E",
    },
    image: {
        width: "100%",
        height: width * 0.4,
        borderRadius: 15,
    },
    overlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    workoutText: {
        position: "absolute",
        bottom: 15,
        left: 15,
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "TiltWarp-Regular",
    },
});

export default StartWorkoutScreen;

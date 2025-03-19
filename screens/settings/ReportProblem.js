import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ReportProblem = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Report Problem</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#131417",
    },
    text: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
    },
});

export default ReportProblem;

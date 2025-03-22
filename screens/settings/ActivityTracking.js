import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const ActivityTracking = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchActivityTrackingStatus();
  }, [user]);

  const fetchActivityTrackingStatus = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setIsTrackingEnabled(userDoc.data().activityTracking || false);
      }
    } catch (error) {
      console.error("Error fetching activity tracking status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTracking = async () => {
    try {
      const newStatus = !isTrackingEnabled;
      setIsTrackingEnabled(newStatus);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { activityTracking: newStatus });
    } catch (error) {
      console.error("Error updating activity tracking:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8e24aa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Activity Tracking</Text>
      </View>

      {/* Switch Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Enable Activity Tracking</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#8e24aa" }}
          thumbColor={isTrackingEnabled ? "#fff" : "#aaa"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTracking}
          value={isTrackingEnabled}
        />
      </View>

      {/* Status Message */}
      <Text style={styles.statusText}>
        {isTrackingEnabled ? "Activity tracking is enabled" : "Activity tracking is disabled"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#131417",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    margintop: 40,
    marginBottom: 30,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 30,
  },
  card: {
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  statusText: {
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    marginTop: 25,
  },
});

export default ActivityTracking;

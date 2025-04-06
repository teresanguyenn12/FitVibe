import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Button, Alert, ScrollView, TouchableOpacity } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  serverTimestamp,
  increment,
} from "firebase/firestore";

export default function WalkChallengeProgressScreen({ route, navigation }) {
  const { challenge } = route.params;
  const [location, setLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [sessionDistance, setSessionDistance] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [progress, setProgress] = useState({});
  const [isTracking, setIsTracking] = useState(true);
  const watchId = useRef(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !challenge) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      await fetchProgress();
      setStartTime(Date.now());
      startTracking();
    })();

    return () => {
      if (watchId.current) watchId.current.remove();
    };
  }, []);

  const fetchProgress = async () => {
    try {
      const challengeRef = doc(db, "challenges", challenge.id);
      const challengeSnap = await getDoc(challengeRef);
      const data = challengeSnap.data();
      const userProgress = data.progress?.find((p) => p.userId === user.uid);
      setProgress(userProgress || {});
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const startTracking = async () => {
    watchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        if (location) {
          const dist = haversine(location.coords, newLocation.coords) / 1609.34; // meters to miles
          setSessionDistance((prev) => prev + dist);
        }
        setLocation(newLocation);
      }
    );
  };

  const stopTracking = async () => {
    if (watchId.current) {
      watchId.current.remove();
    }
    setIsTracking(false);
    try {
      const challengeRef = doc(db, "challenges", challenge.id);
      await updateDoc(challengeRef, {
        progress: arrayRemove(progress),
      });
      const updatedProgress = {
        ...progress,
        milesCompleted: (progress.milesCompleted || 0) + sessionDistance,
        lastUpdated: serverTimestamp(),
      };
      await updateDoc(challengeRef, {
        progress: arrayUnion(updatedProgress),
      });
      Alert.alert("Workout saved", `Distance: ${sessionDistance.toFixed(2)} miles`);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>{challenge.name}</Text>
      <MapView
        style={styles.map}
        region={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && <Marker coordinate={location.coords} />}
        <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="#00BFFF" />
      </MapView>
      <Text style={styles.distanceText}>Distance: {sessionDistance.toFixed(2)} mi</Text>
      <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
        <Text style={styles.stopText}>Stop</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginVertical: 20,
    marginTop: 60,
  },
  map: {
    width: "100%",
    height: 300,
  },
  distanceText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginVertical: 10,
  },
  stopButton: {
    backgroundColor: "#FF7F7F",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  stopText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#121212",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 999,
    backgroundColor: "#00000088",
    padding: 6,
  },
});
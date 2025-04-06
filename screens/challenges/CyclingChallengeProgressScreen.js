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

export default function CyclingChallengeProgressScreen({ route, navigation }) {
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
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    setProgress(userSnap.data()?.challengeProgress?.[challenge.id] || {});
  };

  const startTracking = async () => {
    watchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      async (newLocation) => {
        if (!isTracking) return;

        const { latitude, longitude } = newLocation.coords;
        const newCoord = { latitude, longitude };

        if (routeCoordinates.length > 0) {
          const lastCoord = routeCoordinates[routeCoordinates.length - 1];
          const dist = haversine(lastCoord, newCoord) / 1609.34; // meters to miles
          const updatedDistance = sessionDistance + dist;
          setSessionDistance(updatedDistance);

          const userRef = doc(db, "users", user.uid);
          const progressPath = `challengeProgress.${challenge.id}`;

          await updateDoc(userRef, {
            [`${progressPath}.distance`]: increment(dist),
            [`${progressPath}.lastUpdated`]: serverTimestamp(),
          });

          const progressSnap = await getDoc(userRef);
          const updated = progressSnap.data()?.challengeProgress?.[challenge.id];
          setProgress(updated);

          const metDistance = (updated?.distance ?? 0) >= (challenge.distanceGoal ?? Infinity);
          const metDuration = (updated?.duration ?? 0) >= (challenge.durationGoal ?? Infinity);

          if (metDistance || metDuration) {
            Alert.alert("Challenge Complete!");
            await updateDoc(userRef, {
              activeChallenges: arrayRemove(challenge.id),
              completedChallenges: arrayUnion(challenge.id),
            });
          }
        }

        setRouteCoordinates((prev) => [...prev, newCoord]);
        setLocation(newCoord);
      }
    );
  };

  const toggleTracking = () => setIsTracking((prev) => !prev);

  const handleQuitChallenge = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      activeChallenges: arrayRemove(challenge.id),
    });
    Alert.alert("Challenge Quit");
    navigation.goBack();
  };

  const formatMinutes = (min) => {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60);
    return `${h}h ${m}m`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={{
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="#00f" />
          <Marker coordinate={location} title="You" />
        </MapView>
      )}

      <ScrollView style={styles.infoContainer}>
        <Text style={styles.sessionTitle}>Tracking Challenge: {challenge.name}</Text>
        <Text style={styles.infoText}>Session Distance: {sessionDistance.toFixed(2)} miles</Text>
        <Text style={styles.infoText}>Session Time: {formatMinutes((Date.now() - startTime) / 60000)}</Text>
        <Button title={isTracking ? "Pause" : "Resume"} onPress={toggleTracking} />

        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>{challenge.name}</Text>
          <Text style={styles.progressText}>
            Distance: {(progress.distance ?? 0).toFixed(2)} / {challenge.distanceGoal ?? "-"} mi
          </Text>
          <Button title="Quit Challenge" color="red" onPress={handleQuitChallenge} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  infoContainer: {
    padding: 16,
    backgroundColor: "#1E1E1E",
  },
  sessionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  challengeCard: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
  },
  challengeTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  progressText: {
    color: "#ddd",
    fontSize: 15,
    marginBottom: 4,
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

import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import haversine from "haversine-distance";

const targetDistanceMiles = 10;

export default function RunChallengeProgressScreen() {
  const [location, setLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(0);
  const [isTracking, setIsTracking] = useState(true);
  const watchId = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      startTracking();
    })();

    return () => {
      if (watchId.current) Location.stopLocationUpdatesAsync(watchId.current);
    };
  }, []);

  const startTracking = async () => {
    watchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        const newCoord = { latitude, longitude };
      
        if (routeCoordinates.length > 0) {
          const lastCoord = routeCoordinates[routeCoordinates.length - 1];
          const dist = haversine(lastCoord, newCoord) / 1609.34; // convert meters to miles
      
          const updatedDistance = distance + dist;
      
          if (updatedDistance >= targetDistanceMiles) {
            Alert.alert("🎉 Challenge Complete!", `You ran ${targetDistanceMiles} miles!`);
            setDistance(updatedDistance);
            setIsTracking(false);
            return;
          }
      
          setDistance(updatedDistance);
        }
      
        setRouteCoordinates((prev) => [...prev, newCoord]);
        setLocation(newCoord);
      }      
    );
  };

  const toggleTracking = () => {
    setIsTracking((prev) => !prev);
  };

  return (
    <View style={styles.container}>
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
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Distance: {distance.toFixed(2)} miles</Text>
        <Button title={isTracking ? "Pause" : "Resume"} onPress={toggleTracking} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  infoContainer: {
    padding: 16,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
  },
  infoText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
});



// View info about one challenge
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";

const ChallengeDetailsScreen = ({ route }) => {
  const { challenge } = route.params;
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("Loading...");
  const navigation = useNavigation();

  useEffect(() => {
    let locationSubscription = null;

    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (newLocation) => {
          setLocation(newLocation.coords);

          const geoData = await Location.reverseGeocodeAsync(newLocation.coords);
          if (geoData.length > 0) {
            const place = geoData[0];
            setCity(place.city || place.region || place.name);
          }
        }
      );
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 33.7838,
          longitude: location?.longitude || -118.1141,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={
          location && {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
      >
        {location && (
          <Marker coordinate={location} title="You" pinColor="blue" />
        )}
      </MapView>

      {/* Challenge Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.challengeTitle}>{challenge.name}</Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Location:</Text> {city}
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Distance:</Text> {challenge.distance || "10 miles"}
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Duration:</Text> {challenge.duration || "24 hours"}
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Reward:</Text> {challenge.reward || "+500 XP"}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ConfirmSoloChallengeScreen", { challenge })}
          >
            <Text style={styles.buttonText}>Join Solo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonOutline}>
            <Text style={styles.buttonTextOutline}>Invite a Friend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  map: {
    width: "100%",
    height: "45%",
  },
  detailsContainer: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -30,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 6,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    flex: 1,
    backgroundColor: "#A0006D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonOutline: {
    flex: 1,
    borderColor: "#A0006D",
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonTextOutline: {
    color: "#A0006D",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChallengeDetailsScreen;

// View info about one challenge
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  increment,
} from "firebase/firestore";

const ChallengeDetailsScreen = ({ route }) => {
  const { challenge } = route.params;
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("Loading...");
  const navigation = useNavigation();
  const user = auth.currentUser;
  const challengeRef = doc(db, "challenges", challenge.id);
  const userRef = doc(db, "users", user.uid);

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
          const geoData = await Location.reverseGeocodeAsync(
            newLocation.coords
          );
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

  const handleJoinSolo = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "You must be logged in to join a challenge.");
        return;
      }

      const userRef = doc(db, "users", user.uid);

      await Promise.all([
        // 1. Update user document
        setDoc(
          userRef,
          {
            activeChallenges: arrayUnion(challenge.id),
            [`challengeProgress.${challenge.id}`]: {
              distance: 0,
              duration: 0,
              startedAt: serverTimestamp(),
              lastUpdated: serverTimestamp(),
            },
          },
          { merge: true }
        ),

        // 2. Update challenge document
        setDoc(
          challengeRef,
          {
            participants: arrayUnion(user.uid),
            participantCount: increment(1), // 🔥 this increases popularity
          },
          { merge: true }
        ),
      ]);

      const categoryToConfirmScreen = {
        Run: "RunConfirmSoloChallenge",
        Walk: "WalkConfirmSoloChallenge",
        Yoga: "YogaConfirmSoloChallenge",
        Lifting: "LiftingConfirmSoloChallenge",
        Cycling: "CyclingConfirmSoloChallenge",
      };

      const confirmScreen = categoryToConfirmScreen[challenge.category];
      if (confirmScreen) {
        navigation.navigate(confirmScreen, { challenge });
      } else {
        Alert.alert("Error", "Unknown challenge category.");
      }
    } catch (err) {
      console.error("Error joining challenge:", err);
      Alert.alert("Error", "Could not join challenge.");
    }
  };

  const handleInviteFriend = () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to invite friends.");
      return;
    }

    navigation.navigate("InviteFriendsQueueScreen", { challenge });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

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

      <View style={styles.detailsContainer}>
        <Text style={styles.challengeTitle}>{challenge.name}</Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Location:</Text> {city}
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Distance:</Text>{" "}
          {challenge.distance || "10 miles"}
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Duration:</Text>{" "}
          {challenge.duration || "24 hours"}
        </Text>
        <Text style={styles.detailText}>
          <Text style={{ fontWeight: "bold" }}>Reward:</Text>{" "}
          {challenge.reward || "+500 XP"}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleJoinSolo}>
            <Text style={styles.buttonText}>Join Solo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={handleInviteFriend}
          >
            <Text style={styles.buttonTextOutline}>Invite a Friend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  map: { width: "100%", height: "45%" },
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 999,
    backgroundColor: "#00000088",
    padding: 6,
  },
});

export default ChallengeDetailsScreen;

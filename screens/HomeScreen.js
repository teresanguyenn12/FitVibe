import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase"; 


const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({
    firstName: "Loading...", // Default until we fetch user data
    profilePicture: null, 
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        fetchUserData(firebaseUser.uid);
      } else {
        setUser({ firstName: "Guest", profilePicture: null });
      }
    });

    return () => unsubscribe();
  }, []);

  //Fetch user's first name from firebase to display name on homepage.
  const fetchUserData = async (uid) => {
    try {
      const db = getFirestore(app); 
      const userRef = doc(db, "users", uid); 
      const userSnap = await getDoc(userRef); 
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser({
          firstName: userData.fullName.split(" ")[0] || "User", // Extract first name
          profilePicture: userData.profilePicture || null,
        });
        console.log("User data loaded:", userData);
      } else {
        console.log("No such user document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hi <Text style={styles.bold}>{user.firstName}</Text>,
          </Text>
          <Text style={styles.subtext}>Let's get active!</Text>
        </View>

        {/* Profile Picture */}
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Image
            source={
              user.profilePicture
                ? { uri: user.profilePicture }
                : require("../assets/default-profile.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Main Buttons */}
      <View style={styles.cardBackground}>
        <View style={styles.cardContainer}>
          <View style={styles.row}>
            <LinearGradient colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("StartWorkout")}>
                <Ionicons name="time" size={40} color="#fff" />
                <Text style={styles.cardText}>Start Workout</Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("MyWorkouts")}>
                <Ionicons name="calendar" size={40} color="#fff" />
                <Text style={styles.cardText}>My Workouts</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.row}>
            <LinearGradient colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Rewards")}>
                <Ionicons name="trophy" size={40} color="#fff" />
                <Text style={styles.cardText}>Rewards</Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient colors={["#5A1A9B", "#1A4A80", "#8A1E50"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Progression")}>
                <Ionicons name="stats-chart" size={40} color="#fff" />
                <Text style={styles.cardText}>Progression</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 65,
    marginTop: 40,
  },
  greeting: {
    fontSize: 40,
    color: "#fff",
    fontFamily: "TiltWarp-Regular",
  },
  bold: {
    fontWeight: "bold",
  },
  subtext: {
    fontSize: 16,
    color: "#bbb",
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 20,
  },
  cardBackground: {
    flex: 1,
    width: "105%",
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingVertical: 30,
    alignItems: "center",
    marginLeft: -10,
  },
  cardContainer: {
    width: "90%",
    maxWidth: 350,
    alignSelf: "center",
    marginTop: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  cardBorder: {
    width: "48%",
    height: 155,
    borderRadius: 20,
    padding: 3,
  },
  card: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "TiltWarp-Regular",
  },
});

export default HomeScreen;

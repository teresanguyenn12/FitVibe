import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

// Apps with icons & library references
const availableApps = [
  { id: "google_fit", name: "Google Fit", icon: "google", lib: MaterialCommunityIcons },
  { id: "apple_health", name: "Apple Health", icon: "heart-pulse", lib: MaterialCommunityIcons },
  { id: "strava", name: "Strava", icon: "run-fast", lib: MaterialCommunityIcons },
  { id: "fitbit", name: "Fitbit", icon: "watch", lib: Feather },
];

const ConnectedApps = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [connectedApps, setConnectedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchConnectedApps();
  }, [user]);

  const fetchConnectedApps = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setConnectedApps(userDoc.data().connectedApps || []);
      }
    } catch (error) {
      console.error("Error fetching connected apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectApp = async (app) => {
    if (connectedApps.includes(app.id)) {
      Alert.alert("Already Connected", `${app.name} is already linked.`);
      return;
    }

    Alert.alert("Connect App", `Connect ${app.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Connect",
        onPress: async () => {
          try {
            const updatedApps = [...connectedApps, app.id];
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { connectedApps: updatedApps });
            setConnectedApps(updatedApps);
            Alert.alert("Success", `${app.name} has been connected.`);
          } catch (error) {
            console.error("Error connecting app:", error);
            Alert.alert("Error", "Could not connect app.");
          }
        },
      },
    ]);
  };

  const disconnectApp = async (appId) => {
    Alert.alert("Disconnect App", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        onPress: async () => {
          try {
            const updatedApps = connectedApps.filter((id) => id !== appId);
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { connectedApps: updatedApps });
            setConnectedApps(updatedApps);
            Alert.alert("Disconnected", "App successfully removed.");
          } catch (error) {
            console.error("Error disconnecting app:", error);
            Alert.alert("Error", "Could not disconnect app.");
          }
        },
      },
    ]);
  };

  const renderAppItem = ({ item }) => {
    const isConnected = connectedApps.includes(item.id);
    const IconComponent = item.lib;

    return (
      <View style={styles.appCard}>
        <View style={styles.appInfo}>
          <IconComponent name={item.icon} size={26} color="#fff" style={styles.appIcon} />
          <Text style={styles.appName}>{item.name}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, isConnected ? styles.disconnect : styles.connect]}
          onPress={() => (isConnected ? disconnectApp(item.id) : connectApp(item))}
        >
          <Text style={styles.buttonText}>
            {isConnected ? "Disconnect" : "Connect"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Connected Apps</Text>
      </View>

      {/* Loading */}
      {loading ? (
        <ActivityIndicator size="large" color="#8e24aa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={availableApps}
          keyExtractor={(item) => item.id}
          renderItem={renderAppItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop:20,
    marginBottom: 20,
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
  appCard: {
    backgroundColor: "#2B2D31",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  appIcon: {
    marginRight: 12,
  },
  appName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connect: {
    backgroundColor: "#8e24aa",
  },
  disconnect: {
    backgroundColor: "#D32F2F",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ConnectedApps;

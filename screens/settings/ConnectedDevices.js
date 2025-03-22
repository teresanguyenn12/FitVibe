//NEED TO ADD: Adding Devices is missing (need OAuth athentication or SDK integration)
//NEED TO ADD: Fetching real-time data from devices (can be implemented in the future)
//NEXT STEPS: implement API authentication, allow users to connect devices inside this screen, sync real-time fitness data into Firebase.

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const ConnectedDevices = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchConnectedDevices();
  }, [user]);

  const fetchConnectedDevices = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setDevices(userDoc.data().connectedDevices || []);
      }
    } catch (error) {
      console.error("Error fetching connected devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = async (deviceId) => {
    try {
      const updatedDevices = devices.filter((device) => device.id !== deviceId);
      setDevices(updatedDevices);

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { connectedDevices: updatedDevices });

      Alert.alert("Disconnected", "Device has been successfully disconnected.");
    } catch (error) {
      console.error("Error disconnecting device:", error);
    }
  };

  const renderDevice = ({ item }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceInfo}>
        <MaterialCommunityIcons name={item.icon} size={30} color="#FFFFFF" />
        <Text style={styles.deviceText}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.disconnectButton}
        onPress={() => disconnectDevice(item.id)}
      >
        <Text style={styles.disconnectText}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Connected Devices</Text>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#8e24aa" style={{ marginTop: 40 }} />
      ) : devices.length > 0 ? (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={renderDevice}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noDevicesText}>No devices connected</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 30, // to center text with back icon
  },
  listContainer: {
    paddingVertical: 10,
  },
  deviceCard: {
    backgroundColor: "#1E1F23",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: "#2D2F33",
    borderWidth: 1,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceText: {
    color: "#FFFFFF",
    fontSize: 17,
    marginLeft: 12,
    fontWeight: "500",
  },
  disconnectButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  disconnectText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  noDevicesText: {
    color: "#CCCCCC",
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
});

export default ConnectedDevices;

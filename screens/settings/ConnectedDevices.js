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
import { useTheme } from "../../contexts/ThemeContext"; // Import ThemeContext
import { useColorScheme } from "react-native"; // Import system color scheme

const ConnectedDevices = () => {
  const navigation = useNavigation();
  const { theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const headerTextColor = themeMode === "dark"
    ? "#FFFFFF"
    : themeMode === "light"
      ? "#111"
      : systemColorScheme === "dark"
        ? "#FFFFFF"
        : "#111";

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
    <View style={[styles.deviceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.deviceInfo}>
        <MaterialCommunityIcons name={item.icon} size={30} color={theme.text} />
        <Text style={[styles.deviceText, { color: theme.text }]}>{item.name}</Text>
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: headerTextColor }]}>Connected Devices</Text>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : devices.length > 0 ? (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={renderDevice}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={[styles.noDevicesText, { color: theme.subtext }]}>
          No devices connected
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginRight: 30,
  },
  listContainer: {
    paddingVertical: 10,
  },
  deviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceText: {
    fontSize: 17,
    marginLeft: 12,
    fontWeight: "500",
  },
  disconnectButton: {
    backgroundColor: "#D32F2F", // Red for disconnect
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
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
});

export default ConnectedDevices;

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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const BlockedUsers = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBlockedUsers();
  }, [user]);

  const fetchBlockedUsers = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (blockedUid) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedBlockedUsers = blockedUsers.filter((uid) => uid !== blockedUid);

      await updateDoc(userDocRef, { blockedUsers: updatedBlockedUsers });
      setBlockedUsers(updatedBlockedUsers);

      Alert.alert("Success", "User unblocked successfully.");
    } catch (error) {
      console.error("Error unblocking user:", error);
      Alert.alert("Error", "Could not unblock user.");
    }
  };

  const renderBlockedUser = ({ item }) => (
    <View style={styles.userRow}>
      <Text style={styles.userText}>{item}</Text>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => unblockUser(item)}
      >
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Blocked Users</Text>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#8e24aa" style={{ marginTop: 40 }} />
      ) : blockedUsers.length === 0 ? (
        <Text style={styles.noBlockedText}>You have no blocked users.</Text>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item}
          renderItem={renderBlockedUser}
          contentContainerStyle={{ paddingVertical: 20 }}
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
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 30,
  },
  noBlockedText: {
    color: "#bbb",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2B2D31",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  unblockButton: {
    backgroundColor: "#8e24aa",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  unblockButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default BlockedUsers;

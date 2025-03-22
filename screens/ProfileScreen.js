import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }, [])
  );

  if (loading || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e24aa" />
      </View>
    );
  }

  const {
    fullName,
    username,
    profilePicture,
    followers = [],
    following = [],
    challenges = 0,
    calories = 0,
    workouts = 0,
    showcasedGoals = [],
  } = userData;

  return (
    <ScrollView style={styles.container}>
      {/* Header with back and settings */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: profilePicture || "https://via.placeholder.com/100" }}
          style={styles.profileImage}
        />
        <Text style={styles.fullName}>{fullName}</Text>
        <Text style={styles.username}>@{username || "no-username"}</Text>

        <View style={styles.countContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FriendsList", { type: "followers" })
            }
          >
            <Text style={styles.countNumber}>{followers.length}</Text>
            <Text style={styles.countLabel}>Followers</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>|</Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FriendsList", { type: "following" })
            }
          >
            <Text style={styles.countNumber}>{following.length}</Text>
            <Text style={styles.countLabel}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rank */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rank</Text>
        <Text style={styles.sectionContent}>Prestige 0 - Rookie</Text>
      </View>

      {/* Career Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Career Stats</Text>
        <View style={styles.statBox}>
          <View style={styles.statItem}>
            <Ionicons
              name="trophy-outline"
              size={22}
              color="#fff"
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{challenges}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="flame-outline"
              size={22}
              color="#fff"
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="barbell-outline"
              size={22}
              color="#fff"
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>
      </View>

      {/* My Goals */}
      <View style={styles.section}>
        <View style={styles.goalsHeader}>
          <Text style={styles.sectionTitle}>My Goals</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Goals")}>
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {showcasedGoals.length === 0 ? (
          <Text style={styles.emptyText}>No goals showcased.</Text>
        ) : (
          showcasedGoals.map((goal, index) => (
            <Text key={index} style={styles.sectionContent}>
              • {goal.text}
            </Text>
          ))
        )}
      </View>

      {/* My Posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Posts</Text>
        <Text style={styles.emptyText}>No posts yet.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131417",
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#131417",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 10,
    paddingHorizontal: 5,
  },

  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },

  fullName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  username: {
    color: "#aaa",
    fontSize: 15,
    fontStyle: "italic",
    marginTop: 2,
  },

  countContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  countNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },

  countLabel: {
    color: "#aaa",
    fontSize: 15 ,
    textAlign: "center",
  },

  separator: {
    marginHorizontal: 16,
    color: "#555",
    fontSize: 18,
  },

  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  sectionContent: {
    color: "#ccc",
    fontSize: 15,
    marginLeft: 5,
    marginBottom: 2,
  },
  goalsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
    marginTop: 5,
  },

  statBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#2B2D31",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  statItem: {
    alignItems: "center",
    flex: 1,
  },

  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 2,
  },
  statIcon: {
    marginBottom: 6,
  },
});

export default ProfileScreen;

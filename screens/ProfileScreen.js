import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredGoals, setFeaturedGoals] = useState([]);
  const [userPosts, setUserPosts] = useState([]);

  const screenWidth = Dimensions.get("window").width;
  const imageSize = Math.floor((screenWidth - 40 - 8) / 3);

  useFocusEffect(
    useCallback(() => {
      const unsubscribeUser = onSnapshot(
        doc(db, "users", currentUser.uid),
        (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
        }
      );

      const unsubscribePosts = onSnapshot(
        query(
          collection(db, "posts"),
          where("userId", "==", currentUser.uid),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => {
          const posts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserPosts(posts);
        }
      );

      const fetchFeaturedGoals = async () => {
        try {
          const q = query(
            collection(db, "goals"),
            where("displayFeatured", "==", true),
            where("userId", "==", currentUser.uid)
          );
          const snapshot = await getDocs(q);
          setFeaturedGoals(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } catch (err) {
          console.error("Failed to fetch featured goals:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchFeaturedGoals();

      return () => {
        unsubscribeUser();
        unsubscribePosts();
      };
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
  } = userData;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rank</Text>
        <Text style={styles.sectionContent}>Prestige 0 - Rookie</Text>
      </View>

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

      <View style={styles.section}>
        <View style={styles.goalsHeader}>
          <Text style={styles.sectionTitle}>Featured Goals</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Goals")}>
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {featuredGoals.length === 0 ? (
          <Text style={styles.emptyText}>No featured goals.</Text>
        ) : (
          featuredGoals.map((goal) => (
            <Text key={goal.id} style={styles.sectionContent}>
              • {goal.text}
            </Text>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Posts</Text>
        {userPosts.length === 0 ? (
          <Text style={styles.emptyText}>No posts yet.</Text>
        ) : (
          <View style={styles.postGrid}>
            {userPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                onPress={() =>
                  navigation.navigate("PostDetailScreen", { post })
                }
                style={styles.postWrapper}
              >
                <Image
                  source={{ uri: post.imageUrl }}
                  style={styles.postThumbnail}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#131417", paddingHorizontal: 20 },
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
  },
  profileSection: { alignItems: "center", marginVertical: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  fullName: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  username: { color: "#aaa", fontSize: 14 },
  countContainer: { flexDirection: "row", marginTop: 12, alignItems: "center" },
  countNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  countLabel: { color: "#aaa", fontSize: 14, textAlign: "center" },
  separator: { marginHorizontal: 16, color: "#555", fontSize: 18 },
  section: { marginVertical: 15 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  sectionContent: { color: "#ccc", fontSize: 15, marginBottom: 4 },
  emptyText: { color: "#888", fontStyle: "italic", marginTop: 5 },
  postGrid: { flexDirection: "row", flexWrap: "wrap" },
  postWrapper: {
    width: (Dimensions.get("window").width - 40 - 8) / 3,
    aspectRatio: 1,
    marginBottom: 4,
  },
  postThumbnail: { width: "100%", height: "100%", borderRadius: 6 },
  statBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#2B2D31",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statLabel: { color: "#aaa", fontSize: 13, marginTop: 2 },
  statIcon: { marginBottom: 6 },
  goalsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ProfileScreen;

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../authProvider";
import { LinearGradient } from "expo-linear-gradient";

const workoutIcons = {
  "Strength Training": "barbell",
  Cardio: "heart",
  Yoga: "leaf",
  Cycling: "bicycle",
  Swimming: "water",
  Hiking: "walk",
  Pilates: "medkit",
  Sports: "basketball",
  Other: "ellipsis-horizontal",
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  const postDate =
    timestamp instanceof Date ? timestamp : timestamp?.toDate?.() ?? new Date();
  const now = new Date();
  const diff = Math.floor((now - postDate) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
};

export default function FeedScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const db = getFirestore();
  const listRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return unsubscribe;
  }, [navigation]);

  const fetchBlockedUsers = async () => {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.exists() ? userDoc.data() : {};
    const blocked = data.blockedUsers || [];
    setBlockedUsers(blocked);
    return blocked;
  };

  const loadPosts = async () => {
    const blocked = await fetchBlockedUsers();
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.exists() ? userDoc.data() : {};
    const visible = Array.from(
      new Set([...(data.following || []), ...(data.followers || []), user.uid])
    );

    const snap = await getDocs(
      query(collection(db, "posts"), orderBy("timestamp", "desc"))
    );

    const posts = await Promise.all(
      snap.docs.map(async (docSnap) => {
        const postData = docSnap.data();
        const userDoc = await getDoc(doc(db, "users", postData.userId));
        const userData = userDoc.exists() ? userDoc.data() : {};
        return {
          id: docSnap.id,
          ...postData,
          username: userData.username || "user",
          profilePicture: userData.profilePicture || null,
          rank: userData.rank || "Rookie",
        };
      })
    );

    setPosts(
      posts.filter(
        (p) => visible.includes(p.userId) && !blocked.includes(p.userId)
      )
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const handleDelete = async (postId) => {
    Alert.alert("Delete Post", "Confirm delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "posts", postId));
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        },
      },
    ]);
  };

  const handleLike = async (post) => {
    const liked = post.likes?.includes(user.uid);
    const ref = doc(db, "posts", post.id);
    const newLikes = liked
      ? post.likes.filter((id) => id !== user.uid)
      : [...(post.likes || []), user.uid];
    await updateDoc(ref, { likes: newLikes });
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: newLikes } : p))
    );
  };

  const renderPost = ({ item }) => {
    const liked = item.likes?.includes(user.uid);
    const likeCount = item.likes?.length || 0;
    const displayLabel =
      item.workoutLabel || item.customWorkoutType || item.workoutType;
    const displayIcon = workoutIcons[item.workoutType] || "help-circle-outline";
    const isOwner = item.userId === user.uid;
    const timeAgo = getTimeAgo(item.timestamp);
    const wasEdited = item.lastUpdated?.toDate?.() > item.timestamp?.toDate?.();

    return (
      <View style={styles.card}>
        {/* Top Row: Profile Info */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() =>
              navigation.navigate(isOwner ? "ProfileScreen" : "OtherProfile", {
                userId: item.userId,
              })
            }
          >
            <Image
              source={{ uri: item.profilePicture }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.username}>@{item.username}</Text>
              <Text style={styles.rank}>{item.rank}</Text>
              <Text style={styles.time}>
                {timeAgo}
                {wasEdited ? " • Edited" : ""}
              </Text>
            </View>
          </TouchableOpacity>

          {isOwner && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Post Options", "", [
                  {
                    text: "Edit",
                    onPress: () =>
                      navigation.navigate("EditPostScreen", {
                        postId: item.id,
                      }),
                  },
                  {
                    text: "Delete",
                    onPress: () => handleDelete(item.id),
                    style: "destructive",
                  },
                  { text: "Cancel", style: "cancel" },
                ])
              }
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}

        {/* Workout Badge under description */}
        {displayLabel && (
          <View style={styles.workoutBadgeWrapper}>
            <LinearGradient
              colors={["#8e2de2", "#4a00e0"]}
              style={styles.badge}
            >
              <Ionicons
                name={displayIcon}
                size={14}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.badgeText}>{displayLabel}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Post Image */}
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item)}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "#e91e63" : "#aaa"}
            />
            <Text style={styles.actionText}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("CommentsScreen", { postId: item.id })
            }
          >
            <Ionicons name="chatbubble-outline" size={22} color="#aaa" />
            <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              const postLink = `https://fitvibe.app/post/${item.id}`; // Placeholder link
              Share.share({
                message: `💪 Check out @${
                  item.username
                }'s workout on FitVibe!\n${
                  item.description || ""
                }\n\nView it here: ${postLink}`,
              });
            }}
          >
            <Ionicons name="paper-plane-outline" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("AddPostsScreen")}>
          <Ionicons name="duplicate-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Posts</Text>
        <TouchableOpacity onPress={() => navigation.navigate("MessagesScreen")}>
          <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1a1a1a",
    marginBottom: 16,
    padding: 14,
    marginHorizontal: 12,
    borderRadius: 14,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  rank: {
    color: "#ccc",
    fontSize: 11,
  },
  time: {
    color: "#777",
    fontSize: 10,
  },
  description: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 320,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#222",
  },
  workoutBadgeWrapper: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#4a00e0",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: "#aaa",
    marginLeft: 6,
    fontSize: 13,
  },
});

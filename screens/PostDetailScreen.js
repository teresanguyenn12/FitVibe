import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { getFirestore, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useAuth } from "../authProvider";

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
  const postDate = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { post } = route.params || {};

  const db = getFirestore();
  const auth = getAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [authorData, setAuthorData] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", post.userId), (docSnap) => {
      if (docSnap.exists()) {
        setAuthorData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [post.userId]);

  const liked = likes.includes(user.uid);

  const toggleLike = async () => {
    const postRef = doc(db, "posts", post.id);
    const updatedLikes = liked
      ? likes.filter((id) => id !== user.uid)
      : [...likes, user.uid];
    try {
      await updateDoc(postRef, { likes: updatedLikes });
      setLikes(updatedLikes);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async () => {
    try {
      const message = `@${authorData?.username || "user"}'s workout: ${post.description || ""}`;
      await Share.share({
        message,
        url: post.imageUrl || undefined,
        title: `@${authorData?.username || "user"}'s workout on FitVibe`,
      });
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "posts", post.id));
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting post:", error);
          }
        },
      },
    ]);
  };

  const displayIcon = workoutIcons[post.workoutType] || "help-circle-outline";
  const displayLabel = post.workoutLabel || post.customWorkoutType || post.workoutType;
  const timeAgo = getTimeAgo(post.timestamp);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {user.uid === post.userId ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.userSection}>
          <Image
            source={{ uri: authorData?.profilePicture || "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>@{authorData?.username || "user"}</Text>
            <Text style={styles.rank}>🏅 Rookie</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>

        {post.description ? (
          <Text style={styles.description}>{post.description}</Text>
        ) : null}

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

        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "#e91e63" : "#aaa"}
            />
            <Text style={styles.actionText}>{likes.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("CommentsScreen", { postId: post.id })
            }
          >
            <Ionicons name="chatbubble-outline" size={22} color="#aaa" />
            <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="paper-plane-outline" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#131417" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  backButton: { padding: 10 },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 },
  userSection: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  userInfo: { flexDirection: "column" },
  username: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  rank: { color: "#aaa", fontSize: 13 },
  timeAgo: { color: "#777", fontSize: 11, marginTop: 2 },
  description: { color: "#ddd", fontSize: 15, marginBottom: 20 },
  workoutBadgeWrapper: { alignItems: "flex-end", marginBottom: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  postImage: {
    width: "100%",
    height: 400,
    borderRadius: 15,
    backgroundColor: "#333",
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: "#aaa",
    marginLeft: 5,
  },
});

export default PostDetailScreen;

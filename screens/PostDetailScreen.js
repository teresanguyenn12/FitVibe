// PostDetailScreen.js — Updated with private account restriction
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { getFirestore, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Video } from "expo-av";
import { useAuth } from "../authProvider";

const screenWidth = Dimensions.get("window").width;

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
  const diff = Math.floor((now - postDate) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
};

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { post } = route.params || {};

  const db = getFirestore();
  const [likes, setLikes] = useState(post.likes || []);
  const [authorData, setAuthorData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", post.userId), (docSnap) => {
      if (docSnap.exists()) {
        setAuthorData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [post.userId]);

  // Privacy Guard: block non-followers from seeing private posts
  useEffect(() => {
    if (
      authorData?.isPrivate &&
      !authorData.followers?.includes(user.uid) &&
      user.uid !== post.userId
    ) {
      Alert.alert(
        "Private Account",
        "This post belongs to a private account. Follow them to view it.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [authorData]);

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
        url: post.media?.[0]?.url || undefined,
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
    <View style={{ flex: 1, backgroundColor: "#1a1a1a" }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingTop: 50 }}>
        <View style={styles.card}>
          <View style={styles.postHeader}>
            <View style={styles.profileSection}>
              <Image source={{ uri: authorData?.profilePicture }} style={styles.avatar} />
              <View>
                <Text style={styles.username}>@{authorData?.username || "user"}</Text>
                <Text style={styles.rank}>🏅 Rookie</Text>
                <Text style={styles.time}>{timeAgo}</Text>
              </View>
            </View>

            {user.uid === post.userId && (
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {post.description && <Text style={styles.description}>{post.description}</Text>}

          {displayLabel && (
            <View style={styles.workoutBadgeWrapper}>
              <LinearGradient colors={["#8e2de2", "#4a00e0"]} style={styles.badge}>
                <Ionicons name={displayIcon} size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.badgeText}>{displayLabel}</Text>
              </LinearGradient>
            </View>
          )}

          {post.media?.length > 0 && (
            <View style={styles.mediaContainer}>
              <FlatList
                data={post.media}
                keyExtractor={(media, idx) => media.url + idx}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / screenWidth
                  );
                  setCurrentIndex(index);
                }}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                  <View style={[styles.mediaItemWrapper, { marginBottom: 5 }]}>
                    {item.type === "video" ? (
                      <Video
                        source={{ uri: item.url }}
                        useNativeControls
                        resizeMode="cover"
                        style={styles.postMedia}
                      />
                    ) : (
                      <Image
                        source={{ uri: item.url }}
                        style={styles.postMedia}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                )}
              />
              {post.media.length > 1 && (
                <View style={styles.dotRow}>
                  {post.media.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        { opacity: currentIndex === index ? 1 : 0.3 },
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
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
              onPress={() => navigation.navigate("CommentsScreen", { postId: post.id })}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#aaa" />
              <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={22} color="#aaa" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 100,
    padding: 8,
    borderRadius: 20,
  },
  card: {
    backgroundColor: "#1a1a1a",
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 50,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
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
    fontSize: 15,
    paddingHorizontal: 14,
    marginTop: -6,
    marginBottom: 4,
  },
  workoutBadgeWrapper: {
    alignItems: "flex-end",
    paddingHorizontal: 14,
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
  mediaContainer: {
    width: screenWidth,
    alignSelf: "center",
  },
  mediaItemWrapper: {
    width: screenWidth,
    aspectRatio: 1,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  postMedia: {
    width: "100%",
    height: "100%",
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 12,
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

export default PostDetailScreen;

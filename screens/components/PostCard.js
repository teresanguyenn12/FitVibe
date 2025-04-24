// components/PostCard.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Share,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import { useAuth } from "../../authProvider";

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

export default function PostCard({ item, handleLike, handleDelete }) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  if (!user) return null;

  const liked = item.likes?.includes(user.uid);
  const isOwner = item.userId === user.uid;
  const displayLabel =
    item.workoutLabel || item.customWorkoutType || item.workoutType;
  const displayIcon = workoutIcons[item.workoutType] || "help-circle-outline";
  const timeAgo = getTimeAgo(item.timestamp);
  const wasEdited = item.lastUpdated?.toDate?.() > item.timestamp?.toDate?.();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() =>
            navigation.navigate(isOwner ? "ProfileScreen" : "OtherProfile", {
              userId: item.userId,
            })
          }
        >
          <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
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
            onPress={() => {
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
      style: "destructive",
      onPress: () => {
        Alert.alert("Confirm Delete", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => handleDelete(item.id),
          },
        ]);
      },
    },
    { text: "Cancel", style: "cancel" },
  ]);
}}

          >
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      {/* Workout Type Badge */}
      {displayLabel && (
        <View style={styles.workoutBadgeWrapper}>
          <LinearGradient colors={["#8e2de2", "#4a00e0"]} style={styles.badge}>
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

      {/* Media */}
      {item.media?.length > 0 && (
  <View style={styles.mediaContainer}>
    <FlatList
      data={item.media}
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
      renderItem={({ item: mediaItem }) => (
        <View
  style={[
    styles.mediaItemWrapper,
    item.media.length === 1 && { marginBottom: 16 }, // ✅ Add spacing if only 1 media item
  ]}
>
          {mediaItem.type === "video" ? (
            <Video
              source={{ uri: mediaItem.url }}
              useNativeControls
              resizeMode="cover"
              style={styles.postMedia}
            />
          ) : (
            <Image
              source={{ uri: mediaItem.url }}
              style={styles.postMedia}
              resizeMode="cover"
            />
          )}
        </View>
      )}
    />
    {item.media.length > 1 && (
  <View style={styles.dotRow}>
    {item.media.map((_, index) => (
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

      {/* Actions */}
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
          <Text style={styles.actionText}>{item.likes?.length || 0}</Text>
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
            const postLink = `https://fitvibe.app/post/${item.id}`;
            Share.share({
              message: `💪 Check out @$
                {item.username}'s workout on FitVibe!\n$${
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
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    marginBottom: 16,
    marginHorizontal: 12,
    borderRadius: 14,
    overflow: "hidden",
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
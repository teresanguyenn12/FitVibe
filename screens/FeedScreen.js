// FeedScreen.js (Updated to show custom "Other" workout label and post age like Instagram)
import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
} from 'firebase/firestore';
import { useAuth } from '../authProvider';

const workoutIcons = {
  'Strength Training': 'barbell',
  Cardio: 'heart',
  Yoga: 'leaf',
  Cycling: 'bicycle',
  Swimming: 'water',
  Hiking: 'walk',
  Pilates: 'medkit',
  Sports: 'basketball',
  Other: 'ellipsis-horizontal',
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

const FeedScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const db = getFirestore();
  const [posts, setPosts] = useState([]);

  const loadPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      const postsWithUsernames = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const postData = docSnap.data();
          const userRef = doc(db, 'users', postData.userId);
          const userDoc = await getDoc(userRef);

          return {
            id: docSnap.id,
            ...postData,
            username: userDoc.exists() ? userDoc.data().username : 'user',
            profilePicture: userDoc.exists() ? userDoc.data().profilePicture : null,
          };
        })
      );

      setPosts(postsWithUsernames);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const handleDelete = (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'posts', postId));
            setPosts((prev) => prev.filter((p) => p.id !== postId));
          } catch (error) {
            console.error('Failed to delete:', error);
          }
        },
      },
    ]);
  };

  const handleLike = async (post) => {
    const postRef = doc(db, 'posts', post.id);
    const liked = post.likes?.includes(user.uid);

    try {
      const updatedLikes = liked
        ? post.likes.filter((id) => id !== user.uid)
        : [...(post.likes || []), user.uid];

      await updateDoc(postRef, {
        likes: updatedLikes,
      });

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, likes: updatedLikes } : p))
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleShare = async (item) => {
    try {
      const message = `@${item.username}'s workout: ${item.description || ''}`;
      await Share.share({
        message,
        url: item.image || undefined,
        title: `@${item.username}'s workout on FitVibe`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderPost = ({ item }) => {
    const liked = item.likes?.includes(user.uid);
    const likeCount = item.likes?.length || 0;
    const isOwner = item.userId === user.uid;

    const isOther = item.workoutType === 'Other';
    const displayLabel = isOther && item.customWorkoutType ? item.customWorkoutType : item.workoutType;
    const displayIcon = workoutIcons[item.workoutType] || 'help-circle-outline';
    const timeAgo = getTimeAgo(item.timestamp);

    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image
            source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>@{item.username}</Text>
            <Text style={styles.rank}>🏅 Rookie</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          {isOwner && (
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

        {displayLabel && (
          <View style={styles.workoutBadgeWrapper}>
            <LinearGradient colors={['#8e2de2', '#4a00e0']} style={styles.badge}>
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

        {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item)}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? '#e91e63' : '#aaa'}
            />
            <Text style={styles.actionText}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CommentsScreen', { postId: item.id })}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#aaa" />
            <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
            <Ionicons name="paper-plane-outline" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('AddPostsScreen')}>
          <Ionicons name="duplicate-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Feed</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MessagesScreen')}>
          <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 14,
    marginBottom: 22,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rank: {
    color: '#aaa',
    fontSize: 12,
  },
  timeAgo: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },
  description: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 10,
  },
  workoutBadgeWrapper: {
    alignItems: 'flex-end',
    marginBottom: 10,
    marginTop: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 400,
    borderRadius: 15,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#aaa',
    marginLeft: 5,
  },
});

export default FeedScreen;

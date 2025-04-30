// FeedScreen.js — Fully integrated with PostCard and upload logic
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Text,
  TouchableOpacity,
  StyleSheet,
  InteractionManager,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../authProvider";
import PostCard from "./components/PostCard";

export default function FeedScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();
  const listRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const route = useRoute();

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPosts = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const visible = Array.from(
        new Set([...(userData.following || []), ...(userData.followers || []), user.uid])
      );

      const snap = await getDocs(query(collection(db, "posts"), orderBy("timestamp", "desc")));

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
            isPrivate: userData.isPrivate || false,
            ownerFollowers: userData.followers || [], 
          };
        })
      );

      setPosts(
        posts.filter((p) => {
          if (p.userId === user.uid) return true;
          if (!p.isPrivate) return visible.includes(p.userId);
          return p.ownerFollowers.includes(user.uid);
        })
      );
    } catch (err) {
      console.error("Error fetching posts:", err);  //important to catch any problems
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();

      if (route?.params?.scrollToTop && listRef.current) {
        InteractionManager.runAfterInteractions(() => {
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
          navigation.setParams({ scrollToTop: false });
        });
      }

      // Handle post upload passed from AddPostScreen
      if (route?.params?.pendingPost && !uploading) {
        handleUpload(route.params.pendingPost);
        navigation.setParams({ pendingPost: null });
      }
    }, [route])
  );

  const handleUpload = async (postData) => {
    setUploading(true);
    try {
      InteractionManager.runAfterInteractions(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
  
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
  
      const uploadedUrls = [];
      for (let i = 0; i < postData.mediaItems.length; i++) {
        const media = postData.mediaItems[i];
        const response = await fetch(media.uri);
        const blob = await response.blob();
        const filename = `post_${user.uid}_${Date.now()}_${i}`;
        const storageRef = ref(storage, `post_uploads/${filename}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);
  
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = snapshot.bytesTransferred / snapshot.totalBytes;
              setUploadProgress((i + progress) / postData.mediaItems.length);
            },
            reject,
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push({ url, type: media.type });
              resolve();
            }
          );
        });
      }
  
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        fullName: userData.fullName || "Anonymous",
        username: userData.username || "anonymous",
        profilePicture: userData.profilePicture || "",
        description: postData.description,
        workoutType: postData.workoutType,
        workoutLabel: postData.workoutLabel,
        media: uploadedUrls,
        timestamp: serverTimestamp(),
        likes: [],
        comments: [],
      });
  
      fetchPosts();
    } catch (err) {
      Alert.alert("Upload Failed", "Something went wrong during upload.");
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  const handleDelete = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("AddPostsScreen")}>
          <Ionicons name="duplicate-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Posts</Text>
        <TouchableOpacity onPress={() => navigation.navigate("MessagesScreen")}>
          <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.uploadingBar}>
          <Text style={{ color: "#fff", fontSize: 14 }}>Uploading...</Text>
          <View style={styles.uploadProgressBackground}>
            <View style={[styles.uploadProgressBar, { width: `${uploadProgress * 100}%` }]} />
          </View>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            user={user}
            handleLike={handleLike}
            handleDelete={handleDelete}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#131417" },
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
  uploadingBar: {
    padding: 10,
    backgroundColor: "#222",
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadProgressBackground: {
    height: 8,
    backgroundColor: "#444",
    borderRadius: 4,
    marginTop: 6,
  },
  uploadProgressBar: {
    height: 8,
    backgroundColor: "#8e2de2",
    borderRadius: 4,
  },
});

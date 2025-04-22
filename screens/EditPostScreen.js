import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

const EditPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params;

  const db = getFirestore();

  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const data = postSnap.data();
          setDescription(data.description || "");
          setImageUrl(data.imageUrl || "");
        } else {
          Alert.alert("Post not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  const handleSave = async () => {
    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const currentDescription = postSnap.data().description || "";

        if (currentDescription.trim() === description.trim()) {
          Alert.alert("No changes to save.");
          return;
        }

        await updateDoc(postRef, {
          description: description.trim(),
          lastUpdated: new Date(), // mark it as edited
        });

        Alert.alert("Post updated!");
        navigation.goBack();
      } else {
        Alert.alert("Post not found");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      Alert.alert("Failed to update post.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Post</Text>
          <TouchableOpacity onPress={handleSave}>
            <Ionicons name="checkmark" size={28} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          multiline
          maxLength={500}
          value={description}
          onChangeText={setDescription}
          placeholder="Edit your caption..."
          placeholderTextColor="#888"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111",
  },
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#111",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#222",
  },
  label: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: "top",
  },
});

export default EditPostScreen;

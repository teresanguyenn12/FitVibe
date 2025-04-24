import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  ActionSheetIOS,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import * as VideoThumbnails from "expo-video-thumbnails";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Video, Audio } from "expo-av";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const workoutTypes = [
  { type: "Strength Training", icon: "weight-lifter" },
  { type: "Cardio", icon: "heart-pulse" },
  { type: "Yoga", icon: "yoga" },
  { type: "Cycling", icon: "bike" },
  { type: "Swimming", icon: "swim" },
  { type: "Hiking", icon: "hiking" },
  { type: "Other", icon: "dots-horizontal" },
];

export default function AddPostScreen() {
  const navigation = useNavigation();
  const [description, setDescription] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [customWorkout, setCustomWorkout] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const generateThumbnail = async (uri) => {
    try {
      const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(uri, {
        time: 1000,
      });
      return thumb;
    } catch (e) {
      return uri;
    }
  };

  const handleMediaOption = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Take Photo/Video", "Choose from Library"],
        cancelButtonIndex: 0,
      },
      (index) => {
        if (index === 1) handleTakePhoto();
        if (index === 2) handlePickMedia();
      }
    );
  };

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const selected = await Promise.all(
        result.assets.map(async (asset) => {
          const isVideo = asset.type.startsWith("video");
          return {
            uri: asset.uri,
            type: isVideo ? "video" : "image",
            thumb: isVideo ? await generateThumbnail(asset.uri) : asset.uri,
            key: asset.uri,
          };
        })
      );
      setMediaItems((prev) => [...prev, ...selected]);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const isVideo = asset.type.startsWith("video");
      const mediaItem = {
        uri: asset.uri,
        type: isVideo ? "video" : "image",
        thumb: isVideo ? await generateThumbnail(asset.uri) : asset.uri,
        key: asset.uri,
      };
      setMediaItems((prev) => [...prev, mediaItem]);
    }
  };

  const removeMedia = (index) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const postPayload = {
      description: description.trim(),
      workoutType: selectedWorkout === "Other" ? "Other" : selectedWorkout,
      workoutLabel:
        selectedWorkout === "Other" ? customWorkout.trim() : selectedWorkout,
      mediaItems,
      userId: user.uid,
    };
    setShowFinalPreview(false); 
    navigation.navigate("HomeTabs", {
      screen: "Feed",
      params: { pendingPost: postPayload },
    });
  };

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }) => {
      const index = getIndex?.();
      return (
        <GestureHandlerRootView style={{ marginRight: 10 }}>
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            activeOpacity={1}
          >
            <Image source={{ uri: item.thumb }} style={styles.mediaPreview} />
          </TouchableOpacity>
          <Ionicons
            name="reorder-three"
            size={20}
            color="#fff"
            style={styles.reorderIcon}
          />
          <TouchableOpacity
            onPress={() => removeMedia(index)}
            style={styles.removeBtn}
          >
            <Ionicons name="close-circle" size={22} color="#fff" />
          </TouchableOpacity>
        </GestureHandlerRootView>
      );
    },
    [mediaItems]
  );

  const handleFinalPreview = () => {
    if (
      !description.trim() ||
      !selectedWorkout ||
      (selectedWorkout === "Other" && !customWorkout.trim())
    ) {
      Alert.alert(
        "Missing Info",
        "Please complete all required fields before previewing."
      );
      return;
    }
    setShowFinalPreview(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Post</Text>
            <View style={{ width: 26 }} />
          </View>

          {/* Workout Picker */}
          <Text style={styles.label}>Pick Your Workout</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.workoutContainer}
          >
            {workoutTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.workoutButton,
                  selectedWorkout === item.type && styles.selectedWorkout,
                ]}
                onPress={() => setSelectedWorkout(item.type)}
              >
                <LinearGradient
                  colors={
                    selectedWorkout === item.type
                      ? ["#8e2de2", "#4a00e0"]
                      : ["#222", "#222"]
                  }
                  style={styles.iconCircle}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={selectedWorkout === item.type ? "#fff" : "#aaa"}
                  />
                </LinearGradient>
                <Text
                  style={[
                    styles.workoutText,
                    selectedWorkout === item.type && { color: "#fff" },
                  ]}
                >
                  {item.type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Custom Workout Input */}
          {selectedWorkout === "Other" && (
            <TextInput
              style={styles.customWorkoutInput}
              placeholder="Enter workout type"
              placeholderTextColor="#888"
              value={customWorkout}
              onChangeText={setCustomWorkout}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          )}

          {/* Description Input */}
          <View style={styles.descriptionHeader}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter a Description of Your Workout."
            placeholderTextColor="#888"
            multiline
            maxLength={500}
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={Keyboard.dismiss}
          />

          {/* Media Upload Box */}
          <Text style={styles.label}>Add Photo or Video</Text>
          <TouchableOpacity style={styles.imageBox} onPress={handleMediaOption}>
            <Ionicons name="add-circle-outline" size={36} color="#aaa" />
            <Text style={styles.addImageText}>Tap to upload</Text>
          </TouchableOpacity>

          {/* Media Preview List */}
          <DraggableFlatList
            horizontal
            data={mediaItems}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            onDragEnd={({ data }) => setMediaItems(data)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ marginBottom: 20 }}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.postButton}
            onPress={handleFinalPreview}
          >
            <LinearGradient
              colors={["#8e2de2", "#4a00e0"]}
              style={styles.gradient}
            >
              <Text style={styles.postButtonText}>Preview</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Preview Modal */}
        <Modal visible={showFinalPreview} animationType="slide">
          <ScrollView
            style={{ flex: 1, backgroundColor: "#000" }}
            contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "bold",
                marginLeft: 20,
                marginBottom: 10,
              }}
            >
              Review Your Post
            </Text>

            <View>
              <FlatList
                data={mediaItems}
                keyExtractor={(item) => item.key}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / Dimensions.get("window").width
                  );
                  setCurrentIndex(index);
                }}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                  <View
                    style={{
                      width: Dimensions.get("window").width,
                      paddingHorizontal: 20,
                    }}
                  >
                    {item.type === "video" ? (
                      <Video
                        source={{ uri: item.uri }}
                        useNativeControls
                        resizeMode="contain"
                        style={{ width: "100%", height: 280, borderRadius: 10 }}
                      />
                    ) : (
                      <Image
                        source={{ uri: item.uri }}
                        style={{ width: "100%", height: 280, borderRadius: 10 }}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                )}
              />
              {mediaItems.length > 1 && (
  <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
    {mediaItems.map((_, index) => (
      <View
        key={index}
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: currentIndex === index ? "#fff" : "#555",
          marginHorizontal: 4,
        }}
      />
    ))}
  </View>
)}

            </View>

            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
                Description
              </Text>
              <Text style={{ color: "#ccc", marginBottom: 15 }}>{description}</Text>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
                Workout Type
              </Text>
              <Text style={{ color: "#ccc" }}>
                {selectedWorkout === "Other" ? customWorkout : selectedWorkout}
              </Text>

              <View style={styles.reviewButtonContainer}>
                <TouchableOpacity
                  onPress={() => setShowFinalPreview(false)}
                  style={[styles.reviewButton, styles.editButton]}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <LinearGradient
                  colors={["#8e2de2", "#4a00e0"]}
                  style={[styles.reviewButton, { borderRadius: 30 }]}
                >
                  <TouchableOpacity onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit Post</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  scrollContainer: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  workoutContainer: { flexDirection: "row", paddingBottom: 10 },
  workoutButton: { alignItems: "center", marginRight: 14 },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  workoutText: { color: "#aaa", fontSize: 11, textAlign: "center", width: 70 },
  selectedWorkout: {},

  customWorkoutInput: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },

  descriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  charCount: { color: "#888", fontSize: 12 },

  input: {
    backgroundColor: "#222",
    color: "#fff",
    height: 120,
    padding: 15,
    borderRadius: 12,
    textAlignVertical: "top",
    marginBottom: 20,
  },

  imageBox: {
    backgroundColor: "#1b1b1b",
    borderRadius: 16,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  addImageText: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 6,
  },

  mediaPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  reorderIcon: {
    position: "absolute",
    bottom: 5,
    left: 5,
    opacity: 0.8,
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 2,
  },

  postButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 5,
    marginBottom: 50,
  },
  gradient: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 30,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  reviewButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    gap: 10,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 50,
  },
  editButton: {
    backgroundColor: "#444",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

import React, { useState } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { storage } from '../firebase'; // Make sure this path matches your project structure
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const workoutTypes = [
    { type: 'Strength Training', icon: 'weight-lifter' },
    { type: 'Cardio', icon: 'heart-pulse' },
    { type: 'Yoga', icon: 'yoga' },
    { type: 'Cycling', icon: 'bike' },
    { type: 'Swimming', icon: 'swim' },
    { type: 'Hiking', icon: 'hiking' },
    { type: 'Other', icon: 'dots-horizontal' },
];

const AddPostScreen = () => {
    const navigation = useNavigation();
    const [description, setDescription] = useState('');
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [customWorkout, setCustomWorkout] = useState('');
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const auth = getAuth();
    const db = getFirestore();

    const handleChoosePhoto = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Permission to access gallery is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3]
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImageToFirebase = async (uri) => {
        if (!uri) return null;

        // Convert URI to Blob
        const response = await fetch(uri);
        const blob = await response.blob();

        const user = auth.currentUser;
        // Create a unique filename
        const filename = `post_${user.uid}_${new Date().getTime()}`;
        const storageRef = ref(storage, `post_images/${filename}`);

        // Create upload task
        const uploadTask = uploadBytesResumable(storageRef, blob);

        // Return a promise that resolves with the download URL
        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Track upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.error("Upload failed:", error);
                    reject(error);
                },
                async () => {
                    // Upload completed successfully, get download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    const handlePost = async () => {
        if (!description.trim()) {
            Alert.alert('Missing Content', 'Please add a description for your post.');
            return;
        }

        if (!selectedWorkout) {
            Alert.alert('Missing Workout Type', 'Please select a workout type.');
            return;
        }

        if (selectedWorkout === 'Other' && !customWorkout.trim()) {
            Alert.alert('Missing Workout Name', 'Please enter a name for your custom workout.');
            return;
        }

        setUploading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'You must be logged in to post.');
                setUploading(false);
                return;
            }

            // Get user data
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Upload image if one is selected
            let imageUrl = '';
            if (image) {
                try {
                    imageUrl = await uploadImageToFirebase(image);
                } catch (error) {
                    console.error('Error uploading image:', error);
                    Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
                    setUploading(false);
                    return;
                }
            }

            // Prepare post data
            const postData = {
                userId: user.uid,
                fullName: userData.fullName || 'Anonymous',
                username: userData.username || 'anonymous',
                profilePicture: userData.profilePicture || '',
                description: description.trim(),
                workoutType: selectedWorkout === 'Other' ? 'Other' : selectedWorkout,
                workoutLabel: selectedWorkout === 'Other' ? customWorkout.trim() : selectedWorkout,
                imageUrl: imageUrl, // Store the Firebase Storage URL
                timestamp: serverTimestamp(),
                likes: [],
                comments: [],
            };

            // Add the post to Firestore
            await addDoc(collection(db, 'posts'), postData);

            // Show success message
            Alert.alert('Success', 'Your post has been shared!');

            // Reset form and navigate back
            setDescription('');
            setSelectedWorkout(null);
            setCustomWorkout('');
            setImage(null);
            setUploadProgress(0);
            Keyboard.dismiss();
            navigation.goBack();
        } catch (error) {
            console.error('Error posting:', error);
            Alert.alert('Error', 'Something went wrong while posting. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const isPostingDisabled = () => {
        if (uploading) return true;
        if (!description.trim()) return true;
        if (!selectedWorkout) return true;
        if (selectedWorkout === 'Other' && !customWorkout.trim()) return true;
        return false;
    };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Post</Text>
            <View style={{ width: 26 }} />
          </View>

          <Text style={styles.label}>Pick Your Workout</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workoutContainer}>
            {workoutTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[styles.workoutButton, selectedWorkout === item.type && styles.selectedWorkout]}
                onPress={() => setSelectedWorkout(item.type)}
              >
                <LinearGradient
                  colors={selectedWorkout === item.type ? ["#8e2de2", "#4a00e0"] : ["#222", "#222"]}
                  style={styles.iconCircle}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={selectedWorkout === item.type ? '#fff' : '#aaa'}
                  />
                </LinearGradient>
                <Text style={[styles.workoutText, selectedWorkout === item.type && { color: '#fff' }]}>{item.type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedWorkout === 'Other' && (
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

          <Text style={styles.label}>Add Photo</Text>
          <TouchableOpacity style={styles.imageBox} onPress={handleChoosePhoto}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <Ionicons name="add" size={40} color="#888" />
            )}
          </TouchableOpacity>

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

          <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={!selectedWorkout || !description}>
            <LinearGradient colors={["#8e2de2", "#4a00e0"]} style={styles.gradient}>
              <Text style={styles.postButtonText}>Post</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  workoutContainer: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  workoutButton: {
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  workoutText: {
    color: '#aaa',
    fontSize: 11,
    textAlign: 'center',
    width: 70,
  },
  selectedWorkout: {},
  customWorkoutInput: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },
  imageBox: {
    height: 180,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    height: 120,
    padding: 15,
    borderRadius: 12,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  charCount: {
    color: '#888',
    fontSize: 12,
  },
  postButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 30,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPostScreen;
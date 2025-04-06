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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

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

  const auth = getAuth();
  const db = getFirestore();

  const handleChoosePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const postData = {
      userId: user.uid,
      fullName: userData.fullName || 'Anonymous',
      username: userData.username || 'anonymous',
      profilePicture: userData.profilePicture || '',
      description: description.trim(),
      workoutType: selectedWorkout === 'Other' ? 'Other' : selectedWorkout,
      workoutLabel: selectedWorkout === 'Other' ? customWorkout : selectedWorkout,
      image: image || '',
      timestamp: serverTimestamp(),
      likes: [],
      comments: [],
    };

    try {
      await addDoc(collection(db, 'posts'), postData);
      Alert.alert('Success', 'Your post has been shared!');
      setDescription('');
      setSelectedWorkout(null);
      setCustomWorkout('');
      setImage(null);
      Keyboard.dismiss();
      navigation.goBack();
    } catch (error) {
      console.error('Error posting:', error);
      Alert.alert('Error', 'Something went wrong while posting.');
    }
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
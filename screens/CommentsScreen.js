import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../authProvider';

const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const diff = Math.floor((now - timestamp.toDate()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return 'Yesterday';
  return `${Math.floor(diff / 86400)} days ago`;
};

const CommentsScreen = () => {
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;

  const db = getFirestore();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!commentText.trim()) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    if (editingId) {
      const commentRef = doc(db, 'posts', postId, 'comments', editingId);
      await setDoc(commentRef, { text: commentText.trim() }, { merge: true });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: user.uid,
        fullName: userData.fullName || 'Anonymous',
        profilePicture: userData.profilePicture || null,
        text: commentText.trim(),
        timestamp: new Date(),
      });

      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: comments.length + 1,
      });
    }

    setCommentText('');
    Keyboard.dismiss(); // Always dismiss after sending
  };

  const handleOptions = (item) => {
    Alert.alert('Options', 'Choose an action', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Edit',
        onPress: () => {
          setEditingId(item.id);
          setCommentText(item.text);
        },
      },
      {
        text: 'Delete',
        onPress: async () => {
          await deleteDoc(doc(db, 'posts', postId, 'comments', item.id));
          await updateDoc(doc(db, 'posts', postId), {
            commentsCount: comments.length - 1,
          });
        },
        style: 'destructive',
      },
    ]);
  };

  const renderComment = ({ item }) => {
    const isOwner = item.userId === user.uid;

    return (
      <View style={styles.commentContainer}>
        <Image
          source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentTopRow}>
            <Text style={styles.commentName}>{item.fullName}</Text>
            {isOwner && (
              <TouchableOpacity onPress={() => handleOptions(item)}>
                <Ionicons name="ellipsis-vertical" size={18} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
          <Text style={styles.commentTime}>{getTimeAgo(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={80}
        >
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
            keyboardShouldPersistTaps="handled"
          />

          {/* Input Bar */}
          <View style={styles.footerContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={editingId ? 'Edit your comment...' : 'Add a comment...'}
                placeholderTextColor="#aaa"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                  <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#111',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: { padding: 5 },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
  },
  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentText: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 2,
  },
  commentTime: {
    fontSize: 11,
    color: '#777',
    marginTop: 6,
  },
  footerContainer: {
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingRight: 10,
  },
  sendButton: {
    backgroundColor: '#8e24aa',
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentsScreen;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';
import { getChallengeImage } from '../../utils/imageHelpers';

const ChallengeChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatroomId, participants } = route.params;

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const [challenge, setChallenge] = useState(route.params.challenge || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  // fetch challenge if not passed
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challenge && chatroomId) {
        const chatroomRef = doc(db, 'chatrooms', chatroomId);
        const chatroomSnap = await getDoc(chatroomRef);
        const chatroomData = chatroomSnap.data();

        if (chatroomData?.challengeId) {
          const challengeDoc = await getDoc(doc(db, 'challenges', chatroomData.challengeId));
          if (challengeDoc.exists()) {
            setChallenge({ id: challengeDoc.id, ...challengeDoc.data() });
          }
        }
      }
    };
    fetchChallenge();
  }, [chatroomId, challenge]);

  useEffect(() => {
    if (!chatroomId) return;
    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [chatroomId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text: inputText,
      timestamp: serverTimestamp(),
      type: 'text',
    });
    setInputText('');
  };

  const handleJoinChallenge = async () => {
    if (!challenge || !currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      activeChallenges: arrayUnion(challenge.id),
      [`challengeProgress.${challenge.id}`]: {
        distance: 0,
        duration: 0,
        joinedAt: serverTimestamp(),
      },
    });

    // Skip message, navigate directly to challenge progress screen
    switch (challenge.category) {
      case 'Run':
        navigation.navigate('RunChallengeProgressScreen', { challenge });
        break;
      case 'Walk':
        navigation.navigate('WalkChallengeProgressScreen', { challenge });
        break;
      case 'Yoga':
        navigation.navigate('YogaChallengeProgressScreen', { challenge });
        break;
      case 'Cycling':
        navigation.navigate('CyclingChallengeProgressScreen', { challenge });
        break;
      case 'Lifting':
        navigation.navigate('LiftingChallengeProgressScreen', { challenge });
        break;
      default:
        Alert.alert('Unknown Challenge Type', 'Unsupported challenge category.');
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUser.uid;
    return (
      <View style={[styles.messageBubble, isCurrentUser ? styles.sent : styles.received]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  const imageSource = getChallengeImage(challenge?.category);
  const displayNames = participants?.filter(p => p.id !== currentUser.uid).map(p => p.name).join(', ');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.participantText}>{displayNames || 'You'}</Text>
      </View>

      {challenge && (
        <View style={styles.challengeCard}>
          <Image source={imageSource} style={styles.challengeImage} />
          <View style={styles.challengeDetails}>
            <Text style={styles.challengeTitle}>{challenge?.name}</Text>
            <Text style={styles.challengeInfo}>Distance: {challenge?.distanceGoal || '-'}</Text>
            <Text style={styles.challengeInfo}>Duration: {challenge?.durationGoal || '-'}</Text>
            <Text style={styles.challengeInfo}>Reward: {challenge?.reward || '-'} XP</Text>
            <TouchableOpacity onPress={handleJoinChallenge} style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="arrow-up" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  backButton: { padding: 5, marginRight: 10 },
  participantText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  challengeCard: {
    backgroundColor: '#1e1e1e',
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  challengeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  challengeDetails: { padding: 15 },
  challengeTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  challengeInfo: { fontSize: 14, color: '#ccc', marginBottom: 3 },
  joinButton: {
    marginTop: 10,
    backgroundColor: '#9b59b6',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  sent: { backgroundColor: '#9b59b6', alignSelf: 'flex-end' },
  received: { backgroundColor: '#333', alignSelf: 'flex-start' },
  messageText: { color: '#fff', fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#9b59b6',
    borderRadius: 20,
    padding: 10,
  },
});

export default ChallengeChatScreen;

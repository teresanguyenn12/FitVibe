import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import ChallengeCard from './ChallengeCard';

const ChallengeChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { chatroomId, challenge, participants } = route.params || {};

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!chatroomId) return;
    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatroomId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !chatroomId || !currentUser) return;
    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text: inputText,
      timestamp: serverTimestamp(),
    });
    setInputText('');
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.right : styles.left]}>
        {!isCurrentUser && <Image source={{ uri: item.avatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />}
        <View style={[styles.messageBubble, isCurrentUser ? styles.purple : styles.gray]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <FlatList
          data={participants}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.participantBubble}>
              <Image source={{ uri: item.avatar || 'https://via.placeholder.com/40' }} style={styles.avatarSmall} />
              <Text style={styles.participantName}>{item.name}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {challenge && <ChallengeCard challenge={challenge} />}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Message..."
            placeholderTextColor="#aaa"
            value={inputText}
            onChangeText={setInputText}
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000',
  },
  backButton: {
    marginRight: 10,
  },
  participantBubble: {
    marginRight: 10,
    alignItems: 'center',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  participantName: {
    color: '#fff',
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 15,
  },
  purple: {
    backgroundColor: '#A0006D',
  },
  gray: {
    backgroundColor: '#333',
  },
  messageText: {
    color: '#fff',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
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
    borderRadius: 20,
    color: '#fff',
    paddingHorizontal: 15,
    height: 40,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#A0006D',
    padding: 10,
    borderRadius: 20,
  },
});

export default ChallengeChatScreen;

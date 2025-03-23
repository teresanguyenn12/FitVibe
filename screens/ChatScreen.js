import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity,
    KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocs, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { chatroomId } = route.params;

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
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(fetchedMessages);
        });

        return () => unsubscribe();
    }, [chatroomId]);

    const sendMessage = async () => {
        if (!inputText.trim()) return;
        try {
            const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
            await addDoc(messagesRef, {
                senderId: currentUser.uid,
                text: inputText,
                timestamp: serverTimestamp()
            });

            // Update chatroom's lastMessage field
            const chatroomRef = doc(db, 'chatrooms', chatroomId);
            await updateDoc(chatroomRef, {
                lastMessage: inputText,
                lastMessageTime: serverTimestamp(),
            });

            setInputText('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };


    useFocusEffect(
        useCallback(() => {
            return async () => {
                try {
                    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
                    const messagesSnapshot = await getDocs(messagesRef);

                    if (messagesSnapshot.empty) {
                        const chatroomRef = doc(db, 'chatrooms', chatroomId);
                        await deleteDoc(chatroomRef);
                        console.log('Chatroom deleted due to inactivity.');
                    }

                } catch (error) {
                    console.error('Error deleting empty chatroom:', error);
                }
            };
        }, [chatroomId])
    );


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Chat</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.messageBubble,
                            item.senderId === currentUser.uid ? styles.sent : styles.received
                        ]}>
                            <Text style={styles.messageText}>{item.text}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        
    },
    backButton: {
        padding: 5,
        marginRight: 15
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginRight: 30
    },
    messageBubble: {
        padding: 10,
        borderRadius: 10,
        margin: 5,
        
        maxWidth: '75%',
        alignSelf: 'flex-start'
    },
    sent: {
        backgroundColor: 'purple',
        alignSelf: 'flex-end'
    },
    received: {
        backgroundColor: '#333'
    },
    messageText: {
        color: '#fff'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 25,
    },
    input: {
        flex: 1,
        color: '#fff',
        paddingHorizontal: 15,
        backgroundColor: '#333',
        borderRadius: 25,
        height: 40
    },
    sendButton: {
        marginLeft: 10,
        padding: 10,
        backgroundColor: 'purple',
        borderRadius: 20
    }
});

export default ChatScreen;

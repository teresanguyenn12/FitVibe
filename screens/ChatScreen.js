import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity, Image,
    KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView,
    ActivityIndicator, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocs, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../firebase'; // Make sure this path matches your project structure
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { chatroomId } = route.params;

    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);

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

    // Request permissions when component mounts
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images!');
            }
        })();
    }, []);

    const uploadImageToFirebase = async (uri) => {
        if (!uri) return null;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Convert URI to Blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create a unique filename
            const filename = `chat_${chatroomId}_${currentUser.uid}_${new Date().getTime()}`;
            const storageRef = ref(storage, `chat_images/${filename}`);

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
                        setIsUploading(false);
                        reject(error);
                    },
                    async () => {
                        // Upload completed successfully, get download URL
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setIsUploading(false);
                        resolve(downloadURL);
                    }
                );
            });
        } catch (error) {
            console.error("Error preparing upload:", error);
            setIsUploading(false);
            throw error;
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
                aspect: [4, 3]
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                sendImageMessage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to select image");
        }
    };

    const sendImageMessage = async (imageUri) => {
        try {
            const imageUrl = await uploadImageToFirebase(imageUri);

            const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
            await addDoc(messagesRef, {
                senderId: currentUser.uid,
                imageUrl: imageUrl,
                timestamp: serverTimestamp(),
                type: 'image'
            });

            // Update chatroom's lastMessage field
            const chatroomRef = doc(db, 'chatrooms', chatroomId);
            await updateDoc(chatroomRef, {
                lastMessage: 'Image',
                lastMessageTime: serverTimestamp(),
            });

            setSelectedImage(null);
        } catch (error) {
            console.error('Error sending image message:', error);
            Alert.alert("Error", "Failed to send image");
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;
        try {
            const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
            await addDoc(messagesRef, {
                senderId: currentUser.uid,
                text: inputText,
                timestamp: serverTimestamp(),
                type: 'text'
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

    const renderMessage = ({ item }) => {
        const isCurrentUser = item.senderId === currentUser.uid;

        if (item.type === 'image') {
            return (
                <TouchableOpacity
                    style={[
                        styles.messageBubble,
                        isCurrentUser ? styles.sent : styles.received,
                        styles.imageBubble
                    ]}
                    onPress={() => setViewingImage(item.imageUrl)}
                >
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.messageImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            );
        }

        return (
            <View style={[
                styles.messageBubble,
                isCurrentUser ? styles.sent : styles.received
            ]}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

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
                {messages.length === 0 ? (
                    <View style={styles.emptyChat}>
                        <Text style={styles.emptyChatText}>No messages yet. Start a conversation!</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={{ paddingVertical: 20 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}

                {isUploading && (
                    <View style={styles.uploadingContainer}>
                        <View style={styles.uploadingContent}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.uploadingText}>Uploading image... {Math.round(uploadProgress)}%</Text>
                        </View>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.imageButton} disabled={isUploading}>
                        <Ionicons name="image" size={24} color="#fff" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                    />

                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={!inputText.trim() || isUploading}>
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Image Preview Modal */}
            <Modal
                visible={viewingImage !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewingImage(null)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeModalButton}
                        onPress={() => setViewingImage(null)}
                    >
                        <Ionicons name="close-circle" size={32} color="#fff" />
                    </TouchableOpacity>

                    {viewingImage && (
                        <Image
                            source={{ uri: viewingImage }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
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
    emptyChat: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyChatText: {
        color: '#777',
        fontSize: 16,
        textAlign: 'center',
    },
    messageBubble: {
        padding: 10,
        borderRadius: 18,
        margin: 5,
        maxWidth: '75%',
        alignSelf: 'flex-start'
    },
    imageBubble: {
        padding: 6,
        overflow: 'hidden',
    },
    sent: {
        backgroundColor: 'purple',
        alignSelf: 'flex-end'
    },
    received: {
        backgroundColor: '#333'
    },
    messageText: {
        color: '#fff',
        fontSize: 16,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#333',
    },
    imageButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#444',
        marginRight: 10,
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
    },
    uploadingContainer: {
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 20,
    },
    uploadingText: {
        color: '#fff',
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
    },
    closeModalButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
});

export default ChatScreen;
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchUserById } from '../api/addFriendsApi';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const NewMessageScreen = () => {
    const navigation = useNavigation();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    useFocusEffect(
        useCallback(() => {
            console.log("Fetching available users...");
            const timeout = setTimeout(fetchAvailableUsers, 100); 

            return () => clearTimeout(timeout); // Cleanup function
        }, [])
    );



    const fetchAvailableUsers = async () => {
        try {
            setLoading(true);

            // Get current user's following list
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();
            const followingIds = userData?.following || [];

            if (followingIds.length === 0) {
                setList([]);
                setLoading(false);
                return;
            }

            // Get all chatrooms where current user is a participant
            const chatroomsRef = collection(db, 'chatrooms');
            const chatroomsQuery = query(
                chatroomsRef,
                where('participants', 'array-contains', currentUser.uid),
                where('type', '==', 'private')
            );

            const chatroomsSnapshot = await getDocs(chatroomsQuery);

            // Create a set of user IDs who already have a chatroom with the current user
            const existingChatUsers = new Set();
            chatroomsSnapshot.forEach(doc => {
                const chatroom = doc.data();
                chatroom.participants.forEach(participantId => {
                    if (participantId !== currentUser.uid) {
                        existingChatUsers.add(participantId);
                    }
                });
            });

            // Filter following list to only include users without existing chatrooms
            const availableUsers = [];
            for (const id of followingIds) {
                if (!existingChatUsers.has(id)) {
                    const friendDoc = await fetchUserById(id);
                    if (friendDoc) {
                        availableUsers.push(friendDoc);
                    }
                }
            }

            setList(availableUsers);
        } catch (error) {
            console.error('Failed to load available users:', error);
            Alert.alert('Error', 'Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const createChatroom = async (otherUserId) => {
        try {
            // Get user details for both participants
            const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
            const otherUserData = otherUserDoc.data();
            const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const currentUserData = currentUserDoc.data();

            // Create a new chatroom
            const chatroomsRef = collection(db, 'chatrooms');
            const newChatroomRef = await addDoc(chatroomsRef, {
                participants: [currentUser.uid, otherUserId],
                participantDetails: {
                    [currentUser.uid]: {
                        name: currentUserData.fullName,
                        profilePicture: currentUserData.profilePicture || null
                    },
                    [otherUserId]: {
                        name: otherUserData.fullName,
                        profilePicture: otherUserData.profilePicture || null
                    }
                },
                type: 'private',
                lastMessage: null,
                lastMessageTime: serverTimestamp(),
                createdAt: serverTimestamp()
            });

            // Navigate to the new chatroom
            navigation.navigate('ChatScreen', {
                chatroomId: newChatroomRef.id,
                otherUserName: otherUserData.fullName,
                otherUserId: otherUserId
            });

            // Remove this user from the list
            setList(prevList => prevList.filter(user => user.id !== otherUserId));

        } catch (error) {
            console.error('Error creating chatroom:', error);
            Alert.alert('Error', 'Failed to create chat. Please try again.');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => createChatroom(item.id)}
        >
            <Image
                source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.handle}>@{item.username || item.email?.split('@')[0]}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>New Message</Text>
            </View>

            {/* Following List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="purple" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : list.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="chatbubble-ellipses-outline" size={40} color="#666" />
                    <Text style={styles.emptyText}>No new people to message.</Text>
                    <Text style={styles.emptySubText}>You're already chatting with everyone you follow.</Text>
                </View>
            ) : (
                <FlatList
                    data={list}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                />
            )}
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
        
        justifyContent: 'flex-start'
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
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20
    },
    emptySubText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        color: '#fff',
        fontSize: 16,
    },
    handle: {
        color: '#888',
        fontSize: 14,
    },
});

export default NewMessageScreen;
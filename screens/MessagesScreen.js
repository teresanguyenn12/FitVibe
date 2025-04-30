import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity, Image,
    StyleSheet, SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../authProvider";
import {
    getFirestore, collection, query, where, getDocs,
    doc, getDoc, deleteDoc
} from 'firebase/firestore';
import { Swipeable } from 'react-native-gesture-handler';

const MessagesScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [chatUsers, setChatUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchChatUsers();
        }, [])
    );

    const fetchChatUsers = async () => {
        try {
            setLoading(true);
            const db = getFirestore();

            // Get current user's following/followers data for reference
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            const following = new Set(userData?.following || []);
            const followers = new Set(userData?.followers || []);

            // Query all chatrooms where the current user is a participant
            const chatroomsRef = collection(db, 'chatrooms');
            const chatroomsQuery = query(chatroomsRef, where('participantDetails.' + user.uid, '!=', null));
            const chatroomsSnapshot = await getDocs(chatroomsQuery);

            const usersMap = new Map();

            for (const chatroomDoc of chatroomsSnapshot.docs) {
                const chatroomData = chatroomDoc.data();
                const participantIds = Object.keys(chatroomData.participantDetails || {});
                const isGroup = participantIds.length > 2;

                if (isGroup) {
                    // Handle group chats as before
                    const names = participantIds
                        .filter(id => id !== user.uid)
                        .map(id => chatroomData.participantDetails[id]?.name || "Unknown")
                        .join(', ');

                    usersMap.set(chatroomDoc.id, {
                        id: chatroomDoc.id,
                        isGroup: true,
                        title: names,
                        lastMessage: chatroomData.lastMessage || 'Group Challenge',
                        participantDetails: chatroomData.participantDetails,
                        challenge: chatroomData.challenge || null,
                        lastMessageTime: chatroomData.lastMessageTime || null
                    });
                } else {
                    // For one-on-one chats, include all chats regardless of follow status
                    const otherUserId = participantIds.find(id => id !== user.uid);

                    if (otherUserId) {
                        // Get the other user's data
                        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));

                        if (otherUserDoc.exists()) {
                            const otherUserData = otherUserDoc.data();

                            // Determine follow status
                            const youFollowThem = following.has(otherUserId);
                            const theyFollowYou = followers.has(otherUserId);
                            const followStatus = {
                                youFollowThem,
                                theyFollowYou,
                                isMutual: youFollowThem && theyFollowYou
                            };

                            usersMap.set(chatroomDoc.id, {
                                id: chatroomDoc.id,
                                isGroup: false,
                                otherUserId,
                                ...otherUserData,
                                followStatus,
                                lastMessage: chatroomData.lastMessage || '',
                                lastMessageTime: chatroomData.lastMessageTime || null
                            });
                        }
                    }
                }
            }

            // Convert map to array and sort by last message time (if available)
            const chatUsersArray = Array.from(usersMap.values());
            chatUsersArray.sort((a, b) => {
                const timeA = a.lastMessageTime ? a.lastMessageTime.toDate().getTime() : 0;
                const timeB = b.lastMessageTime ? b.lastMessageTime.toDate().getTime() : 0;
                return timeB - timeA; // Sort in descending order (newest first)
            });

            setChatUsers(chatUsersArray);
        } catch (error) {
            console.error('Error fetching chat users:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteChatroom = async (chatroomId) => {
        try {
            const db = getFirestore();
            await deleteDoc(doc(db, 'chatrooms', chatroomId));
            setChatUsers(prev => prev.filter(user => user.id !== chatroomId));
        } catch (error) {
            console.error('Error deleting chatroom:', error);
        }
    };

    const confirmDelete = (chatroomId) => {
        Alert.alert(
            "Delete Chat",
            "Are you sure you want to delete this chat?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => deleteChatroom(chatroomId), style: "destructive" }
            ]
        );
    };

    const filteredUsers = chatUsers.filter(user => {
        if (user.isGroup) return user.title.toLowerCase().includes(search.toLowerCase());
        return user.fullName?.toLowerCase().includes(search.toLowerCase());
    });

    const renderItem = ({ item }) => {
        return (
            <Swipeable
                renderRightActions={() => (
                    <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
                        <Ionicons name="trash" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
            >
                <TouchableOpacity
                    style={styles.userItem}
                    onPress={() => navigation.navigate(item.isGroup ? 'ChallengeChatScreen' : 'ChatScreen', {
                        chatroomId: item.id,
                        ...(item.isGroup ? { challenge: item.challenge } : { otherUserId: item.otherUserId })
                    })}
                >
                    <Image
                        source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.name}>{item.isGroup ? item.title : item.fullName}</Text>
                        <Text style={styles.handle}>{item.lastMessage || '@' + (item.username || item.email?.split('@')[0])}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Messages</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("NewMessageScreen")}>
                    <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search"
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="purple" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
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
        justifyContent: 'space-between'
    },
    backButton: {
        padding: 5,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        padding: 10,
        margin: 10,
        borderRadius: 10
    },
    searchIcon: {
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        color: '#fff'
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15
    },
    userInfo: {
        flex: 1
    },
    name: {
        color: '#fff',
        fontSize: 16
    },
    handle: {
        color: '#888'
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        marginVertical: 5,
        borderRadius: 10
    }
});

export default MessagesScreen;

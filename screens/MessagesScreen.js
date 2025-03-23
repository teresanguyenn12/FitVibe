import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity, Image,
    StyleSheet, SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../authProvider";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
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
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            const followingIds = new Set(userData?.following || []);

            const chatroomsRef = collection(db, 'chatrooms');
            const chatroomsQuery = query(chatroomsRef, where('participants', 'array-contains', user.uid));
            const chatroomsSnapshot = await getDocs(chatroomsQuery);

            const usersMap = new Map();
            for (const chatroomDoc of chatroomsSnapshot.docs) {
                const chatroomData = chatroomDoc.data();
                const otherUserId = chatroomData.participants.find(id => id !== user.uid);

                if (followingIds.has(otherUserId) && !usersMap.has(otherUserId)) {
                    const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
                    if (otherUserDoc.exists()) {
                        usersMap.set(otherUserId, { id: chatroomDoc.id, otherUserId, ...otherUserDoc.data() });
                    }
                }
            }
            setChatUsers(Array.from(usersMap.values()));
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
            setChatUsers(prevUsers => prevUsers.filter(user => user.id !== chatroomId));
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

    const filteredUsers = chatUsers.filter(user =>
        user.fullName.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <Swipeable
            renderRightActions={() => (
                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
                    <Ionicons name="trash" size={24} color="#fff" />
                </TouchableOpacity>
            )}
        >
            <TouchableOpacity
                style={styles.userItem}
                onPress={() => navigation.navigate('ChatScreen', { chatroomId: item.id, otherUserId: item.otherUserId })}
            >
                <Image source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.name}>{item.fullName}</Text>
                    <Text style={styles.handle}>@{item.username || item.email?.split('@')[0]}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
        </Swipeable>
    );

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

// Fully Updated FriendsScreen.js with private-account-aware follow logic

import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity, Image,
    StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../authProvider";
import { fetchUserFriends, unfollowUser, followUser } from "../api/addFriendsApi";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const FriendsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const db = getFirestore();
    const [friends, setFriends] = useState([]);
    const [search, setSearch] = useState('');
    const [following, setFollowing] = useState({});
    const [requested, setRequested] = useState({});

    const loadFriends = async () => {
        if (user) {
            const friendsList = await fetchUserFriends();
            setFriends(friendsList);

            const followingMap = {};
            const requestedMap = {};

            const currentUserDoc = await getDoc(doc(db, "users", user.uid));
            const currentUserData = currentUserDoc.data();
            const currentFollowing = currentUserData.following || [];

            friendsList.forEach(friend => {
                followingMap[friend.id] = currentFollowing.includes(friend.id);
                requestedMap[friend.id] = friend.pendingRequests?.includes(user.uid) || false;
            });

            setFollowing(followingMap);
            setRequested(requestedMap);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFriends();
        }, [])
    );

    const handleFollowToggle = async (targetId, isFollowing, isRequested) => {
        try {
            const currentUserRef = doc(db, "users", user.uid);
            const otherUserRef = doc(db, "users", targetId);

            if (isFollowing) {
                await updateDoc(currentUserRef, { following: arrayRemove(targetId) });
                await updateDoc(otherUserRef, { followers: arrayRemove(user.uid) });
            } else if (isRequested) {
                await updateDoc(otherUserRef, { pendingRequests: arrayRemove(user.uid) });
            } else {
                const otherDoc = await getDoc(otherUserRef);
                if (otherDoc.exists() && otherDoc.data().isPrivate) {
                    await updateDoc(otherUserRef, { pendingRequests: arrayUnion(user.uid) });
                    setRequested(prev => ({ ...prev, [targetId]: true }));
                } else {
                    await updateDoc(currentUserRef, { following: arrayUnion(targetId) });
                    await updateDoc(otherUserRef, { followers: arrayUnion(user.uid) });
                    setFollowing(prev => ({ ...prev, [targetId]: true }));
                }
            }
            loadFriends();
        } catch (error) {
            Alert.alert('Error', 'Failed to update follow status');
            console.error(error);
        }
    };

    const filteredFriends = friends.filter(friend =>
        (friend.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (friend.email?.toLowerCase() || '').includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Friends</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddFriendsScreen")}>
                    <Ionicons name="person-add" size={24} color="#fff" />
                    <Text style={styles.addText}>Add Friends</Text>
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

            <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isFollowing = following[item.id];
                    const isRequested = requested[item.id];
                    return (
                        <View style={styles.userItem}>
                            <Image
                                source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                                style={styles.avatar}
                            />
                            <View style={styles.userInfo}>
                                <Text style={styles.name}>{item.fullName}</Text>
                                <Text style={styles.handle}>@{item.email?.split('@')[0]}</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.followButton,
                                    isFollowing
                                        ? styles.followingButton
                                        : isRequested
                                        ? styles.requestedButton
                                        : styles.notFollowingButton
                                ]}
                                onPress={() => handleFollowToggle(item.id, isFollowing, isRequested)}
                            >
                                <Text style={styles.followText}>
                                    {isFollowing ? 'Following' : isRequested ? 'Requested' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
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
    addText: {
        color: '#fff',
        marginLeft: 5
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
    followButton: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 10
    },
    followingButton: {
        backgroundColor: 'purple'
    },
    notFollowingButton: {
        backgroundColor: 'gray'
    },
    requestedButton: {
        backgroundColor: '#555'
    },
    followText: {
        color: '#fff',
        fontWeight: 'bold'
    },
});

export default FriendsScreen;

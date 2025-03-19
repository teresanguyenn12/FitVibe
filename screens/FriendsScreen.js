import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity, Image,
    StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../authProvider";
import { fetchUserFriends, unfollowUser, followUser } from "../api/addFriendsApi";

const FriendsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [friends, setFriends] = useState([]);
    const [search, setSearch] = useState('');
    const [following, setFollowing] = useState({});

    // Function to load friends
    const loadFriends = async () => {
        if (user) {
            const friendsList = await fetchUserFriends();
            setFriends(friendsList);

            // Create a map of following status
            const followingMap = {};
            friendsList.forEach(friend => {
                followingMap[friend.id] = true;
            });
            setFollowing(followingMap);
        }
    };

    // Automatically refresh when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadFriends();
        }, [])
    );

    const handleFollow = async (userId) => {
        try {
            await followUser(userId);
            setFollowing(prev => ({
                ...prev,
                [userId]: true
            }));

            // Add new friend to the list instantly
            const newFriend = { id: userId, fullName: "New Friend", email: "newfriend@example.com", profilePicture: "" };
            setFriends(prevFriends => [...prevFriends, newFriend]);

        } catch (error) {
            Alert.alert('Error', 'Failed to follow user');
            console.error('Follow error:', error);
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await unfollowUser(userId);
            setFollowing(prev => ({
                ...prev,
                [userId]: false
            }));

            // Remove friend instantly
            setFriends(prevFriends => prevFriends.filter(friend => friend.id !== userId));
        } catch (error) {
            Alert.alert('Error', 'Failed to unfollow user');
            console.error('Unfollow error:', error);
        }
    };

    // Filter friends based on search input
    const filteredFriends = friends.filter(friend =>
        (friend.fullName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (friend.email?.toLowerCase() || "").includes(search.toLowerCase())
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
                renderItem={({ item }) => (
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
                                following[item.id] ? styles.followingButton : styles.notFollowingButton
                            ]}
                            onPress={() => following[item.id] ? handleUnfollow(item.id) : handleFollow(item.id)}
                        >
                            <Text style={styles.followText}>
                                {following[item.id] ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    followText: {
        color: '#fff',
        fontWeight: 'bold'
    },
});

export default FriendsScreen;

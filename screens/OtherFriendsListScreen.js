import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
    followUser,
    unfollowUser,
    fetchUserById,
} from '../api/addFriendsApi';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const OtherFriendsListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId, type = 'followers' } = route.params || {};

    const [activeTab, setActiveTab] = useState(type);
    const [list, setList] = useState([]);
    const [followingMap, setFollowingMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [profileOwner, setProfileOwner] = useState(null);

    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    // Determine if viewing own profile or someone else's
    const isOwnProfile = !userId || userId === currentUser.uid;
    const viewingUserId = isOwnProfile ? currentUser.uid : userId;

    // Function to fetch profile owner's data
    const fetchProfileOwner = async () => {
        if (!isOwnProfile) {
            try {
                const ownerDoc = await getDoc(doc(db, 'users', viewingUserId));
                if (ownerDoc.exists()) {
                    setProfileOwner(ownerDoc.data());
                }
            } catch (error) {
                console.error('Failed to load profile owner data:', error);
            }
        }
    };

    // Function to fetch updated friends list
    const fetchFriends = async (tabType) => {
        try {
            setLoading(true);

            // Fetch the target user's data to get their followers/following
            const userDoc = await getDoc(doc(db, 'users', viewingUserId));
            const userData = userDoc.data();

            // Fetch current user's data to determine follow status
            const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const currentUserData = currentUserDoc.data();
            const currentUserFollowing = currentUserData?.following || [];

            const ids = userData?.[tabType] || [];
            const tempList = [];
            const tempFollowing = {};

            for (const id of ids) {
                const friendDoc = await fetchUserById(id);
                if (friendDoc) {
                    tempList.push(friendDoc);
                    // Check if current user is following this friend
                    tempFollowing[id] = currentUserFollowing.includes(id);
                }
            }

            setList(tempList);
            setFollowingMap(tempFollowing);
        } catch (error) {
            console.error('Failed to load friends:', error);
        } finally {
            setLoading(false);
        }
    };

    // Ensure the list updates when navigating back or changing tabs
    useFocusEffect(
        useCallback(() => {
            fetchProfileOwner();
            fetchFriends(activeTab);
        }, [activeTab, viewingUserId])
    );

    const handleFollowToggle = async (userId, isFollowing) => {
        try {
            if (isFollowing) {
                await unfollowUser(userId);
            } else {
                await followUser(userId);
            }

            setFollowingMap((prev) => ({
                ...prev,
                [userId]: !isFollowing,
            }));

            // Refresh list after following/unfollowing
            fetchFriends(activeTab);
        } catch (err) {
            Alert.alert('Error', 'Failed to update follow status.');
            console.error(err);
        }
    };

    const renderItem = ({ item }) => {
        const isFollowing = followingMap[item.id];
        const isCurrentUser = item.id === currentUser.uid;

        return (
            <View style={styles.userItem}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => {
                        if (isCurrentUser) {
                            navigation.navigate('Profile');
                        } else {
                            navigation.navigate('OtherProfileScreen', { userId: item.id });
                        }
                    }}
                >
                    <Image
                        source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.name}>{item.fullName}</Text>
                        <Text style={styles.handle}>@{item.username || item.email?.split('@')[0]}</Text>
                    </View>
                </TouchableOpacity>

                {!isCurrentUser && (
                    <TouchableOpacity
                        style={[
                            styles.followButton,
                            isFollowing ? styles.followingButton : styles.notFollowingButton,
                        ]}
                        onPress={() => handleFollowToggle(item.id, isFollowing)}
                    >
                        <Text style={styles.followText}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // Get title for the header based on whose list we're viewing
    const getHeaderTitle = () => {
        if (isOwnProfile) {
            return "Friends";
        } else if (profileOwner) {
            return `${profileOwner.fullName}'s ${activeTab === 'followers' ? 'Followers' : 'Following'}`;
        }
        return "Friends";
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerText}>{getHeaderTitle()}</Text>

                {isOwnProfile && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AddFriends')}
                        style={styles.addButton}
                    >
                        <Ionicons name="person-add-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                )}

                {/* Empty view to maintain layout when "Add" button is not shown */}
                {!isOwnProfile && <View style={styles.addButton} />}
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
                    onPress={() => setActiveTab('followers')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'followers' && styles.activeTabText,
                        ]}
                    >
                        Followers
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'following' && styles.activeTab]}
                    onPress={() => setActiveTab('following')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'following' && styles.activeTabText,
                        ]}
                    >
                        Following
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Friend List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : list.length === 0 ? (
                <Text style={styles.emptyText}>
                    No {activeTab === 'followers' ? 'followers' : 'followings'} yet.
                </Text>
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 5,
    },
    backButton: {
        padding: 5,
    },
    addButton: {
        padding: 5,
        width: 34, // Ensure consistent width
    },
    headerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#8e24aa',
    },
    tabText: {
        fontSize: 16,
        color: '#aaa',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
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
    followButton: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    followingButton: {
        backgroundColor: 'purple',
    },
    notFollowingButton: {
        backgroundColor: 'gray',
    },
    followText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        fontStyle: 'italic',
    },
    profileButton: {
        flexDirection: 'row',
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
    }
});

export default OtherFriendsListScreen;
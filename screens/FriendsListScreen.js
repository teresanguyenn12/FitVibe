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
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { followUser, unfollowUser, fetchUserById } from '../api/addFriendsApi';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';

const FriendsListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type = 'followers' } = route.params || {};

    const { theme, themeMode } = useTheme();

    const [activeTab, setActiveTab] = useState(type);
    const [list, setList] = useState([]);
    const [followingMap, setFollowingMap] = useState({});
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    const fetchFriends = async (tabType) => {
        try {
            setLoading(true);
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();

            const ids = userData?.[tabType] || [];
            const tempList = [];
            const tempFollowing = {};

            for (const id of ids) {
                const friendDoc = await fetchUserById(id);
                if (friendDoc) {
                    tempList.push(friendDoc);
                    tempFollowing[id] = userData.following?.includes(id);
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

    useFocusEffect(
        useCallback(() => {
            fetchFriends(activeTab);
        }, [activeTab])
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

            fetchFriends(activeTab);
        } catch (err) {
            Alert.alert('Error', 'Failed to update follow status.');
            console.error(err);
        }
    };

    const renderItem = ({ item }) => {
        const isFollowing = followingMap[item.id];

        return (
            <View style={[styles.userItem, { borderBottomColor: theme.border }]}> 
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('OtherProfile', { userId: item.id })}
                >
                    <Image
                        source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={[styles.name, { color: theme.text }]}>{item.fullName}</Text>
                        <Text style={[styles.handle, { color: theme.text }]}>@{item.username || item.email?.split('@')[0]}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.followButton, isFollowing ? styles.followingButton : styles.notFollowingButton]}
                    onPress={() => handleFollowToggle(item.id, isFollowing)}
                >
                    <Text style={styles.followText}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
            <View style={[styles.headerRow, { backgroundColor: theme.headerBg }]}> 
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.headerTitleWrapper}>
                    <Text style={[styles.headerText, { color: theme.text }]}>Friends</Text>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'followers' && { borderBottomColor: theme.primary }]}
                    onPress={() => setActiveTab('followers')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'followers'
                                ? { color: theme.primary }
                                : { color: theme.text },
                        ]}
                    >
                        Followers
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'following' && { borderBottomColor: theme.primary }]}
                    onPress={() => setActiveTab('following')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'following'
                                ? { color: theme.primary }
                                : { color: theme.text },
                        ]}
                    >
                        Following
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#5A1A9B" />
                </View>
            ) : list.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.text }]}>No {activeTab === 'followers' ? 'followers' : 'followings'} yet.</Text>
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
    container: { flex: 1 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 5,
        position: 'relative',
    },
    headerTitleWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    backButton: {
        padding: 5,
    },
    headerText: {
        paddingTop: 20,
        fontSize: 22,
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
    tabText: {
        fontSize: 16,
        fontWeight: '500',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
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
        fontSize: 16,
    },
    handle: {
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
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        fontStyle: 'italic',
    },
    profileButton: {
        flexDirection: 'row',
        flex: 1,
    },
});

export default FriendsListScreen;

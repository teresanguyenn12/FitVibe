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
import {
    followUser,
    unfollowUser,
    fetchUserById,
} from '../api/addFriendsApi';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const FriendsListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type = 'followers' } = route.params || {};

    const [activeTab, setActiveTab] = useState(type);
    const [list, setList] = useState([]);
    const [followingMap, setFollowingMap] = useState({});
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    // Function to fetch updated friends list
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

    // Ensure the list updates when navigating back
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

            fetchFriends(activeTab); // Refresh list after following/unfollowing
        } catch (err) {
            Alert.alert('Error', 'Failed to update follow status.');
            console.error(err);
        }
    };

    const renderItem = ({ item }) => {
        const isFollowing = followingMap[item.id];

        return (
            <View style={styles.userItem}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('OtherProfile', { userId: item.id })}
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
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="#fff" />
  </TouchableOpacity>

  <View style={styles.headerTitleWrapper}>
    <Text style={styles.headerText}>Friends</Text>
  </View>
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
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#5A1A9B" />
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
  container: { flex: 1, backgroundColor: '#111' },
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
  addButton: {
    padding: 5,
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
    }
});

export default FriendsListScreen;

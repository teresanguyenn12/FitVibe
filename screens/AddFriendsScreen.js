import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { fetchAllUsers, followUser, unfollowUser } from "../api/addFriendsApi";

const AddFriendsScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { userList, followingMap } = await fetchAllUsers();
        setUsers(userList);
        setFollowing(followingMap);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setFollowing((prev) => ({ ...prev, [userId]: true }));
    } catch (error) {
      Alert.alert('Error', 'Failed to follow user');
      console.error('Follow error:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      setFollowing((prev) => ({ ...prev, [userId]: false }));
    } catch (error) {
      Alert.alert('Error', 'Failed to unfollow user');
      console.error('Unfollow error:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.fullName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (user.username?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconLeft}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Friends</Text>
        <View style={styles.iconRightPlaceholder} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#aaa" style={styles.searchIcon} />
        <TextInput
          placeholder="Search users"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Image
              source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.handle}>@{item.username || item.email?.split('@')[0]}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.followButton,
                following[item.id] ? styles.followingButton : styles.notFollowingButton
              ]}
              onPress={() =>
                following[item.id] ? handleUnfollow(item.id) : handleFollow(item.id)
              }
            >
              <Text style={styles.followText}>
                {following[item.id] ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconLeft: { padding: 5 },
  iconRightPlaceholder: { width: 24 }, 
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  userInfo: { flex: 1 },
  name: { color: '#fff', fontSize: 16 },
  handle: { color: '#888', fontSize: 14 },
  followButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  followingButton: { backgroundColor: 'purple' },
  notFollowingButton: { backgroundColor: 'gray' },
  followText: { color: '#fff', fontWeight: 'bold' },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
    fontSize: 16,
  },
});

export default AddFriendsScreen;

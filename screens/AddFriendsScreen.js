// AddFriendsScreen.js — Updated for Private Account Requests
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Keyboard,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { fetchAllUsers, followUser, unfollowUser } from "../api/addFriendsApi";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useTheme } from "../contexts/ThemeContext"; // theme context

const AddFriendsScreen = () => {
  const navigation = useNavigation();
  const { theme, themeMode } = useTheme(); // get theme + themeMode
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [following, setFollowing] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = getAuth().currentUser;
  const db = getFirestore();

  // Custom placeholder color depending on mode
  const placeholderColor = themeMode === "light" ? "#555" : "#ccc";
  const bigIconColor = themeMode === "light" ? "#bbb" : "#ccc"; // lighter in light mode, softer in dark mode

  const fetchBlockedUsers = async () => {
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const blockedIds = userData.blockedUsers || [];
        setBlockedUsers(blockedIds);
        return blockedIds;
      }
      return [];
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      return [];
    }
  };

  const loadUsers = async (blockedIds = null) => {
    setIsLoading(true);
    try {
      const blockedUserIds = blockedIds || await fetchBlockedUsers();
      const { userList, followingMap } = await fetchAllUsers();
      const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserDoc.exists()
        ? currentUserDoc.data()
        : {};
      const currentFollowing = currentUserData.following || [];

      const requestedMap = {};
      userList.forEach((user) => {
        const pending = user.pendingRequests || [];
        requestedMap[user.id] = pending.includes(currentUser.uid);
      });

      const filteredUserList = userList.filter(
        (user) => user.uid !== currentUser.uid && !blockedUserIds.includes(user.uid)
      );

      const usersWithMutuals = filteredUserList.map((user) => {
        const userFollowers = user.followers || [];
        const mutuals = userFollowers.filter((follower) =>
          currentFollowing.includes(follower)
        );
        return {
          ...user,
          mutualFriends: mutuals.length,
        };
      });

      setUsers(usersWithMutuals);
      setFollowing(followingMap);
      setRequested(requestedMap);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const refreshScreen = async () => {
        const blockedIds = await fetchBlockedUsers();
        loadUsers(blockedIds);
      };
      refreshScreen();
      return () => {};
    }, [])
  );

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    if (blockedUsers.length >= 0) {
      loadUsers(blockedUsers);
    }
  }, [blockedUsers]);

  useEffect(() => {
    if (search.trim().length === 0) {
      setFilteredUsers([]);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = users.filter(
      (user) =>
        (user.fullName?.toLowerCase() || "").includes(searchLower) ||
        (user.username?.toLowerCase() || "").includes(searchLower)
    );

    setFilteredUsers(filtered);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [search, users]);

  const refreshUsers = async () => {
    const blockedIds = await fetchBlockedUsers();
    await loadUsers(blockedIds);
  };

  const handleFollow = async (userId) => {
    try {
      const targetSnap = await getDoc(doc(db, "users", userId));
      const isPrivate = targetSnap.exists() ? targetSnap.data().isPrivate : false;
  
      await followUser(userId);
  
      if (isPrivate) {
        setRequested((prev) => ({ ...prev, [userId]: true }));
      } else {
        setFollowing((prev) => ({ ...prev, [userId]: true }));
      }
  
      await refreshUsers();
    } catch (error) {
      Alert.alert("Error", "Failed to follow user");
    }
  };
  
  

  const handleUnfollow = async (userId) => {
    try {
      const targetRef = doc(db, "users", userId);
      const targetSnap = await getDoc(targetRef);
      const targetData = targetSnap.exists() ? targetSnap.data() : null;
  
      if (!targetData) return;
  
      if (targetData.followers?.includes(currentUser.uid)) {
        // Currently following → unfollow
        setFollowing((prev) => ({ ...prev, [userId]: false }));
        await unfollowUser(userId);
      } else if (targetData.pendingRequests?.includes(currentUser.uid)) {
        // Cancel request
        await updateDoc(targetRef, {
          pendingRequests: arrayRemove(currentUser.uid),
        });
        setRequested((prev) => ({ ...prev, [userId]: false }));
      }
  
      await refreshUsers();
    } catch (error) {
      Alert.alert("Error", "Failed to unfollow user");
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={() => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => Keyboard.dismiss());
        }}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#ccc" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name or @username"
            placeholderTextColor="#ccc"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {/* Results or Placeholder */}
        {search.trim().length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Ionicons
              name="search-circle-outline"
              size={90}
              color={bigIconColor} // lighter giant icon color
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.placeholderText, { color: placeholderColor }]}>
              Start typing to search for friends
            </Text>
          </View>
        ) : (
          <Animated.FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            data={filteredUsers}
            keyExtractor={(item) => item.id || item.uid}
            renderItem={({ item }) => (
              <View style={[styles.userItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() =>
                    navigation.navigate("OtherProfile", { userId: item.id || item.uid })
                  }
                >
                  <Image
                    source={{
                      uri: item.profilePicture || "https://via.placeholder.com/50",
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={[styles.name, { color: theme.text }]}>{item.fullName}</Text>
                    <Text style={[styles.handle, { color: placeholderColor }]}>
                      @{item.username || (item.email && item.email.split("@")[0])}
                    </Text>
                    {item.mutualFriends > 0 && (
                      <Text style={[styles.mutual, { color: placeholderColor }]}>
                        {item.mutualFriends} mutual friend{item.mutualFriends > 1 ? "s" : ""}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    following[item.id || item.uid]
                      ? { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }
                      : { backgroundColor: theme.primary },
                  ]}
                  onPress={() =>
                    following[item.id || item.uid]
                      ? handleUnfollow(item.id || item.uid)
                      : handleFollow(item.id || item.uid)
                  }
                >
                  <Text style={[styles.followText, { color: following[item.id || item.uid] ? theme.text : "#fff" }]}>
                    {following[item.id || item.uid] ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: placeholderColor }]}>
                No users found.
              </Text>
            }
          />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 10, opacity: 0.6 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 6,
  },
  clearButton: { paddingLeft: 8 },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  placeholderText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  profileButton: { flexDirection: "row", flex: 1 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 15,
    borderColor: "#444",
    borderWidth: 1,
  },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "500" },
  handle: { fontSize: 13, marginTop: 2 },
  mutual: { fontSize: 12, marginTop: 4 },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignSelf: "center",
    minWidth: 80,
    alignItems: "center",
  },
  followText: {
    fontWeight: "600",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
    fontSize: 16,
  },
});

export default AddFriendsScreen;

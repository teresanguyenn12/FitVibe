import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useTheme } from "../../contexts/ThemeContext"; // Import ThemeContext

const BlockedUsers = () => {
    const navigation = useNavigation();
    const { theme } = useTheme(); // Use the theme
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockedUsersData, setBlockedUsersData] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            if (user) {
                fetchBlockedUsers();
            } else {
                setLoading(false);
            }
            return () => {};
        }, [user])
    );

    const fetchBlockedUsers = async () => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                const blockedIds = data.blockedUsers || [];
                setBlockedUsers(blockedIds);

                if (blockedIds.length > 0) {
                    await fetchBlockedUsersInfo(blockedIds);
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
            setLoading(false);
        }
    };

    const fetchBlockedUsersInfo = async (blockedIds) => {
        try {
            const usersData = [];
            for (const blockedId of blockedIds) {
                try {
                    const userDoc = await getDoc(doc(db, "users", blockedId));
                    if (userDoc.exists()) {
                        usersData.push({
                            uid: blockedId,
                            ...userDoc.data(),
                        });
                    } else {
                        usersData.push({
                            uid: blockedId,
                            fullName: "Unknown User",
                            username: "unknown",
                            profilePicture: null,
                        });
                    }
                } catch (userFetchError) {
                    console.error("Error fetching user:", blockedId, userFetchError);
                    usersData.push({
                        uid: blockedId,
                        fullName: "User Unavailable",
                        username: "unavailable",
                        profilePicture: null,
                    });
                }
            }
            setBlockedUsersData(usersData);
        } catch (error) {
            console.error("Error fetching blocked users info:", error);
        } finally {
            setLoading(false);
        }
    };

    const unblockUser = async (blockedUser) => {
        try {
            Alert.alert(
                "Unblock User",
                `Are you sure you want to unblock ${blockedUser.fullName || blockedUser.username || 'this user'}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Unblock",
                        onPress: async () => {
                            const userDocRef = doc(db, "users", user.uid);
                            const updatedBlockedUsers = blockedUsers.filter((uid) => uid !== blockedUser.uid);
                            await updateDoc(userDocRef, { blockedUsers: updatedBlockedUsers });
                            setBlockedUsers(updatedBlockedUsers);
                            setBlockedUsersData(blockedUsersData.filter(userData => userData.uid !== blockedUser.uid));
                            Alert.alert("Success", `${blockedUser.fullName || blockedUser.username || 'User'} has been unblocked.`);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Error unblocking user:", error);
            Alert.alert("Error", "Could not unblock user.");
        }
    };

    const renderBlockedUser = ({ item }) => (
        <View style={[styles.userRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('OtherProfile', { userId: item.uid })}
            >
                <Image
                    source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={[styles.name, { color: theme.text }]}>{item.fullName}</Text>
                    <Text style={[styles.handle, { color: theme.subtext }]}>
                        @{item.username || (item.email ? item.email.split('@')[0] : 'user')}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.unblockButton, { backgroundColor: theme.card, borderColor: theme.primary }]}
                onPress={() => unblockUser(item)}
            >
                <Text style={[styles.unblockButtonText, { color: theme.primary }]}>Unblock</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={30} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: theme.text }]}>Blocked Users</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Content */}
            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : blockedUsersData.length === 0 ? (
                <Text style={[styles.noBlockedText, { color: theme.subtext }]}>
                    You have no blocked users.
                </Text>
            ) : (
                <FlatList
                    data={blockedUsersData}
                    keyExtractor={(item) => item.uid}
                    renderItem={renderBlockedUser}
                    contentContainerStyle={{ paddingVertical: 20 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backButton: {
        padding: 5,
        marginVertical: 10,
    },
    headerText: {
        paddingTop: 10,
        fontSize: 24,
        fontWeight: "bold",
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    profileButton: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center'
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
        fontWeight: "600",
    },
    handle: {
        fontSize: 14,
        marginTop: 2,
    },
    unblockButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
    },
    unblockButtonText: {
        fontWeight: "600",
        fontSize: 14,
    },
    noBlockedText: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 40,
        fontStyle: "italic",
    },
});

export default BlockedUsers;

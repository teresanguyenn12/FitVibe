import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    useNavigation,
    useFocusEffect,
    useRoute,
} from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    orderBy,
    getDoc,
} from "firebase/firestore";

const OtherProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params;
    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [featuredGoals, setFeaturedGoals] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    const screenWidth = Dimensions.get("window").width;
    const imageSize = Math.floor((screenWidth - 40 - 8) / 3);

    useFocusEffect(
        useCallback(() => {
            const unsubscribeUser = onSnapshot(doc(db, "users", userId), (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    // Check if the current user is following this user
                    setIsFollowing(data.followers?.includes(currentUser.uid) || false);
                }
            });

            // Check if user is blocked
            const checkIfBlocked = async () => {
                try {
                    const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (currentUserDoc.exists()) {
                        const blockedUsers = currentUserDoc.data().blockedUsers || [];
                        setIsBlocked(blockedUsers.includes(userId));
                    }
                } catch (error) {
                    console.error("Error checking block status:", error);
                }
            };

            checkIfBlocked();

            const unsubscribePosts = onSnapshot(
                query(
                    collection(db, "posts"),
                    where("userId", "==", userId),
                    orderBy("timestamp", "desc")
                ),
                (snapshot) => {
                    const posts = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setUserPosts(posts);
                }
            );

            const fetchFeaturedGoals = async () => {
                try {
                    const q = query(
                        collection(db, "goals"),
                        where("displayFeatured", "==", true),
                        where("userId", "==", userId)
                    );
                    const snapshot = await getDocs(q);
                    setFeaturedGoals(
                        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
                    );
                } catch (err) {
                    console.error("Failed to fetch featured goals:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchFeaturedGoals();

            return () => {
                unsubscribeUser();
                unsubscribePosts();
            };
        }, [userId])
    );

    const handleFollowToggle = async () => {
        try {
            const currentUserRef = doc(db, "users", currentUser.uid);
            const otherUserRef = doc(db, "users", userId);

            if (isFollowing) {
                await updateDoc(currentUserRef, { following: arrayRemove(userId) });
                await updateDoc(otherUserRef, {
                    followers: arrayRemove(currentUser.uid),
                });
                setIsFollowing(false);
            } else {
                await updateDoc(currentUserRef, { following: arrayUnion(userId) });
                await updateDoc(otherUserRef, {
                    followers: arrayUnion(currentUser.uid),
                });
                setIsFollowing(true);
            }
        } catch (err) {
            console.error("Failed to update follow status:", err);
        }
    };

    const handleBlockToggle = async () => {
        try {
            if (isBlocked) {
                Alert.alert(
                    "Unblock User",
                    `Are you sure you want to unblock ${userData.fullName || userData.username || 'this user'}?`,
                    [
                        {
                            text: "Cancel",
                            style: "cancel"
                        },
                        {
                            text: "Unblock",
                            onPress: async () => {
                                const userDocRef = doc(db, "users", currentUser.uid);
                                const userDoc = await getDoc(userDocRef);
                                const blockedUsers = userDoc.data().blockedUsers || [];
                                const updatedBlockedUsers = blockedUsers.filter((uid) => uid !== userId);
                                await updateDoc(userDocRef, { blockedUsers: updatedBlockedUsers });
                                setIsBlocked(false);
                                Alert.alert("Success", `${userData.fullName || userData.username || 'User'} has been unblocked.`);
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    "Block User",
                    `Are you sure you want to block ${userData.fullName || userData.username || 'this user'}? You won't see their posts and they won't be able to interact with you.`,
                    [
                        {
                            text: "Cancel",
                            style: "cancel"
                        },
                        {
                            text: "Block",
                            style: "destructive",
                            onPress: async () => {
                                const userDocRef = doc(db, "users", currentUser.uid);
                                await updateDoc(userDocRef, {
                                    blockedUsers: arrayUnion(userId),
                                    // Remove from following if currently following
                                    following: arrayRemove(userId)
                                });

                                // Also remove this user from the other user's followers
                                const otherUserRef = doc(db, "users", userId);
                                await updateDoc(otherUserRef, {
                                    followers: arrayRemove(currentUser.uid)
                                });

                                setIsBlocked(true);
                                setIsFollowing(false);
                                Alert.alert("Success", `${userData.fullName || userData.username || 'User'} has been blocked.`);
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error("Error blocking/unblocking user:", error);
            Alert.alert("Error", "Could not update block status.");
        }
    };

    if (loading || !userData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8e24aa" />
            </View>
        );
    }

    const {
        fullName,
        username,
        profilePicture,
        followers = [],
        following = [],
        challenges = 0,
        calories = 0,
        workouts = 0,
    } = userData;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={handleBlockToggle}>
                    <Ionicons
                        name={isBlocked ? "person-remove" : "person-remove-outline"}
                        size={26}
                        color={isBlocked ? "#ff4d4d" : "#fff"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.profileSection}>
                <Image
                    source={{ uri: profilePicture || "https://via.placeholder.com/100" }}
                    style={styles.profileImage}
                />
                <Text style={styles.fullName}>{fullName}</Text>
                <Text style={styles.username}>@{username || "no-username"}</Text>

                <TouchableOpacity
                    style={[
                        styles.followButton,
                        isFollowing ? styles.followingButton : styles.notFollowingButton,
                        isBlocked && styles.disabledButton
                    ]}
                    onPress={handleFollowToggle}
                    disabled={isBlocked}
                >
                    <Text style={styles.followButtonText}>
                        {isBlocked ? "User Blocked" : isFollowing ? "Following" : "Follow"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.countContainer}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("OtherFriendsList", {
                                userId,
                                type: "followers",
                            })
                        }
                        disabled={isBlocked}
                    >
                        <Text style={[styles.countNumber, isBlocked && styles.disabledText]}>
                            {isBlocked ? "--" : followers.length}
                        </Text>
                        <Text style={[styles.countLabel, isBlocked && styles.disabledText]}>Followers</Text>
                    </TouchableOpacity>
                    <Text style={styles.separator}>|</Text>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("OtherFriendsList", {
                                userId,
                                type: "following",
                            })
                        }
                        disabled={isBlocked}
                    >
                        <Text style={[styles.countNumber, isBlocked && styles.disabledText]}>
                            {isBlocked ? "--" : following.length}
                        </Text>
                        <Text style={[styles.countLabel, isBlocked && styles.disabledText]}>Following</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isBlocked ? (
                <View style={styles.blockedContainer}>
                    <Ionicons name="ban" size={50} color="#666" />
                    <Text style={styles.blockedText}>You have blocked this user</Text>
                    <Text style={styles.blockedSubtext}>
                        You won't see their content and they can't interact with you
                    </Text>
                    <TouchableOpacity
                        style={styles.unblockButton}
                        onPress={handleBlockToggle}
                    >
                        <Text style={styles.unblockButtonText}>Unblock User</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rank</Text>
                        <Text style={styles.sectionContent}>Prestige 0 - Rookie</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Career Stats</Text>
                        <View style={styles.statBox}>
                            <View style={styles.statItem}>
                                <Ionicons
                                    name="trophy-outline"
                                    size={22}
                                    color="#fff"
                                    style={styles.statIcon}
                                />
                                <Text style={styles.statValue}>{challenges}</Text>
                                <Text style={styles.statLabel}>Challenges</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons
                                    name="flame-outline"
                                    size={22}
                                    color="#fff"
                                    style={styles.statIcon}
                                />
                                <Text style={styles.statValue}>{calories}</Text>
                                <Text style={styles.statLabel}>Calories</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons
                                    name="barbell-outline"
                                    size={22}
                                    color="#fff"
                                    style={styles.statIcon}
                                />
                                <Text style={styles.statValue}>{workouts}</Text>
                                <Text style={styles.statLabel}>Workouts</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Featured Goals</Text>
                        {featuredGoals.length === 0 ? (
                            <Text style={styles.emptyText}>No featured goals.</Text>
                        ) : (
                            featuredGoals.map((goal) => (
                                <Text key={goal.id} style={styles.sectionContent}>
                                    • {goal.text}
                                </Text>
                            ))
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Posts</Text>
                        {userPosts.length === 0 ? (
                            <Text style={styles.emptyText}>No posts yet.</Text>
                        ) : (
                            <View style={styles.postGrid}>
                                {userPosts.map((post) => (
                                    <TouchableOpacity
                                        key={post.id}
                                        onPress={() =>
                                            navigation.navigate("PostDetailScreen", { post })
                                        }
                                        style={styles.postWrapper}
                                    >
                                        <Image
                                            source={{ uri: post.imageUrl }}
                                            style={styles.postThumbnail}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#131417", paddingHorizontal: 20 },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#131417",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 70,
        paddingBottom: 10,
    },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    profileSection: { alignItems: "center", marginTop: 10, marginBottom: 30 },
    profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
    fullName: { fontSize: 22, fontWeight: "bold", color: "#fff" },
    username: { color: "#aaa", fontSize: 15, fontStyle: "italic", marginTop: 2 },
    followButton: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
        marginBottom: 12,
    },
    notFollowingButton: { backgroundColor: "#8e24aa" },
    followingButton: {
        backgroundColor: "#2B2D31",
        borderWidth: 1,
        borderColor: "#8e24aa",
    },
    disabledButton: {
        backgroundColor: "#444",
        borderWidth: 0,
    },
    followButtonText: { color: "#fff", fontWeight: "600" },
    countContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    countNumber: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
    countLabel: { color: "#aaa", fontSize: 15, textAlign: "center" },
    disabledText: { color: "#555" },
    separator: { marginHorizontal: 16, color: "#555", fontSize: 18 },
    section: { marginVertical: 15 },
    sectionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
    },
    sectionContent: {
        color: "#ccc",
        fontSize: 15,
        marginLeft: 5,
        marginBottom: 2,
    },
    emptyText: { color: "#888", fontStyle: "italic", marginTop: 5 },
    postGrid: { flexDirection: "row", flexWrap: "wrap" },
    postWrapper: {
        width: (Dimensions.get("window").width - 40 - 8) / 3,
        aspectRatio: 1,
        marginBottom: 4,
    },
    postThumbnail: { width: "100%", height: "100%", borderRadius: 6 },
    statBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#2B2D31",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    statItem: { alignItems: "center", flex: 1 },
    statValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    statLabel: { color: "#aaa", fontSize: 13, marginTop: 2 },
    statIcon: { marginBottom: 6 },
    blockedContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        borderRadius: 12,
        backgroundColor: "#1E1F23",
        marginVertical: 30,
    },
    blockedText: {
        color: "#ddd",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 12,
    },
    blockedSubtext: {
        color: "#999",
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    unblockButton: {
        marginTop: 20,
        backgroundColor: "#444",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    unblockButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
});

export default OtherProfileScreen;
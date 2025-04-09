import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDoc, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const OtherProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params; // Get the userId from navigation params
    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [featuredGoals, setFeaturedGoals] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                try {
                    // Fetch the other user's data
                    const userDoc = await getDoc(doc(db, "users", userId));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }

                    // Fetch current user data to check if following
                    const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (currentUserDoc.exists()) {
                        const currentData = currentUserDoc.data();
                        setCurrentUserData(currentData);
                        setIsFollowing(currentData.following?.includes(userId) || false);
                    }
                } catch (err) {
                    console.error("Failed to fetch user data:", err);
                } finally {
                    setLoading(false);
                }
            };

            const fetchFeaturedGoals = async () => {
                try {
                    const goalsRef = collection(db, "goals");
                    const q = query(
                        goalsRef,
                        where("displayFeatured", "==", true),
                        where("userId", "==", userId)
                    );
                    const querySnapshot = await getDocs(q);
                    const goals = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setFeaturedGoals(goals);
                } catch (err) {
                    console.error("Failed to fetch featured goals:", err);
                }
            };

            fetchUserData();
            fetchFeaturedGoals();
        }, [userId])
    );

    const handleFollowToggle = async () => {
        try {
            // Update current user's following list
            const currentUserRef = doc(db, "users", currentUser.uid);

            // Update other user's followers list
            const otherUserRef = doc(db, "users", userId);

            if (isFollowing) {
                // Unfollow
                await updateDoc(currentUserRef, {
                    following: arrayRemove(userId)
                });
                await updateDoc(otherUserRef, {
                    followers: arrayRemove(currentUser.uid)
                });
                setIsFollowing(false);
            } else {
                // Follow
                await updateDoc(currentUserRef, {
                    following: arrayUnion(userId)
                });
                await updateDoc(otherUserRef, {
                    followers: arrayUnion(currentUser.uid)
                });
                setIsFollowing(true);
            }

            // Update local data
            if (userData) {
                if (isFollowing) {
                    setUserData({
                        ...userData,
                        followers: userData.followers.filter(id => id !== currentUser.uid)
                    });
                } else {
                    setUserData({
                        ...userData,
                        followers: [...(userData.followers || []), currentUser.uid]
                    });
                }
            }
        } catch (err) {
            console.error("Failed to update follow status:", err);
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
            {/* Header with back */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 26 }} /> 
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <Image
                    source={{ uri: profilePicture || "https://via.placeholder.com/100" }}
                    style={styles.profileImage}
                />
                <Text style={styles.fullName}>{fullName}</Text>
                <Text style={styles.username}>@{username || "no-username"}</Text>

                {/* Follow/Unfollow Button */}
                <TouchableOpacity
                    style={[
                        styles.followButton,
                        isFollowing ? styles.followingButton : styles.notFollowingButton
                    ]}
                    onPress={handleFollowToggle}
                >
                    <Text style={styles.followButtonText}>
                        {isFollowing ? "Following" : "Follow"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.countContainer}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("OtherFriendsList", { userId, type: "followers" })
                        }
                    >
                        <Text style={styles.countNumber}>{followers.length}</Text>
                        <Text style={styles.countLabel}>Followers</Text>
                    </TouchableOpacity>

                    <Text style={styles.separator}>|</Text>

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("OtherFriendsList", { userId, type: "following" })
                        }
                    >
                        <Text style={styles.countNumber}>{following.length}</Text>
                        <Text style={styles.countLabel}>Following</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Rank */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rank</Text>
                <Text style={styles.sectionContent}>Prestige 0 - Rookie</Text>
            </View>

            {/* Career Stats */}
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

            {/* Featured Goals */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured Goals</Text>
                {featuredGoals.length === 0 ? (
                    <Text style={styles.emptyText}>No featured goals.</Text>
                ) : (
                    featuredGoals.map((goal) => (
                        <Text key={goal.id} style={styles.sectionContent}>
                            - {goal.text}
                        </Text>
                    ))
                )}
            </View>

            {/* Posts */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Posts</Text>
                <Text style={styles.emptyText}>No posts yet.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#131417",
        paddingHorizontal: 20,
    },
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
        paddingHorizontal: 5,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    profileSection: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 30,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 12,
    },
    fullName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
    },
    username: {
        color: "#aaa",
        fontSize: 15,
        fontStyle: "italic",
        marginTop: 2,
    },
    followButton: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
        marginBottom: 12,
    },
    notFollowingButton: {
        backgroundColor: "#8e24aa",
    },
    followingButton: {
        backgroundColor: "#2B2D31",
        borderWidth: 1,
        borderColor: "#8e24aa",
    },
    followButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
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
    countLabel: {
        color: "#aaa",
        fontSize: 15,
        textAlign: "center",
    },
    separator: {
        marginHorizontal: 16,
        color: "#555",
        fontSize: 18,
    },
    section: {
        marginVertical: 15,
    },
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
    emptyText: {
        color: "#888",
        fontStyle: "italic",
        marginTop: 5,
    },
    statBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#2B2D31",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    statLabel: {
        color: "#aaa",
        fontSize: 13,
        marginTop: 2,
    },
    statIcon: {
        marginBottom: 6,
    },
});

export default OtherProfileScreen;
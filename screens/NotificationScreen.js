import React, { useState, useEffect } from 'react';
import { getIndieNotificationInbox, deleteIndieNotificationInbox } from 'native-notify';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

export default function NotificationScreen() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        if (!currentUser || !currentUser.uid) {
            setError("User not authenticated");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Using the indie notification inbox with the current user's ID
            const notifications = await getIndieNotificationInbox(
                currentUser.uid, // Use the current user's ID as the subscriber ID
                29298,
                'u04gYyaVKbAobwZ9ojzShp',
                10, // take: number of notifications to fetch
                0   // skip: number of notifications to skip (for pagination)
            );
            console.log("notifications: ", notifications);
            setData(notifications);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("Failed to load notifications");
            setLoading(false);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            // First parameter is the subscriber ID (user's UID), second is the notification ID
            const notifications = await deleteIndieNotificationInbox(
                currentUser.uid,
                notificationId,
                29298,
                'u04gYyaVKbAobwZ9ojzShp'
            );
            console.log("notifications: ", notifications);
            setData(notifications);
        } catch (err) {
            console.error("Error deleting notification:", err);
            setError("Failed to delete notification");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Date formatting error:", error);
            return '';
        }
    };

    const renderNotificationItem = ({ item }) => (
        <TouchableOpacity style={styles.userRow}>
            {item.image ? (
                <Image
                    source={{ uri: item.image }}
                    style={styles.avatar}
                    defaultSource={require('../assets/FVLOGO.png')}
                />
            ) : (
                <View style={[styles.avatar, { backgroundColor: "#2B2D31", justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons
                        name="notifications-outline"
                        size={24}
                        color="#fff"
                    />
                </View>
            )}
            <View style={styles.userInfo}>
                <Text style={styles.name} numberOfLines={1}>{item.title || 'Notification'}</Text>
                <Text style={styles.handle} numberOfLines={2}>{item.message}</Text>
                <Text style={[styles.handle, { fontSize: 12, marginTop: 4 }]}>
                    {formatDate(item.created_at)}
                </Text>
            </View>
            <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => handleDeleteNotification(item.id)}
            >
                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
            {!item.read && (
                <View style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#8e24aa",
                    marginLeft: 10
                }} />
            )}
        </TouchableOpacity>
    );

    const renderEmptyList = () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <Text style={styles.noBlockedText}>No notifications yet</Text>
            <TouchableOpacity
                style={styles.unblockButton}
                onPress={fetchNotifications}
            >
                <Text style={styles.unblockButtonText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Notifications</Text>
                <TouchableOpacity onPress={fetchNotifications}>
                    <Ionicons name="refresh" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#8e24aa" />
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: '#ff6b6b', fontSize: 16, marginBottom: 20 }}>{error}</Text>
                    <TouchableOpacity
                        style={styles.unblockButton}
                        onPress={fetchNotifications}
                    >
                        <Text style={styles.unblockButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={renderEmptyList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#131417",
        paddingTop: 50,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#2B2D31",
    },
    backButton: {
        padding: 5,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#2B2D31",
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
        marginRight: 15
    },
    userInfo: {
        flex: 1
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: "600"
    },
    handle: {
        color: '#888',
        fontSize: 14,
        marginTop: 2
    },
    unblockButton: {
        backgroundColor: "#2B2D31",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#8e24aa",
    },
    unblockButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
    },
    noBlockedText: {
        color: "#8e8e8e",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        fontStyle: "italic",
    }
});
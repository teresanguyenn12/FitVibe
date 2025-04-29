import React, { useState, useEffect, useCallback } from 'react';
import { getIndieNotificationInbox, deleteIndieNotificationInbox, getNotificationInbox } from 'native-notify';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

export default function NotificationScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('personal');
    const [personalData, setPersonalData] = useState([]);
    const [systemData, setSystemData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Fetch personal notifications (indie notifications)
    const fetchPersonalNotifications = async () => {
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
            console.log("personal notifications: ", notifications);
            setPersonalData(notifications);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching personal notifications:", err);
            setError("Failed to load notifications");
            setLoading(false);
        }
    };

    // Fetch system notifications
    const fetchSystemNotifications = async () => {
        try {
            setLoading(true);
            const notifications = await getNotificationInbox(
                29298,
                'u04gYyaVKbAobwZ9ojzShp',
                10, // take: number of notifications to fetch
                0   // skip: number of notifications to skip (for pagination)
            );
            console.log("system notifications: ", notifications);
            setSystemData(notifications);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching system notifications:", err);
            setError("Failed to load system notifications");
            setLoading(false);
        }
    };

    // Fetch notifications based on active tab
    const fetchNotifications = () => {
        if (activeTab === 'personal') {
            fetchPersonalNotifications();
        } else {
            fetchSystemNotifications();
        }
    };

    // Effect to fetch notifications when tab changes
    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [activeTab])
    );

    const handleDeleteNotification = async (notificationId) => {
        if (!currentUser || !currentUser.uid) {
            console.error("Cannot delete notification: User not authenticated");
            setError("Authentication required to delete notifications");
            return;
        }

        try {
            setLoading(true);
            await deleteIndieNotificationInbox(
                currentUser.uid,
                notificationId,
                29298,
                'u04gYyaVKbAobwZ9ojzShp'
            );

            // After deletion, refresh the notifications list
            fetchPersonalNotifications();
        } catch (err) {
            console.error("Error deleting notification:", err);
            setError("Failed to delete notification");
            setLoading(false);
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

    const renderPersonalNotificationItem = ({ item }) => (
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
                onPress={() => handleDeleteNotification(item.notification_id)}
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

    const renderSystemNotificationItem = ({ item }) => (
        <TouchableOpacity style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: "#2B2D31", justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color="#fff"
                />
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.name} numberOfLines={1}>{item.title || 'System Notification'}</Text>
                <Text style={styles.handle} numberOfLines={2}>{item.message}</Text>
                <Text style={[styles.handle, { fontSize: 12, marginTop: 4 }]}>
                    {formatDate(item.created_at)}
                </Text>
            </View>
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Notifications</Text>
                <TouchableOpacity onPress={fetchNotifications}>
                    <Ionicons name="refresh" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'personal' ? styles.activeTab : null]}
                    onPress={() => setActiveTab('personal')}
                >
                    <Text style={[styles.tabText, activeTab === 'personal' ? styles.activeTabText : null]}>Personal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'system' ? styles.activeTab : null]}
                    onPress={() => setActiveTab('system')}
                >
                    <Text style={[styles.tabText, activeTab === 'system' ? styles.activeTabText : null]}>System</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8e24aa" />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'personal' ? personalData : systemData}
                    renderItem={activeTab === 'personal' ? renderPersonalNotificationItem : renderSystemNotificationItem}
                    keyExtractor={(item) => item.notification_id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={60} color="#4A4A4A" />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    tabContainer: {
        flexDirection: 'row',
        marginVertical: 15,
        marginHorizontal: 20,
        backgroundColor: '#2B2D31',
        borderRadius: 20,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 18,
    },
    activeTab: {
        backgroundColor: '#8e24aa',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#AAAAAA',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    handle: {
        fontSize: 14,
        color: '#AAAAAA',
        marginTop: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#8e24aa',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 20,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 16,
        color: '#4A4A4A',
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
});
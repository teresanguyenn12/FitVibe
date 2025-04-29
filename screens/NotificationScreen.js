import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getIndieNotificationInbox,
  deleteIndieNotificationInbox,
  getNotificationInbox,
} from 'native-notify';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('personal');
  const [personalData, setPersonalData] = useState([]);
  const [systemData, setSystemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const db = getFirestore();
  const APP_ID = 29298;
const NOTIFY_API_KEY = 'u04gYyaVKbAobwZ9ojzShp';

  const fetchPersonalNotifications = async () => {
    if (!currentUser?.uid) return;
    try {
      setLoading(true);
      const notifications = await getIndieNotificationInbox(
        currentUser.uid,
        29298,
        'u04gYyaVKbAobwZ9ojzShp',
        30,
        0
      );
      setPersonalData(notifications);
    } catch (err) {
      console.error('Error fetching personal notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotificationInbox(
        29298,
        'u04gYyaVKbAobwZ9ojzShp',
        30,
        0
      );
      setSystemData(data);
    } catch (err) {
      console.error('Error fetching system notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = () => {
    if (activeTab === 'personal') fetchPersonalNotifications();
    else fetchSystemNotifications();
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [activeTab])
  );

  const handleDeleteNotification = async (notifId) => {
    try {
      await deleteIndieNotificationInbox(
        currentUser.uid,
        notifId,
        29298,
        'u04gYyaVKbAobwZ9ojzShp'
      );
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleAccept = async (item) => {
    console.log("🔍 Accepting notification:", item);
  
    let senderId = item?.sendbird_channel_url;

if (!senderId && item?.pushData) {
  try {
    const parsed = JSON.parse(item.pushData);
    senderId = parsed.senderId;
  } catch (err) {
    console.warn("⚠️ Failed to parse pushData:", item.pushData);
  }
}

if (!senderId) {
  console.warn("⚠️ Missing sender ID — item:", item);
  Alert.alert("Error", "Cannot accept request — missing sender ID.");
  return;
}

  
    try {
      const currentRef = doc(db, 'users', currentUser.uid);
      const senderRef = doc(db, 'users', senderId);
  
      await updateDoc(currentRef, {
        followers: arrayUnion(senderId),
        pendingRequests: arrayRemove(senderId),
      });
  
      await updateDoc(senderRef, {
        following: arrayUnion(currentUser.uid),
      });
  
      await deleteIndieNotificationInbox(
        currentUser.uid,
        item.notification_id,
        APP_ID,
        NOTIFY_API_KEY
      );
  
      fetchNotifications();
    } catch (err) {
      console.error('❌ Error accepting request:', err);
      Alert.alert("Error", "Failed to accept request.");
    }
  };
  
  
  const handleDecline = async (item) => {
    console.log("🔍 Declining notification:", item);
  
    let senderId = item?.sendbird_channel_url;
  
    if (!senderId && item?.pushData) {
      try {
        const parsed = JSON.parse(item.pushData);
        senderId = parsed.senderId;
      } catch (err) {
        console.warn("⚠️ Failed to parse pushData:", item.pushData);
      }
    }
  
    if (!senderId) {
      console.warn("⚠️ Missing sender ID — item:", item);
      Alert.alert("Error", "Cannot decline request — missing sender ID.");
      return;
    }
  
    try {
      const currentRef = doc(db, 'users', currentUser.uid);
  
      await updateDoc(currentRef, {
        pendingRequests: arrayRemove(senderId),
      });
  
      await deleteIndieNotificationInbox(
        currentUser.uid,
        item.notification_id,
        APP_ID,
        NOTIFY_API_KEY
      );
  
      fetchNotifications();
    } catch (err) {
      console.error('❌ Error declining request:', err);
      Alert.alert("Error", "Failed to decline request.");
    }
  };
  
  

  const renderNotificationItem = ({ item }) => {
    const isRequest = item.message?.includes('wants to follow you');
  
    return (
      <View style={styles.itemContainer}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/44' }}
            style={styles.avatar}
          />
  
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Ionicons
                name={isRequest ? 'person-add-outline' : 'notifications-outline'}
                size={16}
                color={isRequest ? '#4CAF50' : '#888'}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.title}>{item.title}</Text>
            </View>
  
            <Text style={styles.message}>{item.message}</Text>
  
            {isRequest && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item)}>
                  <Text style={styles.actionText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(item)}>
                  <Text style={styles.actionText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
  
        <TouchableOpacity onPress={() => handleDeleteNotification(item.notification_id)}>
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={fetchNotifications}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'system' && styles.activeTab]}
          onPress={() => setActiveTab('system')}
        >
          <Text style={[styles.tabText, activeTab === 'system' && styles.activeTabText]}>
            System
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#8e24aa" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={activeTab === 'personal' ? personalData : systemData}
          keyExtractor={(item) => item.notification_id.toString()}
          renderItem={renderNotificationItem}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#2B2D31',
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeTab: { backgroundColor: '#8e24aa' },
  tabText: { color: '#aaa', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 15 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  message: { color: '#aaa', fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', marginTop: 6 },
  acceptBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  declineBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
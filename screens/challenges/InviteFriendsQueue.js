import { setDoc, doc, getDoc } from "firebase/firestore";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../authProvider';
import { fetchUserFriends } from '../../api/fetchUserFriends';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const InviteFriendsQueueScreen = () => {
  const route = useRoute();
  const { challenge } = route.params || {};

  const { user } = useAuth();
  const navigation = useNavigation();
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [maxSelectable, setMaxSelectable] = useState("select");

  const db = getFirestore();

  useEffect(() => {
    const loadFriends = async () => {
      if (user) {
        const currentUserDoc = await getDoc(doc(db, 'users', user.uid));
        const currentUserData = currentUserDoc.data();
        const following = currentUserData?.following || [];
        const followers = currentUserData?.followers || [];
        const mutuals = following.filter(uid => followers.includes(uid));

        const allFriends = await fetchUserFriends();
        const mutualFriends = allFriends.filter(f => mutuals.includes(f.id));
        setFriends(mutualFriends);
      }
    };
    loadFriends();
  }, []);

  const toggleSelectFriend = (friendId) => {
    const isSelected = selectedFriends.includes(friendId);
    if (isSelected) {
      setSelectedFriends((prev) => prev.filter((id) => id !== friendId));
    } else {
      if (
        maxSelectable !== "select" &&
        selectedFriends.length >= parseInt(maxSelectable)
      ) {
        Alert.alert("Limit Reached", `You can only invite up to ${maxSelectable} friends.`);
        return;
      }
      setSelectedFriends((prev) => [...prev, friendId]);
    }
  };

  const handleContinue = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert("No Friends Selected", "Please select at least one friend to invite.");
      return;
    }

    const invited = friends.filter((f) => selectedFriends.includes(f.id));
    const participants = [
      {
        id: user.uid,
        name: user.displayName || 'You',
        avatar: user.photoURL || 'https://via.placeholder.com/40',
      },
      ...invited.map((f) => ({
        id: f.id,
        name: f.fullName,
        avatar: f.profilePicture || 'https://via.placeholder.com/40',
      })),
    ];

    const participantIdsSet = new Set(participants.map((p) => p.id).sort());

    try {
      const chatroomsRef = collection(db, 'chatrooms');
      const q = query(chatroomsRef, where('challengeId', '==', challenge.id));
      const snapshot = await getDocs(q);

      let existingRoomId = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const ids = Object.keys(data.participantDetails || {}).sort();
        const idsSet = new Set(ids);
        const sameSize = ids.length === participantIdsSet.size;
        const isSameGroup = sameSize && ids.every((id) => participantIdsSet.has(id));
        if (isSameGroup) {
          existingRoomId = doc.id;
        }
      });

      let chatroomId = existingRoomId;

      if (!chatroomId) {
        const newDocRef = await addDoc(chatroomsRef, {
          challengeId: challenge.id,
          challengeTitle: challenge?.title || 'Untitled Challenge',
          createdAt: serverTimestamp(),
          lastMessage: `Welcome to the \"${challenge?.name || 'the challenge'}\" challenge! Let's go!`,
          lastMessageTime: serverTimestamp(),
          participantDetails: Object.fromEntries(
            participants.map((p) => [
              p.id,
              { name: p.name, profilePicture: p.avatar },
            ])
          ),
        });
        chatroomId = newDocRef.id;
      }

      const inviteId = `${challenge.id}_${user.uid}`;
      await setDoc(doc(db, "groupChallengeInvites", inviteId), {
        challengeId: challenge.id,
        fromUserId: user.uid,
        toUserIds: selectedFriends,
        message: `Join me in the \"${challenge?.title}\" challenge!`,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      navigation.navigate("ChallengeChatScreen", {
        chatroomId,
        challenge,
        participants,
      });
    } catch (error) {
      console.error('Error checking/creating chatroom:', error);
      Alert.alert("Error", "Could not continue. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>How Many People Will Join?</Text>
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={maxSelectable}
          onValueChange={(value) => {
            if (value !== "select") setSelectedFriends([]);
            setMaxSelectable(value);
          }}
          dropdownIconColor="#fff"
          style={styles.picker}
        >
          <Picker.Item label="Select" value="select" />
          <Picker.Item label="1" value="1" />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="3" value="3" />
        </Picker>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const isSelected = selectedFriends.includes(item.id);
          return (
            <View style={styles.friendItem}>
              <Image
                source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.handle}>@{item.email?.split('@')[0]}</Text>
              </View>
              <TouchableOpacity
                style={[styles.selectButton, isSelected && styles.selectedButton]}
                onPress={() => toggleSelectFriend(item.id)}
              >
                <Text style={styles.selectButtonText}>
                  {isSelected ? 'Selected' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.inviteButton} onPress={handleContinue}>
        <Text style={styles.inviteText}>Invite</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    marginHorizontal: 15,
    backgroundColor: '#222',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    color: '#fff',
    height: 50,
    width: '100%',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize:  16,
  },
  handle: {
    color: '#888',
    fontSize: 14,
  },
  selectButton: {
    backgroundColor: '#444',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  selectedButton: {
    backgroundColor: '#A0006D',
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  inviteButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  inviteText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default InviteFriendsQueueScreen;

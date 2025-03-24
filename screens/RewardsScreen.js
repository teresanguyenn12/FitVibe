import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebase";
import { getFitCoins, updateFitCoins } from "../api/fitCoinsApi";
import { doc, onSnapshot } from "firebase/firestore";

const RewardsScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [fitCoins, setFitCoins] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const user = auth.currentUser;

  // Tracks FitCoin balance in real time
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setFitCoins(docSnap.data().fitCoins || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Opens popup upon pressing on reward
  const openRewardModal = (cost) => {
    setSelectedReward(cost); 
    setModalVisible(true);
  };

  // Purchase arguments for rewards
  const handlePurchase = async (cost) => {
    if (!user) return Alert.alert("Error", "You must be logged in to make a purchase");

    if (fitCoins >= cost) {
      const newBalance = await updateFitCoins(user.uid, -cost);
      if (newBalance !== null) {
        Alert.alert("Success", "Purchase successful");
      } else {
        Alert.alert("Error", "Something went wrong, try again");
      }
    } else {
      Alert.alert("Insufficient FitCoins", "You don't have enough FitCoins for this reward");
    }
  };

  return (
    <View style = {styles.container}>
      {/* Header */}
      <View style = {styles.header}>
        <TouchableOpacity onPress = {() => navigation.goBack()}>
          <Ionicons name = "close" size={28} color = "white"/>
        </TouchableOpacity>
        <Text style = {styles.headerTitle}>Rewards</Text>
        <View style = {styles.coinContainer}>
          <Text style = {styles.coinText}>{fitCoins}</Text>
          <View style = {styles.coinBadge}>
            <Text style = {styles.coinBadgeText}>Fv</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* FitCoin Shop Section */}
        <Text style = {styles.sectionTitle}>FitCoin Shop</Text>
        <View style = {styles.grid}>
          <RewardItem image = {require("../assets/FVLOGO.png")} cost = {100} onPress = {openRewardModal}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} cost = {200} onPress = {openRewardModal}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} cost = {300} onPress = {openRewardModal}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} cost = {400} onPress = {openRewardModal}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} cost = {500} onPress = {openRewardModal}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} cost = {600} onPress = {openRewardModal}/>
        </View>

        {/* Featured Brands */}
        <Text style = {styles.sectionTitle}>Featured Brands</Text>
        <View style = {styles.grid}>
          <RewardItem image={require("../assets/FVLOGO.png")} cost = {1000} onPress = {openRewardModal}/>
          <RewardItem image={require("../assets/FVLOGO.png")} cost = {1500} onPress = {openRewardModal}/>
          <RewardItem image={require("../assets/FVLOGO.png")} cost = {1750} onPress = {openRewardModal}/>
          <RewardItem image={require("../assets/FVLOGO.png")} cost = {2000} onPress = {openRewardModal}/>
        </View>
      </ScrollView>

      {/* Reward Popup */}
      <RewardPopup
        visible = {modalVisible}
        onClose = {() => setModalVisible(false)}
        onPurchase = {handlePurchase}
        selectedReward = {selectedReward}/>
    </View>
  );
};

// Reward Items
const RewardItem = ({ image, cost, onPress }) => (
  <TouchableOpacity style = {styles.rewardItem} onPress = {() => onPress(cost)}>
    <Image source = {image} style = {styles.rewardImage} resizeMode = "contain"/>
  </TouchableOpacity>
);

// Reward popup with purchase button
const RewardPopup = ({ visible, onClose, onPurchase, selectedReward }) => (
  <Modal transparent visible = {visible} animationType = "slide">
    <View style = {styles.modalOverlay}>
      <LinearGradient colors = {["#A0004D", "#000000"]} style = {styles.modalContainer}>
        <TouchableOpacity onPress = {onClose} style = {styles.closeButton}>
          <Ionicons name = "close" size = {28} color = "white"/>
        </TouchableOpacity>
        <Image source = {require("../assets/FVLOGO.png")} style = {styles.modalImage}/>
        <Text style = {styles.modalTitle}>2-Day XP Booster</Text>
        <View style = {styles.coinContainer}>
          <Text style = {styles.modalCoinText}>{selectedReward}</Text>
          <View style = {styles.coinBadge}>
            <Text style = {styles.coinBadgeText}>Fv</Text>
          </View>
        </View>
        <Text style = {styles.modalText}>Supercharge your progress with this 2-day XP Booster! Earn double XP for the next 48 hours on challenges, leveling up faster and unlocking rewards in no time. Don't miss this chance to maximize your gains—activate now and make every action count! 🚀🔥</Text>
        <TouchableOpacity style = {styles.purchaseButton} onPress = {() => onPurchase(selectedReward)}>
          <Text style = {styles.purchaseButtonText}>Purchase</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    position: "absolute",
    right: "36%",
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 5,
  },
  coinBadge: {
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  coinBadgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  rewardItem: {
    width: "48%",
    height: 120,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#87005c",
  },
  rewardImage: {
    width: "80%",
    height: "60%",
  },
  costText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    padding: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
  },
  modalImage: {
    width: 120,
    height: 100,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  modalCoinText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 4,
  },
  modalText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  purchaseButton: {
    backgroundColor: "#87005c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  purchaseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 16,
  },
});

export default RewardsScreen;
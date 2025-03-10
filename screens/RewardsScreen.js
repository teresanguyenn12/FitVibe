import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const RewardsScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style = {styles.container}>
      {/* Header */}
      <View style = {styles.header}>
        <TouchableOpacity onPress = {() => navigation.goBack()}>
          <Ionicons name = "close" size = {28} color = "white"/>
        </TouchableOpacity>
        <Text style = {styles.headerTitle}>Rewards</Text>
        <View style = {styles.coinContainer}/>
      </View>

      <ScrollView>
        {/* FitCoin Shop Section */}
        <Text style = {styles.sectionTitle}>FitCoin Shop</Text>
        <View style = {styles.coinRow}>
          <Text style = {styles.coinText}>1000 FitCoins</Text>
          <View style = {styles.coinBadge}>
            <Text style = {styles.coinBadgeText}>Fv</Text>
          </View>
        </View>
        <View style = {styles.grid}>
          <RewardItem image = {require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)}/>
          <RewardItem image = {require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)}/>

          <TouchableOpacity style = {styles.viewMore}>
            <Text style = {styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Brands */}
        <Text style = {styles.sectionTitle}>Featured Brands</Text>
        <View style = {styles.grid}>
          <RewardItem image={require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)}/>
          <RewardItem image={require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)}/>
          <RewardItem image={require("../assets/FVLOGO.png")} onPress = {() => setModalVisible(true)} wide/>
        </View>
      </ScrollView>

      {/* Reward Popup */}
      <RewardPopup visible = {modalVisible} onClose = {() => setModalVisible(false)}/>
    </View>
  );
};

// Reward Items
const RewardItem = ({ image, onPress, wide }) => (
  <TouchableOpacity style = {[styles.rewardItem, wide && styles.wideItem]} onPress = {onPress}>
    <Image source = {image} style = {styles.rewardImage} resizeMode="contain"/>
  </TouchableOpacity>
);

// Reward Popups
const RewardPopup = ({ visible, onClose }) => (
  <Modal transparent visible = {visible} animationType="slide">
    <View style = {styles.modalOverlay}>
    <LinearGradient colors={["#A0004D", "#000000"]} style = {styles.modalContainer}>
      <TouchableOpacity onPress = {onClose} style = {styles.closeButton}>
          <Ionicons name = "close" size = {28} color = "white"/>
        </TouchableOpacity>
        <Image source = {require("../assets/FVLOGO.png")} style = {styles.modalImage}/>
        <Text style = {styles.modalTitle}>2-Day XP Booster</Text>
        <View style = {styles.modalCoinRow}>
          <Text style = {styles.modalCoinText}>100</Text>
          <View style = {styles.modalCoinBadge}>
            <Text style = {styles.modalCoinBadgeText}>Fv</Text>
            </View>
          </View>
        <Text style = {styles.modalText}>
        Supercharge your progress with this 2-day XP Booster! Earn double XP for the next 48 hours on challenges, leveling up faster and unlocking rewards in no time. Don't miss this chance to maximize your gains—activate now and make every action count! 🚀🔥
        </Text>
        <TouchableOpacity style = {styles.purchaseButton} onPress = {onClose}>
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
    paddingRight: 29, 
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  coinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  coinBadgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  coinRow: {
    flexDirection: "row",
    alignSelf: "flex-end",
    justifyContent: "space-between",
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
    height: 96,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#87005c",
  },
  wideItem: {
    width: "100%",
    height: 120,
  },
  rewardImage: {
    width: "80%",
    height: "80%",
  },
  viewMore: {
    width: "40%",
    height: 40,
    backgroundColor: "#292929",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
  },
  viewMoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  // popup modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalCoinText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 5,
  },
  modalCoinBadge: {
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  modalCoinBadgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalCoinRow: {
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-between",
  },
  modalContainer: {
    padding: 80,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    paddingBottom: 40,
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
  modalText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
  purchaseButton: {
    backgroundColor: "",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  purchaseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 16
  },
});

export default RewardsScreen;

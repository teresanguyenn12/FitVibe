import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebase";
import { getFitCoins, updateFitCoins } from "../api/fitCoinsApi";
import { doc, onSnapshot } from "firebase/firestore";
import { useTheme } from "../contexts/ThemeContext";

const RewardsScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [fitCoins, setFitCoins] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const user = auth.currentUser;
  const { theme } = useTheme(); // Get theme from context

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
  const openRewardModal = (cost, image, description) => {
    setSelectedReward({ cost, image, description });
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Rewards</Text>
        <View style={styles.coinContainer}>
          <Text style={[styles.coinText, { color: theme.text }]}>{fitCoins}</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinBadgeText}>Fv</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* FitCoin Shop Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>FitCoin Shop</Text>
        <View style={styles.grid}>
          <RewardItem image={require("../assets/FVLOGO.png")} cost={100} description="Supercharge your progress with the 2x XP Booster! This powerful item doubles the experience points you earn for a limited time, helping you level up faster and unlock rewards more quickly!" onPress={openRewardModal}/>
          <RewardItem image={require("../assets/rewards/FVProteinBar.jpg")} cost={200} description="Fuel your body with a Protein Bar, a convenient, high-protein snack to keep you energized throughout your day! Whether you're working out, on the go, or simply need a quick snack, this bar provides essential nutrients to help support muscle recovery and overall wellness." onPress={openRewardModal}/>
          <RewardItem image={require("../assets/rewards/FVTowel.jpg")} cost={300} description="Stay fresh and dry with a soft, absorbent towel! Ideal for use during workouts, sports activities, or at the gym, this towel ensures you stay comfortable and clean while pushing your limits. " onPress={openRewardModal}/>
          <RewardItem image={require("../assets/rewards/FVProteinBottleShaker.jpg")} cost={400} description="Mix your protein shakes with ease using the Protein Bottle Shaker! Designed for convenience and efficiency, this shaker helps you blend your protein powder smoothly and quickly, making sure you get the perfect consistency every time." onPress={openRewardModal}/>
        </View>

        {/* Featured Brands */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Brands</Text>
        <View style={styles.grid}>
          <RewardItem image={require("../assets/rewards/OptimumNutrition.jpg")} cost={500} description="Get 50% off on high-quality protein, this Protein Powder is your go-to supplement for muscle recovery, growth, and overall fitness. Whether you're looking to boost your performance or simply maintain a balanced diet, this powder is an easy way to get the nutrients your body needs to thrive." onPress={openRewardModal}/>
          <RewardItem image={require("../assets/rewards/RedBull.jpg")} cost={600} description="Boost your energy and focus with a pack of Redbull! Perfect for when you need a quick pick-me-up or a burst of energy to power through a workout, study session, or long day. Redbull's refreshing taste and energizing formula keep you alert and active when you need it most." onPress={openRewardModal}/>
          <RewardItem image={require("../assets/rewards/HelloFresh.png.webp")} cost={800} description="Take the stress out of meal prep and get 50% off your first order with Hello Fresh! Enjoy healthy, delicious, and easy-to-make meals delivered right to your door. With a variety of recipes to choose from, each meal kit comes with pre-portioned ingredients and simple instructions, making cooking at home quick and fun." onPress={openRewardModal}/>
          <RewardItem image={require("../assets/rewards/NewBalance.png")} cost={1000} description="Step into comfort and performance with 50% off on select New Balance products. Known for their quality craftsmanship and innovative design, New Balance shoes provide the support and durability you need for everyday activities or intense workouts." onPress={openRewardModal}/>
        </View>
      </ScrollView>

      {/* Reward Popup */}
      <RewardPopup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPurchase={handlePurchase}
        selectedReward={selectedReward}
        theme={theme}
      />
    </View>
  );
};

// Reward Items
const RewardItem = ({ image, cost, description, onPress }) => (
  <TouchableOpacity style={styles.rewardItem} onPress={() => onPress(cost, image, description)}>
    <Image source={image} style={styles.rewardImage} resizeMode="cover"/>
  </TouchableOpacity>
);

// Reward Popup Modal
const RewardPopup = ({ visible, onClose, onPurchase, selectedReward, theme }) => (
  <Modal transparent visible={visible} animationType="slide">
    <View style={styles.modalOverlay}>
      <LinearGradient colors={["#A0004D", "#000000"]} style={styles.modalContainer}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Image source={selectedReward?.image} style={styles.modalImage} resizeMode="contain" />
        <Text style={[styles.modalTitle, { color: theme.text }]}>Reward</Text>
        <View style={styles.coinContainer}>
          <Text style={[styles.modalCoinText, { color: theme.text }]}>{selectedReward?.cost}</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinBadgeText}>Fv</Text>
          </View>
        </View>
        <Text style={[styles.modalText, { color: theme.text }]}>{selectedReward?.description}</Text>
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={() => onPurchase(selectedReward?.cost)}
        >
          <Text style={styles.purchaseButtonText}>Purchase</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  </Modal>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    position: "absolute",
    right: "36%",
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinText: {
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
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  costText: {
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
    marginBottom: 10,
  },
  modalCoinText: {
    fontSize: 16,
    marginRight: 4,
  },
  modalText: {
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
  backButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 16,
  },
});

export default RewardsScreen;
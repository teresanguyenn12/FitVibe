import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const RewardsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={styles.coinContainer} />
      </View>

      <ScrollView>
        {/* FitCoin Shop Section */}
        <Text style={styles.sectionTitle}>FitCoin Shop</Text>
        <View style={styles.coinRow}>
        <Text style={styles.coinText}>1000 FitCoins</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinBadgeText}>Fv</Text>
          </View>
        </View>
        <View style={styles.grid}>
          <RewardItem image={require("../assets/FVLOGO.png")} />
          <RewardItem image={require("../assets/FVLOGO.png")} />
          <RewardItem image={require("../assets/FVLOGO.png")} />
          <RewardItem image={require("../assets/FVLOGO.png")} />
          <RewardItem image={require("../assets/FVLOGO.png")} />
          <RewardItem image={require("../assets/FVLOGO.png")} />

          <TouchableOpacity style={styles.viewMore}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Brands */}
        <Text style={styles.sectionTitle}>Featured Brands</Text>
        <View style={styles.grid}>
          <RewardItem image={require("../assets/FVLOGO.png")} />
          <RewardItem image={require("../assets/FVLOGO.png")} />
          <RewardItem image={require("../assets/FVLOGO.png")} wide />
        </View>
      </ScrollView>
    </View>
  );
};

// Reward Item Component
const RewardItem = ({ image, wide }) => (
  <View style={[styles.rewardItem, wide && styles.wideItem]}>
    <Image source={image} style={styles.rewardImage} resizeMode="contain" />
  </View>
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
    height: 80,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
});

export default RewardsScreen;
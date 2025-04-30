import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Animated, { useSharedValue, withSpring, useAnimatedProps } from "react-native-reanimated";
import { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import MaskedView from "@react-native-masked-view/masked-view";
import Svg from "react-native-svg";

const { width } = Dimensions.get("window");
const RING_SIZE = width * 0.55;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const getLevel = (xp) => Math.floor(xp / 1000);
const getMaxXPForLevel = (level) => level * 1000;
const getRankInfo = (level) => {
  const prestige = Math.floor((level) / 10);
  switch (prestige) {
    case 0: return { 
      name: "Prestige 0: Rookie", 
      image: require("../assets/rookie.png") 
    };
    case 1: return { 
      name: "Prestige 1: Competitor", 
      image: require("../assets/competitor.png") 
    };
    case 2: return { 
      name: "Prestige 2: Warrior", 
      image: require("../assets/warrior.png") 
    };
    case 3: return { 
      name: "Prestige 3: Elite", 
      image: require("../assets/elite.png") 
    };
    case 4: return { 
      name: "Prestige 4: Titan", 
      image: require("../assets/titan.png") 
    };
    default: return { 
      name: "Prestige 5: Master", 
      image: require("../assets/master.png") 
    };
  }
};

const CurrentProgressionScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [currentXP, setCurrentXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [maxXP, setMaxXP] = useState(200);
  const [rankInfo, setRankInfo] = useState({ 
    name: "Rookie", 
    image: require("../assets/rookie.png") 
  });
  const progress = useSharedValue(0);

  useEffect(() => {
    const fetchXP = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const xp = userDoc.data()?.xp || 0;
        const userLevel = getLevel(xp);
        const userMaxXP = getMaxXPForLevel(userLevel);
        const userRankInfo = getRankInfo(userLevel);

        setCurrentXP(xp);
        setLevel(userLevel);
        setMaxXP(userMaxXP);
        setRankInfo(userRankInfo);
        
        const newProgress = xp % 1000 / 1000;
        progress.value = withSpring(newProgress, {
          damping: 20,
          stiffness: 90
        });
      }
    };

    fetchXP();
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });
  const currentLevelXP = currentXP % 1000;

  return (
    <View style = {[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style = {styles.backButton} onPress = {() => navigation.navigate("HomeTabs")}>
        <Ionicons name = "close" size = {28} color = {theme.text} />
      </TouchableOpacity>

      <Text style = {[styles.header, { color: theme.text }]}>Progression</Text>
      <Text style = {[styles.subtext, { color: theme.text }]}>
        Current XP: <Text style = {{ color: "#A0004D" }}>{currentLevelXP}/1000</Text>
      </Text>

      <View style = {styles.ringContainer}>
        <Svg width = {RING_SIZE} height = {RING_SIZE} style = {styles.ringSvg}>
          <Circle
            cx = {RING_SIZE / 2}
            cy = {RING_SIZE / 2}
            r = {RADIUS}
            stroke = "#E0E0E0"
            strokeWidth = {STROKE_WIDTH}
            fill = "transparent"
          />
          
          <Defs>
            <SvgLinearGradient id = "gradient" x1 = "0" y1 = "0" x2 = "100%" y2 = "0">
              <Stop offset = "0" stopColor = "#A0004D" />
              <Stop offset = "1" stopColor = "#B76DF5" />
            </SvgLinearGradient>
          </Defs>
          
          <AnimatedCircle
            cx = {RING_SIZE / 2}
            cy = {RING_SIZE / 2}
            r = {RADIUS}
            stroke = "url(#gradient)"
            strokeWidth = {STROKE_WIDTH}
            strokeLinecap = "round"
            fill = "transparent"
            strokeDasharray = {CIRCUMFERENCE}
            animatedProps = {animatedProps}
            rotation = "-90"
            originX = {RING_SIZE / 2}
            originY = {RING_SIZE / 2}
          />
        </Svg>

        <View style = {styles.ringContent}>
          <Image source = {rankInfo.image} style = {styles.iconImage}/>
        </View>
      </View>

      <MaskedView
        maskElement = {
          <Text style = {[styles.rankText, { backgroundColor: "transparent" }]}>
           {rankInfo.name}
          </Text>
        }>
        <LinearGradient
          colors = {["#A0004D", "#B76DF5"]}
          start = {{ x: 0, y: 0 }}
          end = {{ x: 1, y: 0 }}>
          <Text style = {[styles.rankText, { opacity: 0 }]}>
            {rankInfo.name}
          </Text>
        </LinearGradient>
      </MaskedView>

      <Text style = {styles.levelText}>Level {level}</Text>

      <TouchableOpacity onPress = {() => navigation.navigate("ProgressionInfo")}>
        <LinearGradient
          colors = {["#00C6FB", "#005BEA"]}
          start = {{ x: 0, y: 0 }}
          end = {{ x: 1, y: 0 }}
          style = {styles.infoButton}
        >
          <Text style = {styles.infoButtonText}>Progression Information</Text>
          <Ionicons name = "information-circle" size = {20} color = "white" style = {styles.infoIcon}/>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    padding: 10,
    borderRadius: 10,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtext: {
    fontSize: 16,
    marginBottom: 30,
  },
  ringContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  ringSvg: {
    transform: [{ rotate: "-90deg"}],
  },
  ringContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 180,
    height: 180,
    borderRadius: RING_SIZE * 0.2, 
  },
  rankGradient: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#FF0080",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  rankText: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelText: {
    color: "#00C6FB",
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 20,
  },
  infoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    shadowColor: "#005BEA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  infoButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  infoIcon: {
    marginLeft: 5,
  },
});

export default CurrentProgressionScreen;
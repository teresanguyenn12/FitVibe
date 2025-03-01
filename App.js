import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { AuthProvider, useAuth } from "./authProvider";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChallengeScreen from "./screens/ChallengeScreen"; 
import FeedScreen from "./screens/FeedScreen"; 
import StartWorkoutScreen from "./screens/StartWorkoutScreen"; 
import MyWorkoutScreen from "./screens/MyWorkoutScreen"; 
import RewardsScreen from "./screens/RewardsScreen"; 
import ProgressionScreen from "./screens/ProgressionScreen"; 
import SignupScreen from "./screens/SignupScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let IconComponent = Ionicons;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Challenges") {
            iconName = "sword-cross";
            IconComponent = MaterialCommunityIcons;
          } else if (route.name === "Feed") {
            iconName = "camera";
            IconComponent = Entypo;
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: "#121212" },
        tabBarActiveTintColor: "#8e24aa",
        tabBarInactiveTintColor: "#bbb",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Challenges" component={ChallengeScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8e24aa" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="HomeTabs" component={BottomTabs} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="StartWorkout" component={StartWorkoutScreen} />
            <Stack.Screen name="MyWorkouts" component={MyWorkoutScreen} />
            <Stack.Screen name="Rewards" component={RewardsScreen} />
            <Stack.Screen name="Progression" component={ProgressionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "TiltWarp-Regular": require("./assets/TiltWarp-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8e24aa" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

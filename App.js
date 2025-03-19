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
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChallengeScreen from "./screens/ChallengeScreen"; 
import FeedScreen from "./screens/FeedScreen"; 
import StartWorkoutScreen from "./screens/StartWorkoutScreen"; 
import MyWorkoutScreen from "./screens/MyWorkoutScreen"; 
import RewardsScreen from "./screens/RewardsScreen"; 
import ProgressionScreen from "./screens/ProgressionScreen"; 
import SignupScreen from "./screens/SignupScreen";
import GoalsScreen from "./screens/GoalsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MyChallengesScreen from "./screens/MyChallengesScreen";
import InviteFriendsScreen from "./screens/InviteFriendsScreen";
import ChallengeDetailsScreen from "./screens/ChallengeDetailsScreen";
import ChallengeProgressScreen from "./screens/ChallengeProgressScreen";
import JoinChallengesScreen from "./screens/JoinChallengesScreen";
import * as SettingsScreens from "./screens/settings";


import CompletedChallengeDetails from "./screens/CompletedChallengeDetails";
import AddFriendsScreen from "./screens/AddFriendsScreen";
import FriendsScreen from "./screens/FriendsScreen";




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
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="HomeTabs" component={BottomTabs} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="StartWorkout" component={StartWorkoutScreen} />
            <Stack.Screen name="MyWorkouts" component={MyWorkoutScreen} />
            <Stack.Screen name="Rewards" component={RewardsScreen} />
            <Stack.Screen name="Progression" component={ProgressionScreen} />
            <Stack.Screen name="Goals" component={GoalsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="MyChallenges" component={MyChallengesScreen} />
            <Stack.Screen name="InviteFriends" component={InviteFriendsScreen} />
            <Stack.Screen name="ChallengeDetails" component={ChallengeDetailsScreen} />
            <Stack.Screen name="ChallengeProgress" component={ChallengeProgressScreen} />
            <Stack.Screen name="JoinChallenges" component={JoinChallengesScreen} />
            
            <Stack.Screen name="ActivityTracking" component={SettingsScreens.ActivityTracking} />
            <Stack.Screen name="ConnectedApps" component={SettingsScreens.ConnectedApps} />
            <Stack.Screen name="ConnectedDevices" component={SettingsScreens.ConnectedDevices} />
            <Stack.Screen name="DeleteAccount" component={SettingsScreens.DeleteAccount} />
            <Stack.Screen name="HelpCenter" component={SettingsScreens.HelpCenter} />
            <Stack.Screen name="LanguageSettings" component={SettingsScreens.LanguageSettings} />
            <Stack.Screen name="LogoutScreen" component={SettingsScreens.LogoutScreen} />
            <Stack.Screen name="NotificationSettings" component={SettingsScreens.NotificationSettings} />
            <Stack.Screen name="PrivacyPolicy" component={SettingsScreens.PrivacyPolicy} />
            <Stack.Screen name="PrivacySettings" component={SettingsScreens.PrivacySettings} />
            <Stack.Screen name="ProfileSettings" component={SettingsScreens.ProfileSettings} />
            <Stack.Screen name="ReportProblem" component={SettingsScreens.ReportProblem} />
            <Stack.Screen name="ThemeSettings" component={SettingsScreens.ThemeSettings} />
            <Stack.Screen name="UnitsSettings" component={SettingsScreens.UnitsSettings} />
            <Stack.Screen name="CompletedChallengeDetails" component={CompletedChallengeDetails} />
            <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
            <Stack.Screen name="AddFriendsScreen" component={AddFriendsScreen} />
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

import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { AuthProvider, useAuth } from "./authProvider";
import { ThemeProvider, ThemeContext } from "./contexts/ThemeContext.js";

import LoginScreen from "./screens/LoginScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import FeedScreen from "./screens/FeedScreen";
import StartWorkoutScreen from "./screens/StartWorkoutScreen";
import CardioScreen from "./screens/CardioScreen";
import CyclingScreen from "./screens/CyclingScreen";
import HikingScreen from "./screens/HikingScreen";
import PilatesScreen from "./screens/PilatesScreen";
import StrengthTrainingScreen from "./screens/StrengthTrainingScreen";
import SwimmingScreen from "./screens/SwimmingScreen";
import YogaScreen from "./screens/YogaScreen";
import MyWorkoutScreen from "./screens/MyWorkoutScreen";
import RewardsScreen from "./screens/RewardsScreen";
import ProgressionScreen from "./screens/ProgressionScreen";
import SignupScreen from "./screens/SignupScreen";
import GoalsScreen from "./screens/GoalsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import * as SettingsScreens from "./screens/settings";
import * as ChallengeScreens from "./screens/challenges";

import FriendsListScreen from "./screens/FriendsListScreen";
import AddFriendsScreen from "./screens/AddFriendsScreen";
import FriendsScreen from "./screens/FriendsScreen";
import InviteFriendsScreen from "./screens/InviteFriendsScreen";
import AddPostsScreen from "./screens/AddPostsScreen";
import MessagesScreen from "./screens/MessagesScreen";
import NewMessageScreen from "./screens/NewMessageScreen";
import ChatScreen from "./screens/ChatScreen";
import CommentsScreen from './screens/CommentsScreen';


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
      <Tab.Screen name="Challenges" component={ChallengeScreens.ChallengeScreen}/>
      <Tab.Screen name="Feed" component={FeedScreen} />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user, isLoading } = useAuth();
  const { theme } = React.useContext(ThemeContext); // Use theme from context

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8e24aa" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
          </>
        ) : (
          <>
            {/*  Main App Screens */}
            <Stack.Screen name="HomeTabs" component={BottomTabs} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="StartWorkout" component={StartWorkoutScreen} />
            <Stack.Screen name="Cardio" component={CardioScreen} />
            <Stack.Screen name="Cycling" component={CyclingScreen} />
            <Stack.Screen name="Hiking" component={HikingScreen} />
            <Stack.Screen name="Pilates" component={PilatesScreen} />
            <Stack.Screen name="StrengthTraining" component={StrengthTrainingScreen}/>
            <Stack.Screen name="Swimming" component={SwimmingScreen} />
            <Stack.Screen name="Yoga" component={YogaScreen} />
            <Stack.Screen name="MyWorkouts" component={MyWorkoutScreen} />
            <Stack.Screen name="Rewards" component={RewardsScreen} />
            <Stack.Screen name="Progression" component={ProgressionScreen} />
            <Stack.Screen name="Goals" component={GoalsScreen} />

            {/*  Challenges Screens */}
            <Stack.Screen name="Challenges" component={ChallengeScreens.ChallengeScreen} />
            <Stack.Screen name="ChallengeDetails" component={ChallengeScreens.ChallengeDetailsScreen} />
            <Stack.Screen name="ChallengeProgress" component={ChallengeScreens.ChallengeProgressScreen} />
            <Stack.Screen name="JoinChallenges" component={ChallengeScreens.JoinChallengesScreen} />
            <Stack.Screen name="CompletedChallengeDetails" component={ChallengeScreens.CompletedChallengeDetails} />
            <Stack.Screen name="ConfirmChallengeScreen" component={ChallengeScreens.ConfirmChallengeScreen} />
            <Stack.Screen name="MyChallengesScreen" component={ChallengeScreens.MyChallengesScreen} />
            <Stack.Screen name="MyChallengeInfoScreen" component={ChallengeScreens.MyChallengeInfoScreen} />
            <Stack.Screen name="ConfirmSoloChallengeScreen" component={ChallengeScreens.ConfirmSoloChallengeScreen} />
            <Stack.Screen name="RunChallengeProgressScreen" component={ChallengeScreens.RunChallengeProgressScreen}/>
            <Stack.Screen name="WalkConfirmSoloChallenge" component={ChallengeScreens.WalkConfirmSoloChallengeScreen} />
            <Stack.Screen name="YogaConfirmSoloChallenge" component={ChallengeScreens.YogaConfirmSoloChallengeScreen} />
            <Stack.Screen name="LiftingConfirmSoloChallenge" component={ChallengeScreens.LiftingConfirmSoloChallengeScreen} />
            <Stack.Screen name="CyclingConfirmSoloChallenge" component={ChallengeScreens.CyclingConfirmSoloChallengeScreen} />
            <Stack.Screen name="WalkChallengeProgressScreen" component={ChallengeScreens.WalkChallengeProgressScreen} />
            <Stack.Screen name="YogaChallengeProgressScreen" component={ChallengeScreens.YogaChallengeProgressScreen} />
            <Stack.Screen name="LiftingChallengeProgressScreen" component={ChallengeScreens.LiftingChallengeProgressScreen} />
            <Stack.Screen name="CyclingChallengeProgressScreen" component={ChallengeScreens.CyclingChallengeProgressScreen} />
             

            {/* Settings Screens */}
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="ActivityTracking"
              component={SettingsScreens.ActivityTracking}
            />
            <Stack.Screen
              name="ConnectedApps"
              component={SettingsScreens.ConnectedApps}
            />
            <Stack.Screen
              name="ConnectedDevices"
              component={SettingsScreens.ConnectedDevices}
            />
            <Stack.Screen
              name="DeleteAccount"
              component={SettingsScreens.DeleteAccount}
            />
            <Stack.Screen
              name="HelpCenter"
              component={SettingsScreens.HelpCenter}
            />
            <Stack.Screen
              name="LanguageSettings"
              component={SettingsScreens.LanguageSettings}
            />
            <Stack.Screen
              name="LogoutScreen"
              component={SettingsScreens.LogoutScreen}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={SettingsScreens.NotificationSettings}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={SettingsScreens.PrivacyPolicy}
            />
            <Stack.Screen
              name="PrivacySettings"
              component={SettingsScreens.PrivacySettings}
            />
            <Stack.Screen
              name="ProfileSettings"
              component={SettingsScreens.ProfileSettings}
            />
            <Stack.Screen
              name="ReportProblem"
              component={SettingsScreens.ReportProblem}
            />
            <Stack.Screen
              name="ThemeSettings"
              component={SettingsScreens.ThemeSettings}
            />
            <Stack.Screen
              name="UnitsSettings"
              component={SettingsScreens.UnitsSettings}
            />
            <Stack.Screen
              name="BlockedUsers"
              component={SettingsScreens.BlockedUsers}
            />

            <Stack.Screen name="FAQ" component={SettingsScreens.FAQ} />

            <Stack.Screen
              name="ContactSupport"
              component={SettingsScreens.ContactSupport}
            />
            <Stack.Screen
              name="TermsOfService"
              component={SettingsScreens.TermsOfService}
            />
            <Stack.Screen
              name="CommunityGuidelines"
              component={SettingsScreens.CommunityGuidelines}
            />
            <Stack.Screen
              name="Troubleshooting"
              component={SettingsScreens.Troubleshooting}
            />

            {/*  Friends & Social Screens */}
            <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
            <Stack.Screen
              name="AddFriends"
              component={AddFriendsScreen}
            />
            <Stack.Screen
              name="FriendsList"
              component={FriendsListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddPostsScreen"
                component={AddPostsScreen}
            />
            <Stack.Screen
                name="MessagesScreen"
                component={MessagesScreen}
            />
            <Stack.Screen
                name="NewMessageScreen"
                component={NewMessageScreen}
            />
            <Stack.Screen
                name="ChatScreen"
                component={ChatScreen}
            />
            <Stack.Screen name="CommentsScreen" component={CommentsScreen} options={{ title: 'Comments' }} />

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
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </AuthProvider>
  );
}

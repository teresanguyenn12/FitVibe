import React, { useEffect, useState } from 'react';
import {
    View,
    ActivityIndicator,
    Platform,
    Text,
    StyleSheet,
} from "react-native";
import { TransitionSpecs, createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { AuthProvider, useAuth } from "./authProvider";
import { ThemeProvider, ThemeContext } from "./contexts/ThemeContext.js";
import { UserSignUpProvider } from "./contexts/UserSignUpContext";
import { BlurView } from "expo-blur";
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from "react-native-reanimated";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import LoginScreen from "./screens/LoginScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import * as SignupScreens from "./screens/signup";
import * as SettingsScreens from "./screens/settings";
import * as ChallengeScreens from "./screens/challenges";

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
import CurrentProgressionScreen from "./screens/CurrentProgressionScreen";
import GoalsScreen from "./screens/GoalsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import FriendsListScreen from "./screens/FriendsListScreen";
import AddFriendsScreen from "./screens/AddFriendsScreen";
import FriendsScreen from "./screens/FriendsScreen";
import InviteFriendsScreen from "./screens/InviteFriendsScreen";
import AddPostsScreen from "./screens/AddPostsScreen";
import MessagesScreen from "./screens/MessagesScreen";
import NewMessageScreen from "./screens/NewMessageScreen";
import ChatScreen from "./screens/ChatScreen";
import CommentsScreen from "./screens/CommentsScreen";
import OtherProfileScreen from "./screens/OtherProfileScreen";
import OtherFriendsListScreen from "./screens/OtherFriendsListScreen";
import PostDetailScreen from "./screens/PostDetailScreen";
import EditPostScreen from './screens/EditPostScreen';
import NotificationScreen from "./screens/NotificationScreen";
import SplashScreen from "./screens/SplashScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function CustomTabBarBackground() {
    return <BlurView intensity={60} tint="dark" style={styles.blurContainer} />;
}

function AnimatedTabIcon({ children }) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const handlePressIn = () => (scale.value = withSpring(0.9));
    const handlePressOut = () => (scale.value = withSpring(1));

    return (
        <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={animatedStyle}>{children}</Animated.View>
        </TouchableWithoutFeedback>
    );
}

function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName;
                    let IconComponent = Ionicons;

                    if (route.name === "Home") iconName = "home";
                    else if (route.name === "Search") iconName = "search-outline";
                    else if (route.name === "Challenges") {
                        iconName = "sword-cross";
                        IconComponent = MaterialCommunityIcons;
                    } else if (route.name === "Feed") {
                        iconName = "camera";
                        IconComponent = Entypo;
                    }

                    return (
                        <AnimatedTabIcon>
                            <IconComponent
                                name={iconName}
                                size={size}
                                color={focused ? "#fff" : color}
                            />
                        </AnimatedTabIcon>
                    );
                },
                tabBarLabel: ({ focused, color }) => (
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: focused ? "#fff" : color,
                            textAlign: "center",
                            minWidth: 60,
                        }}
                    >
                        {route.name}
                    </Text>
                ),
                tabBarStyle: {
                    position: "absolute",
                    backgroundColor: "transparent",
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    overflow: "hidden",
                    height: Platform.OS === "ios" ? 90 : 70,
                },
                tabBarBackground: () => (
                    <BlurView
                        tint="dark"
                        intensity={45}
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(28,28,30,0.6)",
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                        }}
                    />
                ),
                headerShown: false,
                animationEnabled: true,
                tabBarHideOnKeyboard: true,
            })}
            sceneContainerStyle={{ backgroundColor: "#111" }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={AddFriendsScreen} />
            <Tab.Screen name="Feed" component={FeedScreen} />
            <Tab.Screen
                name="Challenges"
                component={ChallengeScreens.ChallengeScreen}
            />
        </Tab.Navigator>
    );
}

function SignUpFlow() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={SignupScreens.WelcomeScreen} />
            <Stack.Screen name="Name" component={SignupScreens.NameScreen} />
            <Stack.Screen name="Username" component={SignupScreens.UsernameScreen} />
            <Stack.Screen
                name="DateOfBirth"
                component={SignupScreens.DateOfBirthScreen}
            />
            <Stack.Screen name="Gender" component={SignupScreens.GenderScreen} />
            <Stack.Screen name="Phone" component={SignupScreens.PhoneScreen} />
            <Stack.Screen name="Email" component={SignupScreens.EmailScreen} />
            <Stack.Screen name="Password" component={SignupScreens.PasswordScreen} />
            <Stack.Screen
                name="ProfilePicture"
                component={SignupScreens.ProfilePictureScreen}
            />
            <Stack.Screen name="Review" component={SignupScreens.ReviewScreen} />
        </Stack.Navigator>
    );
}

function Navigation() {
    const { user, isLoading } = useAuth();
    const { theme } = React.useContext(ThemeContext);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    // Show splash screen while it's active
    if (showSplash || isLoading) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <UserSignUpProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {!user ? (
                        <>
                            <Stack.Screen name="Login" component={LoginScreen} />
                            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                            <Stack.Screen name="SignUpFlow" component={SignUpFlow} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="HomeTabs" component={BottomTabs} />
                            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                            <Stack.Screen name="Settings" component={SettingsScreen} />
                            <Stack.Screen
                                name="ThemeSettings"
                                component={SettingsScreens.ThemeSettings}
                            />
                            <Stack.Screen
                                name="LanguageSettings"
                                component={SettingsScreens.LanguageSettings}
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
                                name="DeleteAccount"
                                component={SettingsScreens.DeleteAccount}
                            />
                            <Stack.Screen
                                name="LogoutScreen"
                                component={SettingsScreens.LogoutScreen}
                            />
                            <Stack.Screen
                                name="BlockedUsers"
                                component={SettingsScreens.BlockedUsers}
                            />
                            <Stack.Screen
                                name="HelpCenter"
                                component={SettingsScreens.HelpCenter}
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
                            <Stack.Screen
                                name="ReportProblem"
                                component={SettingsScreens.ReportProblem}
                            />
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
                                name="UnitsSettings"
                                component={SettingsScreens.UnitsSettings}
                            />
                            <Stack.Screen
                                name="StartWorkout"
                                component={StartWorkoutScreen}
                            />
                            <Stack.Screen name="Cardio" component={CardioScreen} />
                            <Stack.Screen name="Cycling" component={CyclingScreen} />
                            <Stack.Screen name="Hiking" component={HikingScreen} />
                            <Stack.Screen name="Pilates" component={PilatesScreen} />
                            <Stack.Screen
                                name="StrengthTraining"
                                component={StrengthTrainingScreen}
                            />
                            <Stack.Screen name="Swimming" component={SwimmingScreen} />
                            <Stack.Screen name="Yoga" component={YogaScreen} />
                            <Stack.Screen name="MyWorkouts" component={MyWorkoutScreen} />
                            <Stack.Screen name="Rewards" component={RewardsScreen} />
                            <Stack.Screen
                                name="Progression"
                                component={CurrentProgressionScreen}
                            />
                            <Stack.Screen
                                name="ProgressionInfo"
                                component={ProgressionScreen}
                            />
                            <Stack.Screen name="Goals" component={GoalsScreen} />
                            <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
                            <Stack.Screen
                                name="NewMessageScreen"
                                component={NewMessageScreen}
                            />
                            <Stack.Screen name="ChatScreen" component={ChatScreen} />
                            <Stack.Screen name="AddFriends" component={AddFriendsScreen} />
                            <Stack.Screen name="FriendsList" component={FriendsListScreen} />
                            <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
                            <Stack.Screen
                                name="OtherProfile"
                                component={OtherProfileScreen}
                            />
                            <Stack.Screen
                                name="OtherFriendsList"
                                component={OtherFriendsListScreen}
                            />
                            <Stack.Screen name="AddPostsScreen" component={AddPostsScreen} />
                            <Stack.Screen
                                name="PostDetailScreen"
                                component={PostDetailScreen}
                            />
                            <Stack.Screen name="CommentsScreen" component={CommentsScreen} />
                            <Stack.Screen
                                name="InviteFriendsScreen"
                                component={InviteFriendsScreen}
                            />
                            <Stack.Screen
                                name="ChallengeDetails"
                                component={ChallengeScreens.ChallengeDetailsScreen}
                            />
                            <Stack.Screen
                                name="JoinChallenges"
                                component={ChallengeScreens.JoinChallengesScreen}
                            />
                            <Stack.Screen
                                name="MyChallengesScreen"
                                component={ChallengeScreens.MyChallengesScreen}
                            />
                            <Stack.Screen
                                name="MyChallengeInfoScreen"
                                component={ChallengeScreens.MyChallengeInfoScreen}
                            />
                            <Stack.Screen
                                name="RunConfirmSoloChallenge"
                                component={ChallengeScreens.RunConfirmSoloChallenge}
                            />
                            <Stack.Screen
                                name="RunChallengeProgressScreen"
                                component={ChallengeScreens.RunChallengeProgressScreen}
                            />
                            <Stack.Screen
                                name="WalkConfirmSoloChallenge"
                                component={ChallengeScreens.WalkConfirmSoloChallengeScreen}
                            />
                            <Stack.Screen
                                name="YogaConfirmSoloChallenge"
                                component={ChallengeScreens.YogaConfirmSoloChallengeScreen}
                            />
                            <Stack.Screen
                                name="LiftingConfirmSoloChallenge"
                                component={ChallengeScreens.LiftingConfirmSoloChallengeScreen}
                            />
                            <Stack.Screen
                                name="CyclingConfirmSoloChallenge"
                                component={ChallengeScreens.CyclingConfirmSoloChallengeScreen}
                            />
                            <Stack.Screen
                                name="WalkChallengeProgressScreen"
                                component={ChallengeScreens.WalkChallengeProgressScreen}
                            />
                            <Stack.Screen
                                name="YogaChallengeProgressScreen"
                                component={ChallengeScreens.YogaChallengeProgressScreen}
                            />
                            <Stack.Screen
                                name="LiftingChallengeProgressScreen"
                                component={ChallengeScreens.LiftingChallengeProgressScreen}
                            />
                            <Stack.Screen
                                name="CyclingChallengeProgressScreen"
                                component={ChallengeScreens.CyclingChallengeProgressScreen}
                            />
                            <Stack.Screen
                                name="ChallengeCompletedScreen"
                                component={ChallengeScreens.ChallengeCompletedScreen}
                            />
                            <Stack.Screen
                                name="InviteFriendsQueueScreen"
                                component={ChallengeScreens.InviteFriendsQueueScreen}
                            />
                            <Stack.Screen
                                name="ChallengeChatScreen"
                                component={ChallengeScreens.ChallengeChatScreen}
                            />
                            <Stack.Screen
                                name="ChallengeCard"
                                component={ChallengeScreens.ChallengeCard}
                            />
                            <Stack.Screen name="EditPostScreen" component={EditPostScreen} />
                            <Stack.Screen
                                name="NotificationScreen"
                                component={NotificationScreen}
                            />
                        </>
                    )}
                </Stack.Navigator>
            </UserSignUpProvider>
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

const styles = StyleSheet.create({
    blurContainer: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: "hidden",
        backgroundColor: "rgba(19, 20, 23, 0.7)",
    },
});
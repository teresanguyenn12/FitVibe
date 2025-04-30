// themecontext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { Appearance, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState("automatic");
  const [isLoading, setIsLoading] = useState(true);

  // Theme color definitions
  const themeColors = {
    light: {
      mode: "light",
      background: "#FFFFFF",
      card: "#F5F5F5",
      text: "#000000",
      subtext: "#555555",
      border: "#E0E0E0",
      primary: "#8e24aa",
      headerBg: "#FFFFFF", // Keep header consistent
    },
    dark: {
      mode: "dark",
      background: "#131417",
      card: "#2B2D31",
      text: "#FFFFFF",
      subtext: "#AAAAAA",
      border: "#3A3D42",
      primary: "#8e24aa",
      headerBg: "#131417",
    },
  };

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@themeMode");
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem("@themeMode", themeMode);
    }
  }, [themeMode, isLoading]);

  // Listen for system theme changes when in automatic mode
  useEffect(() => {
    if (themeMode === "automatic") {
      // This will trigger a re-render when the system theme changes
    }
  }, [colorScheme, themeMode]);

  // Determine which theme to apply
  const currentTheme = themeMode === "automatic" ? colorScheme || "light" : themeMode;
  const theme = themeColors[currentTheme];

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setTheme: setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
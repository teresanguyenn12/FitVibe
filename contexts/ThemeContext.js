// contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useState("automatic");
  const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const getActualTheme = () => {
    return selectedTheme === "automatic" ? systemTheme || "light" : selectedTheme;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: getActualTheme(),
        setTheme: setSelectedTheme,
        selectedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

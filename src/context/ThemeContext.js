import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import lightTheme from '../themes/light';
import darkTheme from '../themes/dark';
import SettingsStorage from '../services/storage/SettingsStorage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState(deviceTheme === 'dark' ? darkTheme : lightTheme);
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
    }
  }, [deviceTheme, themeMode]);

  const loadThemePreference = async () => {
    const saved = await SettingsStorage.getThemePreference();
    if (saved) {
      setThemeMode(saved);
      if (saved === 'light') setTheme(lightTheme);
      else if (saved === 'dark') setTheme(darkTheme);
      else setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
    }
  };

  const toggleTheme = async (mode) => {
    setThemeMode(mode);
    await SettingsStorage.saveThemePreference(mode);
    if (mode === 'light') setTheme(lightTheme);
    else if (mode === 'dark') setTheme(darkTheme);
    else setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
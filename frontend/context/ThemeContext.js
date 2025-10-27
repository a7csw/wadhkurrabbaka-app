/**
 * Theme Context
 * 
 * Manages app theme (light/dark mode) and language preferences
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../utils/theme';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'ar'
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved preferences on app start
  useEffect(() => {
    loadThemePreferences();
  }, []);

  const loadThemePreferences = async () => {
    try {
      setLoading(true);
      
      // Load theme preference
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme) {
        const isDark = savedTheme === 'dark' || 
          (savedTheme === 'system' && systemColorScheme === 'dark');
        setIsDarkMode(isDark);
      } else {
        // Default to system preference
        setIsDarkMode(systemColorScheme === 'dark');
      }

      // Load language preference
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setLanguage(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      
      // Save preference
      await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setThemeMode = async (mode) => {
    try {
      let newIsDark;
      
      switch (mode) {
        case 'light':
          newIsDark = false;
          break;
        case 'dark':
          newIsDark = true;
          break;
        case 'system':
        default:
          newIsDark = systemColorScheme === 'dark';
          break;
      }
      
      setIsDarkMode(newIsDark);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error setting theme mode:', error);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage);
      setIsRTL(newLanguage === 'ar');
      
      // Save preference
      await AsyncStorage.setItem('appLanguage', newLanguage);
      
      // You might want to restart the app or reload translations here
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Update theme when system changes
  useEffect(() => {
    const checkSystemTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (!savedTheme || savedTheme === 'system') {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    };
    
    checkSystemTheme();
  }, [systemColorScheme]);

  // Get current theme object
  const getCurrentTheme = () => {
    return isDarkMode ? darkTheme : lightTheme;
  };

  // Get theme colors
  const getColors = () => {
    return getCurrentTheme().colors;
  };

  // Islamic color palette
  const islamicColors = {
    primary: '#2E8B57', // Sea Green
    secondary: '#DAA520', // Goldenrod
    accent: '#CD853F', // Peru
    background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    surface: isDarkMode ? '#2d2d2d' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#333333',
    textSecondary: isDarkMode ? '#cccccc' : '#666666',
    border: isDarkMode ? '#404040' : '#e0e0e0',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  };

  // Text styles based on language
  const getTextAlign = () => {
    return isRTL ? 'right' : 'left';
  };

  const getFlexDirection = () => {
    return isRTL ? 'row-reverse' : 'row';
  };

  // Common styles
  const commonStyles = {
    container: {
      flex: 1,
      backgroundColor: islamicColors.background,
    },
    card: {
      backgroundColor: islamicColors.surface,
      borderRadius: 12,
      padding: 16,
      margin: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    text: {
      color: islamicColors.text,
      textAlign: getTextAlign(),
    },
    arabicText: {
      fontFamily: 'NotoSansArabic-Regular', // You'll need to add Arabic fonts
      fontSize: 18,
      lineHeight: 28,
      textAlign: 'right',
      color: islamicColors.text,
    },
    button: {
      backgroundColor: islamicColors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  };

  const value = {
    // State
    isDarkMode,
    language,
    isRTL,
    loading,
    
    // Theme objects
    theme: getCurrentTheme(),
    colors: islamicColors,
    styles: commonStyles,
    
    // Actions
    toggleTheme,
    setThemeMode,
    changeLanguage,
    
    // Helpers
    getColors,
    getTextAlign,
    getFlexDirection,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

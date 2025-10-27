/**
 * وَاذْكُر رَبَّكَ - Theme Configuration
 * 
 * Premium Islamic theme with darker emerald green and gold accents
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Premium Islamic Color Palette
export const colors = {
  // Primary Colors - Darker Emerald Green
  primary: '#145A32',
  primaryLight: '#1E8449',
  primaryDark: '#0E3B1F',
  primaryGradientStart: '#145A32',
  primaryGradientEnd: '#0E3B1F',
  
  // Secondary Colors - Gold Accent
  secondary: '#D4AF37',
  secondaryLight: '#F4D03F',
  secondaryDark: '#B8860B',
  
  // Text Colors
  textPrimary: '#1E1E1E',
  textSecondary: '#5A5A5A',
  textLight: '#FFFFFF',
  textGold: '#D4AF37',
  
  // Background Colors
  background: '#FAF9F6', // Off-white
  backgroundDark: '#F5F5F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Status Colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Islamic Specific
  kaaba: '#2C3E50',
  gold: '#D4AF37',
  pearl: '#F8F8FF',
  
  // Gradient Colors
  gradientStart: '#145A32',
  gradientMiddle: '#1E8449',
  gradientEnd: '#27AE60',
  
  // Shadow Colors
  shadow: 'rgba(20, 90, 50, 0.25)',
  shadowDark: 'rgba(20, 90, 50, 0.4)',
};

// Light Theme Configuration
export const islamicTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    tertiary: colors.secondaryDark,
    
    surface: colors.surface,
    surfaceVariant: colors.backgroundDark,
    background: colors.background,
    
    onPrimary: colors.textLight,
    onSecondary: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onBackground: colors.textPrimary,
    
    error: colors.error,
    onError: colors.textLight,
    
    // Custom colors
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    gold: colors.gold,
  },
  roundness: 16,
  animation: {
    scale: 1.0,
  },
};

// Dark Theme Configuration (for future use)
export const islamicDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primary,
    secondary: colors.secondaryLight,
    secondaryContainer: colors.secondary,
    
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    background: '#121212',
    
    onPrimary: colors.textPrimary,
    onSecondary: colors.textPrimary,
    onSurface: colors.textLight,
    onBackground: colors.textLight,
    
    error: colors.error,
    gold: colors.gold,
  },
  roundness: 16,
};

// Spacing System
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography System
export const typography = {
  // Arabic Typography
  arabicLarge: {
    fontSize: 28,
    lineHeight: 42,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  arabicMedium: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '600',
    textAlign: 'right',
  },
  arabicBody: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'right',
  },
  
  // English Typography
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
};

// Shadow Styles for 3D Effect
export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};

// Card Styles with 3D Effect
export const cardStyles = {
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.medium,
  },
  feature: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.large,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  quote: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.medium,
  },
};

// Animation Presets
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { type: 'timing', duration: 600 },
  },
  slideUp: {
    from: { opacity: 0, translateY: 50 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'spring', damping: 15 },
  },
  scale: {
    from: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', damping: 12 },
  },
};

export default {
  colors,
  islamicTheme,
  islamicDarkTheme,
  spacing,
  typography,
  shadows,
  cardStyles,
  animations,
};
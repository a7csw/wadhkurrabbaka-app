import 'react-native-gesture-handler';
/**
 * وَاذْكُر رَبَّكَ - Wadhkurrabbaka
 * Remember Your Lord - Islamic Mobile App
 * 
 * A comprehensive Islamic app for daily adhkar, duas, prayer times, and more
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import AdhkarScreen from './screens/AdhkarScreen';
import AdhkarDetailScreen from './screens/AdhkarDetailScreen';
import DuasScreen from './screens/DuasScreen';
import DuasDetailScreen from './screens/DuasDetailScreen';
import PrayerTimesScreen from './screens/PrayerTimesScreen';
import QiblaScreen from './screens/QiblaScreen';
import TasbeehScreen from './screens/TasbeehScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import theme
import { islamicTheme } from './utils/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={islamicTheme}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#145A32', // Darker emerald green
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTitleAlign: 'center',
            headerShadowVisible: true,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              title: 'وَاذْكُر رَبَّكَ',
              headerShown: false // We'll create a custom header in HomeScreen
            }}
          />
          
          <Stack.Screen 
            name="Adhkar" 
            component={AdhkarScreen}
            options={{ 
              title: 'أذكار - Adhkar',
            }}
          />
          
          <Stack.Screen 
            name="AdhkarDetail" 
            component={AdhkarDetailScreen}
            options={({ route }) => ({ 
              title: route.params?.category?.titleEn || 'Adhkar Details',
            })}
          />
          
          <Stack.Screen 
            name="Duas" 
            component={DuasScreen}
            options={{ 
              title: 'دعاء - Duas',
            }}
          />
          
          <Stack.Screen 
            name="DuasDetail" 
            component={DuasDetailScreen}
            options={({ route }) => ({ 
              title: route.params?.category?.titleEn || 'Dua Details',
            })}
          />
          
          <Stack.Screen 
            name="PrayerTimes" 
            component={PrayerTimesScreen}
            options={{ 
              title: 'مواقيت الصلاة - Prayer Times',
            }}
          />
          
          <Stack.Screen 
            name="Qibla" 
            component={QiblaScreen}
            options={{ 
              title: 'القبلة - Qibla',
            }}
          />
          
          <Stack.Screen 
            name="Tasbeeh" 
            component={TasbeehScreen}
            options={{ 
              title: 'تسبيح - Tasbeeh',
            }}
          />
          
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              title: 'إعدادات - Settings',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
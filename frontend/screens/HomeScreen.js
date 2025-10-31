/**
 * وَاذْكُر رَبَّكَ - Home Screen
 * 
 * Main dashboard with dynamic Kaaba/Prophet Mosque backgrounds and prayer widget
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { View as MotiView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../utils/theme';
import { fetchPrayerTimes } from '../utils/apiUtils';
import { getCurrentLocation, getCityFromCoordinates } from '../utils/locationUtils';
import { calculateNextPrayer, getPrayerNameInArabic, getPrayerIcon } from '../utils/prayerWidgetUtils';
import PrayerWidget from '../components/PrayerWidget';
import { API_URLS } from '../config/api';

const { width, height } = Dimensions.get('window');

// Import local background images
const bg1 = require('../assets/backgrounds/bg1.jpg');
const bg2 = require('../assets/backgrounds/bg2.jpg');
const bg3 = require('../assets/backgrounds/bg3.jpg');

/**
 * Get rotating background image based on day of month
 * @returns {object} - Local image require statement
 */
const getRotatingBackground = () => {
  const images = [bg1, bg2, bg3];
  const dayOfMonth = new Date().getDate();
  const index = dayOfMonth % 3;
  return images[index];
};

const HomeScreen = ({ navigation }) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backgroundImage] = useState(getRotatingBackground());

  /**
   * Handle Find Mosque button press
   * Opens in-app Masjid Finder with Google Maps
   */
  const handleFindMosque = () => {
    console.log('🕌 [HomeScreen] Find Mosque button pressed');
    console.log('🗺️ [HomeScreen] Navigating to MasjidFinder screen...');
    navigation.navigate('MasjidFinder');
  };

  // Features list - includes Find Mosque
  const features = [
    {
      id: 1,
      icon: 'book-open-variant',
      arabicTitle: 'أذكار',
      englishTitle: 'Adhkar',
      description: 'Daily remembrance',
      color: colors.primary,
      screen: 'Adhkar',
    },
    {
      id: 2,
      icon: 'hands-pray',
      arabicTitle: 'دعاء',
      englishTitle: 'Duas',
      description: 'Supplications',
      color: colors.secondary,
      screen: 'Duas',
    },
    {
      id: 3,
      icon: 'compass-outline',
      arabicTitle: 'القبلة',
      englishTitle: 'Qibla',
      description: 'Direction to Kaaba',
      color: colors.info,
      screen: 'Qibla',
    },
    {
      id: 4,
      icon: 'counter',
      arabicTitle: 'تسبيح',
      englishTitle: 'Tasbeeh',
      description: 'Digital counter',
      color: colors.success,
      screen: 'Tasbeeh',
    },
    {
      id: 5,
      icon: 'mosque-outline',
      arabicTitle: 'مسجد قريب',
      englishTitle: 'Find Mosque',
      description: 'Nearby Masajid',
      color: '#C5A55D', // Gold accent
      screen: null, // Uses custom handler
      customHandler: handleFindMosque,
    },
    {
      id: 6,
      icon: 'cog-outline',
      arabicTitle: 'إعدادات',
      englishTitle: 'Settings',
      description: 'App settings',
      color: colors.textSecondary,
      screen: 'Settings',
    },
  ];

  /**
   * Load prayer data
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🏠 [HomeScreen] Loading home screen data...');

      // Load location and prayer times
      console.log('📍 [HomeScreen] Fetching current location...');
      const currentLoc = await getCurrentLocation();
      
      if (currentLoc && currentLoc.latitude && currentLoc.longitude) {
        console.log(`✅ [HomeScreen] Location obtained: ${currentLoc.latitude}, ${currentLoc.longitude}`);
        
        // Get city and country from coordinates
        console.log('🌍 [HomeScreen] Fetching city name...');
        const locationData = await getCityFromCoordinates(currentLoc.latitude, currentLoc.longitude);
        console.log(`✅ [HomeScreen] Location: ${locationData.city}, ${locationData.country}`);
        
        setLocation({
          ...currentLoc,
          ...locationData,
        });

        // Fetch prayer times
        console.log('🕌 [HomeScreen] Fetching prayer times...');
        const times = await fetchPrayerTimes(currentLoc.latitude, currentLoc.longitude);
        
        if (times) {
          console.log('✅ [HomeScreen] Prayer times received');
          setPrayerTimes(times);
          
          const next = calculateNextPrayer(times);
          if (next) {
            console.log(`⏰ [HomeScreen] Next prayer: ${next.name} at ${next.time}`);
            setNextPrayer(next);
          }
        } else {
          console.warn('⚠️ [HomeScreen] No prayer times received');
        }

        console.log('🎉 [HomeScreen] Home screen data loaded successfully');
      } else {
        console.warn('⚠️ [HomeScreen] Location not available');
      }
    } catch (error) {
      console.error('❌ [HomeScreen] Error loading home screen data:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update countdown every second
  useEffect(() => {
    if (!prayerTimes) return;

    const interval = setInterval(() => {
      const next = calculateNextPrayer(prayerTimes);
      setNextPrayer(next);
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /**
   * Feature Card Component
   */
  const FeatureCard = ({ feature, index }) => (
    <MotiView style={styles.featureCardContainer}>
      <TouchableOpacity
        style={[styles.featureCard, { borderLeftColor: feature.color }]}
        onPress={() => {
          if (feature.customHandler) {
            feature.customHandler();
          } else if (feature.screen) {
            navigation.navigate(feature.screen);
          }
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(250, 250, 250, 0.95)']}
          style={styles.cardGradient}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={feature.icon}
              size={36}
              color={feature.color}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.arabicTitle, { color: feature.color }]}>
              {feature.arabicTitle}
            </Text>
            <Text style={styles.englishTitle}>{feature.englishTitle}</Text>
            <Text style={styles.description}>{feature.description}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  // Render loading state (only while fetching prayer data)
  if (loading && !prayerTimes) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.loadingContainer}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 64, 32, 0.55)', 'rgba(10, 79, 63, 0.65)', 'rgba(20, 90, 50, 0.75)']}
          style={StyleSheet.absoluteFillObject}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      {/* Rotating Background Image */}
      <ImageBackground
        source={backgroundImage}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        imageStyle={{ opacity: 0.8 }}
      >
        {/* Dark green overlay gradient */}
        <LinearGradient
          colors={['rgba(0, 64, 32, 0.55)', 'rgba(10, 79, 63, 0.65)', 'rgba(20, 90, 50, 0.75)']}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Header Section */}
        <MotiView style={styles.header}>
          <Text style={styles.appTitle}>وَاذْكُر رَبَّكَ</Text>
        </MotiView>

        {/* Prayer Widget */}
        <PrayerWidget
          prayerTimes={prayerTimes}
          location={location}
        />

        {/* Welcome Card */}
        <MotiView style={styles.welcomeCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(253, 252, 250, 0.95)']}
            style={styles.welcomeCardGradient}
          >
            <Text style={styles.welcomeText}>
              اذكر الله كثيراً لعلك تفلح
            </Text>
            <Text style={styles.welcomeTranslation}>
              "Remember Allah abundantly so that you may succeed"
            </Text>
          </LinearGradient>
        </MotiView>

        {/* Feature Cards Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </View>

        {/* Quranic Quote */}
        <MotiView style={styles.quoteCard}>
          <LinearGradient
            colors={['rgba(20, 90, 50, 0.9)', 'rgba(10, 79, 63, 0.9)']}
            style={styles.quoteGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="format-quote-open"
              size={32}
              color={colors.gold}
              style={styles.quoteIcon}
            />
            <Text style={styles.quoteArabic}>
              وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ
            </Text>
            <Text style={styles.quoteTranslation}>
              "And remind, for indeed, the reminder benefits the believers"
            </Text>
            <Text style={styles.quoteReference}>سورة الذاريات - 51:55</Text>
          </LinearGradient>
        </MotiView>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: '#fff',
  },
  scrollContent: {
    position: 'relative',
    zIndex: 1,
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Welcome Card
  welcomeCard: {
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.large,
  },
  welcomeCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Feature Cards
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  featureCardContainer: {
    width: (width - spacing.md * 3) / 2,
    marginBottom: spacing.md,
  },
  featureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.medium,
    borderLeftWidth: 4,
  },
  cardGradient: {
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(10, 79, 63, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardContent: {
    alignItems: 'center',
  },
  arabicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  englishTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
  },

  // Quote Card
  quoteCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.large,
  },
  quoteGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  quoteArabic: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  quoteTranslation: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  quoteReference: {
    fontSize: 13,
    color: colors.gold,
    textAlign: 'center',
    fontWeight: '600',
  },

  bottomSpace: {
    height: spacing.xl,
  },
});

export default HomeScreen;

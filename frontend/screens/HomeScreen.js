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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { View as MotiView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../utils/theme';
import { getBackgroundImage, triggerUnsplashDownload, getFallbackBackground } from '../utils/backgroundUtils';
import { fetchPrayerTimes } from '../utils/apiUtils';
import { getCurrentLocation, getCityFromCoordinates } from '../utils/locationUtils';
import { calculateNextPrayer, getPrayerNameInArabic, getPrayerIcon } from '../utils/prayerWidgetUtils';

const { width, height } = Dimensions.get('window');

/**
 * Prayer Widget Component
 * Shows next prayer, countdown, and location
 */
const PrayerWidget = ({ prayerTimes, location, nextPrayer }) => {
  if (!nextPrayer || !location) return null;

  return (
    <MotiView style={styles.prayerWidget}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)']}
        style={styles.prayerWidgetGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Next Prayer */}
        <View style={styles.prayerSection}>
          <Text style={styles.prayerIcon}>{getPrayerIcon(nextPrayer.name)}</Text>
          <Text style={styles.prayerNameArabic}>{getPrayerNameInArabic(nextPrayer.name)}</Text>
          <Text style={styles.prayerNameEnglish}>{nextPrayer.name}</Text>
        </View>

        {/* Countdown */}
        <View style={styles.countdownSection}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
          <Text style={styles.countdownText}>{nextPrayer.countdown.shortFormatted}</Text>
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <MaterialCommunityIcons name="map-marker" size={18} color="#D4AF37" />
          <Text style={styles.locationText} numberOfLines={1}>
            {location.city || 'Unknown'}
          </Text>
        </View>
      </LinearGradient>
    </MotiView>
  );
};

const HomeScreen = ({ navigation }) => {
  const [backgroundData, setBackgroundData] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Features list - removed Prayer Times card
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
      icon: 'cog-outline',
      arabicTitle: 'إعدادات',
      englishTitle: 'Settings',
      description: 'App settings',
      color: colors.textSecondary,
      screen: 'Settings',
    },
  ];

  /**
   * Load background image and prayer data
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load background image
      const bgData = await getBackgroundImage();
      setBackgroundData(bgData);

      // Trigger Unsplash download tracking if from API
      if (bgData && bgData.downloadLocation && !bgData.isFallback) {
        await triggerUnsplashDownload(bgData.downloadLocation);
      }

      // Load location and prayer times
      const currentLoc = await getCurrentLocation();
      if (currentLoc) {
        const city = await getCityFromCoordinates(currentLoc.latitude, currentLoc.longitude);
        setLocation({ ...currentLoc, city });

        const times = await fetchPrayerTimes(currentLoc.latitude, currentLoc.longitude);
        setPrayerTimes(times);
        
        const next = calculateNextPrayer(times);
        setNextPrayer(next);
      }
    } catch (error) {
      console.error('Error loading home screen data:', error);
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
        onPress={() => navigation.navigate(feature.screen)}
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

  // Render loading state
  if (loading && !backgroundData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Render background (image or gradient fallback)
  const renderBackground = () => {
    if (backgroundData && backgroundData.url && !backgroundData.isFallback) {
      // Use ImageBackground for Unsplash photos
      return (
        <ImageBackground
          source={{ uri: backgroundData.url }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0, 64, 32, 0.55)', 'rgba(10, 79, 63, 0.65)', 'rgba(20, 90, 50, 0.75)']}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>
      );
    } else {
      // Use gradient fallback
      const gradientColors = backgroundData?.url || getFallbackBackground(backgroundData?.prayerPeriod || 'Fajr');
      return (
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      {renderBackground()}

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
          nextPrayer={nextPrayer}
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

        {/* Photo Credit (if from Unsplash) */}
        {backgroundData && backgroundData.photographer && !backgroundData.isFallback && (
          <View style={styles.photoCredit}>
            <Text style={styles.photoCreditText}>
              Photo by {backgroundData.photographer} on Unsplash
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: '#fff',
  },
  scrollContent: {
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
  
  // Prayer Widget Styles
  prayerWidget: {
    marginBottom: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.large,
  },
  prayerWidgetGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  prayerSection: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  prayerIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  prayerNameArabic: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  prayerNameEnglish: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  countdownSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  countdownText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  locationSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
    maxWidth: width * 0.25,
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

  // Photo Credit
  photoCredit: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  photoCreditText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },

  bottomSpace: {
    height: spacing.xl,
  },
});

export default HomeScreen;

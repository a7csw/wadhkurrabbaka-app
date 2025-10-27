/**
 * وَاذْكُر رَبَّكَ - Home Screen
 * 
 * Main dashboard with animated feature cards and Islamic content
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { MotiView } from 'moti'; // Temporarily disabled
import { View as MotiView } from 'react-native'; // Use plain View as fallback
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, animations } from '../utils/theme';

const { width } = Dimensions.get('window');

// Simple Mosque Silhouette Component using React Native Views
const MosqueSilhouette = () => (
  <View style={styles.mosqueContainer}>
    {/* Left Minaret */}
    <View style={styles.leftMinaret} />
    <View style={styles.leftMinaretTop} />
    <View style={styles.leftMinaretCrescent} />
    
    {/* Right Minaret */}
    <View style={styles.rightMinaret} />
    <View style={styles.rightMinaretTop} />
    <View style={styles.rightMinaretCrescent} />
    
    {/* Main Dome */}
    <View style={styles.domeBase} />
    <View style={styles.dome} />
    <View style={styles.domeTop} />
    <View style={styles.domeCrescent} />
    
    {/* Entrance Arch */}
    <View style={styles.entrance} />
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    updateGreeting();
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('صباح الخير');
    } else if (hour < 18) {
      setGreeting('مساء الخير');
    } else {
      setGreeting('مساء الخير');
    }
  };

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
      icon: 'clock-outline',
      arabicTitle: 'مواقيت الصلاة',
      englishTitle: 'Prayer Times',
      description: 'Salah schedule',
      color: colors.primary,
      screen: 'PrayerTimes',
    },
    {
      id: 4,
      icon: 'compass-outline',
      arabicTitle: 'القبلة',
      englishTitle: 'Qibla',
      description: 'Direction to Kaaba',
      color: colors.info,
      screen: 'Qibla',
    },
    {
      id: 5,
      icon: 'counter',
      arabicTitle: 'تسبيح',
      englishTitle: 'Tasbeeh',
      description: 'Digital counter',
      color: colors.success,
      screen: 'Tasbeeh',
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

  const FeatureCard = ({ feature, index }) => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: index * 100,
        damping: 15,
      }}
      style={styles.featureCardContainer}
    >
      <TouchableOpacity
        style={[styles.featureCard, { borderLeftColor: feature.color }]}
        onPress={() => navigation.navigate(feature.screen)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ffffff', '#fafafa']}
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

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Subtle Mosque Silhouette Background */}
      <View style={styles.mosqueBackground}>
        <MosqueSilhouette />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Animation */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.header}
        >
          <Text style={styles.appTitle}>وَاذْكُر رَبَّكَ</Text>
          <Text style={styles.appSubtitle}>تطبيق الأذكار والأدعية</Text>
          <View style={styles.divider} />
          <Text style={styles.greeting}>{greeting}</Text>
        </MotiView>

        {/* Welcome Card */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.welcomeCard}
        >
          <LinearGradient
            colors={['#ffffff', '#fdfcfa']}
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
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 800 }}
          style={styles.quoteCard}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
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
  },
  mosqueBackground: {
    position: 'absolute',
    top: '20%',
    left: '5%',
    right: '5%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  mosqueContainer: {
    width: width * 0.9,
    height: width * 0.6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // Left Minaret
  leftMinaret: {
    position: 'absolute',
    left: width * 0.1,
    bottom: 0,
    width: 8,
    height: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
  },
  leftMinaretTop: {
    position: 'absolute',
    left: width * 0.1 - 2,
    bottom: width * 0.4 - 20,
    width: 12,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
  },
  leftMinaretCrescent: {
    position: 'absolute',
    left: width * 0.1 - 1,
    bottom: width * 0.4 - 5,
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
  // Right Minaret
  rightMinaret: {
    position: 'absolute',
    right: width * 0.1,
    bottom: 0,
    width: 8,
    height: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
  },
  rightMinaretTop: {
    position: 'absolute',
    right: width * 0.1 - 2,
    bottom: width * 0.4 - 20,
    width: 12,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
  },
  rightMinaretCrescent: {
    position: 'absolute',
    right: width * 0.1 - 1,
    bottom: width * 0.4 - 5,
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
  // Main Dome
  domeBase: {
    width: width * 0.4,
    height: width * 0.25,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    marginBottom: 0,
  },
  dome: {
    width: width * 0.4,
    height: width * 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: width * 0.2,
    marginBottom: -width * 0.1,
  },
  domeTop: {
    width: 16,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    marginBottom: 5,
  },
  domeCrescent: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  // Entrance
  entrance: {
    position: 'absolute',
    bottom: 0,
    width: width * 0.15,
    height: width * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: width * 0.15 / 2,
    marginBottom: -width * 0.075,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.9,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: colors.gold,
    marginVertical: spacing.md,
    borderRadius: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gold,
    textAlign: 'center',
  },
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
    backgroundColor: colors.backgroundDark,
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
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  quoteTranslation: {
    fontSize: 15,
    color: colors.textLight,
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
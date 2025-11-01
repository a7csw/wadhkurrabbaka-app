/**
 * Prayer Times Widget Component
 * Beautiful, dynamic widget showing daily prayer times with live countdown
 */

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../utils/theme';
import {
  getCurrentAndNextPrayer,
  formatTime12Hour,
  isCurrentPrayer,
  isNextPrayer,
  getPrayerIcon,
} from '../utils/prayerTimesUtils';

const { width } = Dimensions.get('window');

// ENHANCED: Helper to split time into digits and period for styled display
const splitTimeAndPeriod = (formattedTime) => {
  // formattedTime is like "6:21 AM" or "12:15 PM"
  const parts = formattedTime.split(' ');
  return {
    time: parts[0], // "6:21"
    period: parts[1], // "AM" or "PM"
  };
};

const PrayerTimesWidget = ({ prayerTimes, location, onPress, loading }) => {
  const [prayerData, setPrayerData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fadeAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  // Update prayer data every second
  useEffect(() => {
    if (!prayerTimes) return;

    const updatePrayerData = () => {
      const data = getCurrentAndNextPrayer(prayerTimes);
      setPrayerData(data);
      setCurrentTime(new Date());
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: data.progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    };

    updatePrayerData();
    const interval = setInterval(updatePrayerData, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulse animation for next prayer
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  if (loading || !prayerTimes || !prayerData) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(11,61,46,0.95)', 'rgba(13,78,58,0.95)']}
          style={styles.gradient}
        >
          {/* Loading Shimmer */}
          <View style={styles.loadingContainer}>
            <View style={styles.shimmerHeader} />
            <View style={styles.shimmerRow}>
              {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.shimmerPrayer} />
              ))}
            </View>
            <View style={styles.shimmerFooter} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={['rgba(11,61,46,0.95)', 'rgba(13,78,58,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="mosque" size={20} color={colors.secondary} />
              <Text style={styles.headerTitle}>أوقات الصلاة</Text>
              <Text style={styles.headerTitleEn}>Prayer Times</Text>
            </View>
            {location && (
              <View style={styles.locationBadge}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#fff" />
                <Text 
                  style={styles.locationText} 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {location}
                </Text>
              </View>
            )}
          </View>

          {/* Prayer Times Grid */}
          <View style={styles.prayersContainer}>
            {prayerData.allPrayers.map((prayer, index) => {
              const isCurrent = isCurrentPrayer(prayer.name, prayerData.currentPrayer);
              const isNext = isNextPrayer(prayer.name, prayerData.nextPrayer);

              return (
                <Animated.View
                  key={prayer.name}
                  style={[
                    styles.prayerCard,
                    isNext && { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  {isNext && (
                    <LinearGradient
                      colors={['rgba(255,215,0,0.3)', 'rgba(255,165,0,0.2)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                  )}
                  {isCurrent && (
                    <LinearGradient
                      colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                  )}
                  
                  <View style={styles.prayerContent}>
                    <Text style={styles.prayerIcon}>{getPrayerIcon(prayer.name)}</Text>
                    <Text 
                      style={[styles.prayerNameAr, isNext && styles.nextPrayerText]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {prayer.nameAr || prayer.name}
                    </Text>
                    <Text 
                      style={[styles.prayerNameEn, isNext && styles.nextPrayerText]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {prayer.name}
                    </Text>
                    {/* ENHANCED: Time display with styled AM/PM suffix */}
                    <View style={styles.timeContainer}>
                      <Text 
                        style={[styles.prayerTime, isNext && styles.nextPrayerTimeText]}
                        numberOfLines={1}
                      >
                        {splitTimeAndPeriod(formatTime12Hour(prayer.time)).time}
                      </Text>
                      <Text 
                        style={[styles.prayerPeriod, isNext && styles.nextPrayerTimeText]}
                      >
                        {splitTimeAndPeriod(formatTime12Hour(prayer.time)).period}
                      </Text>
                    </View>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>الآن</Text>
                      </View>
                    )}
                    {isNext && (
                      <View style={styles.nextBadge}>
                        <Text style={styles.nextBadgeText}>التالي</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>

          {/* Countdown Section */}
          <View style={styles.countdownSection}>
            <View style={styles.countdownHeader}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.secondary} />
              <Text style={styles.countdownLabel}>
                الصلاة القادمة: {prayerData.nextPrayerAr}
              </Text>
            </View>
            <Text style={styles.countdownTime}>{prayerData.timeRemaining}</Text>
            <Text style={styles.countdownSubtext}>
              Next prayer: {prayerData.nextPrayer} at {formatTime12Hour(prayerData.nextPrayerTime)}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressWidth,
                  },
                ]}
              >
                <LinearGradient
                  colors={[colors.secondary, '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>
          </View>

          {/* Tap Hint */}
          <View style={styles.tapHint}>
            <MaterialCommunityIcons name="gesture-tap" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.tapHintText}>اضغط لعرض التفاصيل</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // REFINED: Widget container - 92% width to prevent clipping on small screens
  container: {
    width: '92%', // Adjusted from 90% to prevent edge clipping
    alignSelf: 'center', // Centers horizontally
    marginVertical: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    // Enhanced shadow for card depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  touchable: {
    width: '100%',
  },
  // REFINED: Consistent padding for internal content
  gradient: {
    paddingVertical: 12, // Consistent vertical padding
    paddingHorizontal: 16, // Consistent horizontal padding
  },

  // REFINED: Header - improved alignment and spacing
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Ensures vertical center alignment
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically centers icon + text
    gap: spacing.xs,
  },
  // REFINED: Title hierarchy - consistent colors
  headerTitle: {
    fontSize: 18,
    fontWeight: '700', // Bolder for Arabic
    color: '#FFFFFF', // Pure white for Arabic
  },
  headerTitleEn: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E0E0E0', // Slightly muted for English
    marginLeft: spacing.xs,
  },
  // REFINED: Location badge - flexShrink to prevent overflow
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginLeft: 8, // Space between title and location
    flexShrink: 1, // Allow shrinking to fit long city names
    overflow: 'hidden', // Prevent text overflow
  },
  // REFINED: Location text - ellipsis for long city names
  locationText: {
    fontSize: 13, // Increased from 11 for readability
    color: colors.textSecondary, // Use theme color
    fontWeight: '500',
    flexShrink: 1, // Allow text to shrink
    textAlign: 'right', // Align to right
  },

  // ENHANCED: Prayer Times Grid - perfect 3×2 layout (3 cards per row)
  prayersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // CHANGED: Even spacing for 3×2 grid
    alignItems: 'flex-start', // CHANGED: Align to top for consistent rows
    marginBottom: spacing.md,
    flexWrap: 'wrap', // Allow wrapping to create 2 rows
  },
  // ENHANCED: Prayer Card - 30% width for perfect 3-card rows
  prayerCard: {
    width: '30%', // CHANGED: 30% width = 3 cards per row (90% total)
    minWidth: 95, // INCREASED: Ensure readability
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10, // Consistent vertical padding
    paddingHorizontal: 4, // Small horizontal padding
    marginHorizontal: '1.5%', // CHANGED: Percentage-based margins for balance
    marginVertical: 6, // INCREASED: Better row separation
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 105, // INCREASED: Comfortable height for all text
    position: 'relative',
    overflow: 'hidden',
  },
  prayerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  // ENHANCED: Prayer icon - balanced for 3×2 grid
  prayerIcon: {
    fontSize: 20, // RESTORED: Comfortable size for 30% width cards
    marginBottom: 6, // ADJUSTED: Better spacing
    textAlign: 'center',
  },
  // ENHANCED: Prayer names - optimized for 3×2 grid layout
  prayerNameAr: {
    fontSize: Platform.OS === 'ios' ? 13 : 12, // ADJUSTED: Balanced for 30% cards
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2, // ADJUSTED: Comfortable spacing
    textAlign: 'center',
    flexShrink: 1,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  prayerNameEn: {
    fontSize: Platform.OS === 'ios' ? 11 : 10, // ADJUSTED: Balanced for 30% cards
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 4, // ADJUSTED: Better spacing before time
    textAlign: 'center',
    flexShrink: 1,
  },
  // ENHANCED: Time container - holds time + AM/PM together
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2, // Small space between time and period
  },
  // ENHANCED: Prayer time digits - larger, prominent
  prayerTime: {
    fontSize: Platform.OS === 'ios' ? 15 : 14, // ADJUSTED: Responsive sizing
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
  },
  // ENHANCED: AM/PM period - smaller, 75% scale
  prayerPeriod: {
    fontSize: Platform.OS === 'ios' ? 11 : 10, // 75% of time fontSize
    fontWeight: '500',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 2, // Slight vertical alignment adjustment
  },
  nextPrayerText: {
    color: colors.secondary,
  },
  nextPrayerTimeText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  currentBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.primary,
  },
  nextBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nextBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },

  // REFINED: Countdown Section - perfectly centered with proper spacing
  countdownSection: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingVertical: 12, // Consistent vertical padding
    paddingHorizontal: 16, // Consistent horizontal padding
    alignItems: 'center', // Center all content
    marginTop: spacing.lg, // Increased spacing from prayer grid
    marginBottom: spacing.md, // Bottom spacing
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the header content
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center', // Center text
  },
  // REFINED: Countdown timer - monospace with subtle pulse
  countdownTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700', // Gold for prominence
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    marginVertical: spacing.xs,
    textAlign: 'center', // Center timer
  },
  countdownSubtext: {
    fontSize: 12,
    color: '#E0E0E0', // Consistent muted color
    marginBottom: spacing.sm,
    textAlign: 'center', // Center subtext
  },

  // Progress Bar
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },

  // Tap Hint
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tapHintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },

  // Loading States
  loadingContainer: {
    padding: spacing.sm,
  },
  shimmerHeader: {
    width: '60%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  shimmerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  shimmerPrayer: {
    flex: 1,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  shimmerFooter: {
    width: '80%',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignSelf: 'center',
  },
});

export default memo(PrayerTimesWidget);


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
                <Text style={styles.locationText} numberOfLines={1}>
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
                    <Text style={[styles.prayerNameAr, isNext && styles.nextPrayerText]}>
                      {prayer.nameAr || prayer.name}
                    </Text>
                    <Text style={[styles.prayerNameEn, isNext && styles.nextPrayerText]}>
                      {prayer.name}
                    </Text>
                    <Text style={[styles.prayerTime, isNext && styles.nextPrayerTimeText]}>
                      {formatTime12Hour(prayer.time)}
                    </Text>
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
  container: {
    width: width - spacing.lg * 2,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.large,
  },
  touchable: {
    width: '100%',
  },
  gradient: {
    padding: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitleEn: {
    fontSize: 12,
    color: colors.secondary,
    marginLeft: spacing.xs,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: 4,
    maxWidth: width * 0.3,
  },
  locationText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },

  // Prayer Times Grid
  prayersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  prayerCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  prayerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  prayerIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  prayerNameAr: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  prayerNameEn: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  prayerTime: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
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

  // Countdown Section
  countdownSection: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    marginVertical: spacing.xs,
  },
  countdownSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.sm,
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


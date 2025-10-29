/**
 * Prayer Widget Component
 * Displays current location, next prayer, and live countdown
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../utils/theme';
import moment from 'moment-timezone';

/**
 * Get the next upcoming prayer
 * @param {object} prayerTimes - Prayer times from Aladhan API
 * @returns {object} - Next prayer info { name, time, arabicName }
 */
const getNextPrayer = (prayerTimes) => {
  if (!prayerTimes || !prayerTimes.timings) return null;

  const now = moment();
  const today = now.format('YYYY-MM-DD');
  
  const prayers = [
    { name: 'Fajr', arabicName: 'الفجر' },
    { name: 'Dhuhr', arabicName: 'الظهر' },
    { name: 'Asr', arabicName: 'العصر' },
    { name: 'Maghrib', arabicName: 'المغرب' },
    { name: 'Isha', arabicName: 'العشاء' },
  ];

  for (let prayer of prayers) {
    const prayerTimeStr = prayerTimes.timings[prayer.name];
    if (!prayerTimeStr) continue;

    const prayerMoment = moment(`${today} ${prayerTimeStr}`, 'YYYY-MM-DD HH:mm');
    
    if (prayerMoment.isAfter(now)) {
      return {
        ...prayer,
        time: prayerTimeStr,
        moment: prayerMoment,
      };
    }
  }

  // If no prayer left today, return Fajr of tomorrow
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
  const fajrTomorrow = moment(`${tomorrow} ${prayerTimes.timings.Fajr}`, 'YYYY-MM-DD HH:mm');
  
  return {
    name: 'Fajr',
    arabicName: 'الفجر',
    time: prayerTimes.timings.Fajr,
    moment: fajrTomorrow,
  };
};

/**
 * Calculate time remaining until next prayer
 * @param {object} nextPrayer - Next prayer object with moment
 * @returns {string} - Formatted countdown (hh:mm:ss)
 */
const getTimeUntilNextPrayer = (nextPrayer) => {
  if (!nextPrayer || !nextPrayer.moment) return '00:00:00';

  const now = moment();
  const diff = nextPrayer.moment.diff(now);
  
  if (diff <= 0) return '00:00:00';

  const duration = moment.duration(diff);
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
};

const PrayerWidget = ({ prayerTimes, location }) => {
  const [countdown, setCountdown] = useState('00:00:00');
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    if (!prayerTimes) return;

    const next = getNextPrayer(prayerTimes);
    setNextPrayer(next);

    // Update countdown every second
    const interval = setInterval(() => {
      const next = getNextPrayer(prayerTimes);
      setNextPrayer(next);
      setCountdown(getTimeUntilNextPrayer(next));
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Loading state
  if (!prayerTimes || !location) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(250, 249, 246, 0.95)']}
          style={styles.gradient}
        >
          <Text style={styles.loadingText}>Loading prayer times...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(250, 249, 246, 0.95)']}
        style={styles.gradient}
      >
        {/* Location */}
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
          <Text style={styles.locationText}>
            {location.city || 'Unknown'}, {location.country || 'Unknown'}
          </Text>
        </View>

        {/* Next Prayer */}
        {nextPrayer && (
          <View style={styles.prayerSection}>
            <View style={styles.prayerRow}>
              <Text style={styles.nextLabel}>Next: </Text>
              <Text style={styles.prayerNameArabic}>{nextPrayer.arabicName}</Text>
              <Text style={styles.prayerNameEnglish}> {nextPrayer.name}</Text>
            </View>
            
            {/* Countdown */}
            <View style={styles.countdownContainer}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={colors.secondary} />
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.large,
  },
  gradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  prayerSection: {
    alignItems: 'center',
    width: '100%',
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nextLabel: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  prayerNameArabic: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  prayerNameEnglish: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  countdownText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
    marginLeft: spacing.sm,
    letterSpacing: 1,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default PrayerWidget;


/**
 * Prayer Times Screen - مواقيت الصلاة
 * Shows accurate prayer times using Aladhan API
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../utils/theme';
import { getCurrentLocation, getCityFromCoordinates } from '../utils/locationUtils';
import { fetchPrayerTimes } from '../utils/apiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrayerTimesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState('Loading...');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [hijriDate, setHijriDate] = useState('');
  const [error, setError] = useState(null); // ADDED: Error state
  const [retryCount, setRetryCount] = useState(0); // ADDED: Retry counter

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  // REFINED: Load prayer times with retry logic and better error handling
  const loadPrayerTimes = async (isRetry = false) => {
    try {
      console.log('🕌 [PrayerTimesScreen] Loading prayer times...');
      setLoading(true);
      setError(null); // Clear previous errors

      // Step 1: Try to load cached data first (fallback)
      const cachedData = await AsyncStorage.getItem('lastPrayerTimes');
      if (cachedData && !isRetry) {
        const cached = JSON.parse(cachedData);
        console.log('✅ [PrayerTimesScreen] Loaded cached data');
        setPrayerTimes(cached.prayerTimes);
        setCityName(cached.cityName || 'Cached Location');
      }

      // Step 2: Get current location
      console.log('📍 [PrayerTimesScreen] Getting location...');
      const coords = await getCurrentLocation();
      
      if (!coords || !coords.latitude || !coords.longitude) {
        console.warn('⚠️ [PrayerTimesScreen] Location not available');
        setError({
          title: 'موقع غير متاح',
          message: 'يرجى تفعيل خدمات الموقع لعرض أوقات الصلاة',
          messageEn: 'Please enable location services to view prayer times',
        });
        setLoading(false);
        return;
      }

      console.log(`✅ [PrayerTimesScreen] Location: ${coords.latitude}, ${coords.longitude}`);
      setLocation(coords);

      // Step 3: Get city name using OpenCage
      console.log('🌍 [PrayerTimesScreen] Fetching city name...');
      const locationData = await getCityFromCoordinates(coords.latitude, coords.longitude);
      const cityDisplay = `${locationData.city}, ${locationData.country}`;
      console.log(`✅ [PrayerTimesScreen] City: ${cityDisplay}`);
      setCityName(cityDisplay);

      // Step 4: Fetch prayer times from Aladhan API
      console.log('🕌 [PrayerTimesScreen] Fetching prayer times...');
      const times = await fetchPrayerTimes(coords.latitude, coords.longitude, 2); // method=2 (ISNA)
      
      if (!times) {
        throw new Error('No prayer times returned from API');
      }

      console.log('✅ [PrayerTimesScreen] Prayer times received');
      setPrayerTimes(times);
      
      // Calculate next prayer
      const next = calculateNextPrayer(times);
      setNextPrayer(next);
      
      // Set Hijri date if available
      if (times.date && times.date.hijri) {
        const hijri = times.date.hijri;
        setHijriDate(`${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`);
      }

      // Cache the data for offline use
      await AsyncStorage.setItem('lastPrayerTimes', JSON.stringify({
        prayerTimes: times,
        cityName: cityDisplay,
        timestamp: Date.now(),
      }));
      console.log('💾 [PrayerTimesScreen] Data cached successfully');

      setError(null);
      setRetryCount(0);
      setLoading(false);

    } catch (error) {
      console.error('❌ [PrayerTimesScreen] Error loading prayer times:', error);
      console.error('Error details:', error.message);
      
      // REFINED: Retry logic - up to 3 attempts
      if (retryCount < 3) {
        console.log(`🔄 [PrayerTimesScreen] Retrying... (${retryCount + 1}/3)`);
        setRetryCount(retryCount + 1);
        setTimeout(() => loadPrayerTimes(true), 2000); // Wait 2 seconds before retry
        return;
      }

      // REFINED: Show in-app error instead of Alert
      setError({
        title: '⚠️ لم نتمكن من تحميل الأوقات الآن',
        message: 'حاول مجددًا لاحقًا',
        messageEn: 'Unable to fetch prayer times. Please try again later.',
      });
      setLoading(false);
    }
  };

  // REFINED: Calculate next prayer (moved from apiUtils for screen-specific logic)
  const calculateNextPrayer = (times) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', nameAr: 'الفجر', time: times.Fajr },
      { name: 'Dhuhr', nameAr: 'الظهر', time: times.Dhuhr },
      { name: 'Asr', nameAr: 'العصر', time: times.Asr },
      { name: 'Maghrib', nameAr: 'المغرب', time: times.Maghrib },
      { name: 'Isha', nameAr: 'العشاء', time: times.Isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (currentMinutes < prayerMinutes) {
        const diff = prayerMinutes - currentMinutes;
        const hoursUntil = Math.floor(diff / 60);
        const minutesUntil = diff % 60;
        
        return {
          ...prayer,
          timeUntil: {
            formatted: `${hoursUntil}h ${minutesUntil}m`,
          },
        };
      }
    }

    // If no prayer found today, next is Fajr tomorrow
    const [hours, minutes] = prayers[0].time.split(':').map(Number);
    const fajrMinutes = hours * 60 + minutes;
    const diff = (24 * 60 - currentMinutes) + fajrMinutes;
    const hoursUntil = Math.floor(diff / 60);
    const minutesUntil = diff % 60;

    return {
      ...prayers[0],
      timeUntil: {
        formatted: `${hoursUntil}h ${minutesUntil}m`,
      },
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPrayerTimes();
    setRefreshing(false);
  };

  const formatTime = (time) => {
    // Convert 24h format to 12h format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const prayers = prayerTimes
    ? [
        { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.Fajr, icon: '🌅' },
        { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.Sunrise, icon: '☀️' },
        { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.Dhuhr, icon: '🌞' },
        { name: 'Asr', nameAr: 'العصر', time: prayerTimes.Asr, icon: '🌤️' },
        { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.Maghrib, icon: '🌇' },
        { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.Isha, icon: '🌙' },
      ]
    : [];

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.backgroundLight, colors.background]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل أوقات الصلاة...</Text>
        </View>
      </View>
    );
  }

  // REFINED: Error UI component (in-app styled card instead of Alert)
  const renderError = () => (
    <View style={styles.errorCard}>
      <LinearGradient
        colors={['rgba(255,107,107,0.9)', 'rgba(255,61,61,0.9)']}
        style={styles.errorGradient}
      >
        <MaterialCommunityIcons name="alert-circle" size={48} color="#fff" />
        <Text style={styles.errorTitle}>{error.title}</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <Text style={styles.errorMessageEn}>{error.messageEn}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setRetryCount(0);
            loadPrayerTimes();
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="reload" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>حاول مرة أخرى</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundLight, colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* REFINED: Show error card if there's an error */}
        {error && renderError()}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>مواقيت الصلاة</Text>
          <Text style={styles.headerSubtitle}>Prayer Times</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{cityName}</Text>
          </View>
          {hijriDate && (
            <Text style={styles.hijriDate}>{hijriDate}</Text>
          )}
        </View>

        {/* Next Prayer Card */}
        {nextPrayer && (
          <View style={styles.nextPrayerCard}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.nextPrayerGradient}
            >
              <Text style={styles.nextPrayerLabel}>الصلاة القادمة</Text>
              <Text style={styles.nextPrayerName}>{nextPrayer.nameAr}</Text>
              <Text style={styles.nextPrayerNameEn}>{nextPrayer.name}</Text>
              <View style={styles.timeContainer}>
                <Text style={styles.nextPrayerTime}>
                  {formatTime(nextPrayer.time)}
                </Text>
              </View>
              <Text style={styles.nextPrayerCountdown}>
                {nextPrayer.timeUntil.formatted} remaining
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* REFINED: Prayer Times List - with dividers and improved spacing */}
        <View style={styles.prayersList}>
          {prayers.map((prayer, index) => (
            <View key={prayer.name}>
              <View style={styles.prayerCard}>
                <LinearGradient
                  colors={['#ffffff', '#f8f8f8']}
                  style={styles.prayerCardGradient}
                >
                  <View style={styles.prayerIcon}>
                    <Text style={styles.prayerIconText}>{prayer.icon}</Text>
                  </View>
                  <View style={styles.prayerInfo}>
                    <Text style={styles.prayerNameAr}>{prayer.nameAr}</Text>
                    <Text style={styles.prayerNameEn}>{prayer.name}</Text>
                  </View>
                  <View style={styles.prayerTimeContainer}>
                    <Text style={styles.prayerTime}>
                      {formatTime(prayer.time)}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
              {/* REFINED: Soft divider between prayers (except last) */}
              {index < prayers.length - 1 && (
                <View style={styles.prayerDivider} />
              )}
            </View>
          ))}
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
          <Text style={styles.refreshText}>تحديث الأوقات</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا"
          </Text>
          <Text style={styles.footerTextEn}>
            "Indeed, prayer has been decreed upon the believers a decree of specified times"
          </Text>
          <Text style={styles.footerReference}>- Surah An-Nisa (4:103)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  locationText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  hijriDate: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: spacing.xs,
    fontWeight: 'bold',
  },
  nextPrayerCard: {
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.large,
  },
  nextPrayerGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  nextPrayerName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  nextPrayerNameEn: {
    fontSize: 18,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  timeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  nextPrayerTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nextPrayerCountdown: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  // REFINED: Prayers list - improved spacing
  prayersList: {
    marginBottom: spacing.lg,
  },
  prayerCard: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.medium,
  },
  prayerCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Consistent vertical spacing
    paddingHorizontal: 16, // Consistent horizontal spacing
  },
  // REFINED: Divider between prayer cards
  prayerDivider: {
    height: 10, // Vertical spacing between cards (10-12px as requested)
    backgroundColor: 'transparent',
  },
  prayerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  prayerIconText: {
    fontSize: 24,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerNameAr: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  prayerNameEn: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  prayerTimeContainer: {
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  refreshIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  refreshText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  footerText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    lineHeight: 28,
  },
  footerTextEn: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footerReference: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // REFINED: Error card styles (in-app error UI)
  errorCard: {
    borderRadius: 20,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.large,
  },
  errorGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  errorMessageEn: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PrayerTimesScreen;

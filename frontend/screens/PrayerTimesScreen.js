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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows } from '../utils/theme';
import { getCurrentLocation, getCityName } from '../utils/locationUtils';
import { getPrayerTimes, getNextPrayer } from '../utils/apiUtils';
import { saveLastLocation } from '../utils/storage';

const PrayerTimesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState('Loading...');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [hijriDate, setHijriDate] = useState('');

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = async () => {
    try {
      setLoading(true);

      // Get current location
      const coords = await getCurrentLocation();
      if (!coords) {
        Alert.alert(
          'موقع غير متاح',
          'يرجى تفعيل خدمات الموقع لعرض أوقات الصلاة'
        );
        setLoading(false);
        return;
      }

      setLocation(coords);
      await saveLastLocation(coords);

      // Get city name
      const city = await getCityName(coords.latitude, coords.longitude);
      setCityName(city);

      // Fetch prayer times
      const result = await getPrayerTimes(coords.latitude, coords.longitude);
      
      if (result.success) {
        setPrayerTimes(result.data);
        setNextPrayer(getNextPrayer(result.data));
        
        // Set Hijri date
        if (result.date && result.date.hijri) {
          const hijri = result.date.hijri;
          setHijriDate(
            `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل تحميل أوقات الصلاة. يرجى المحاولة مرة أخرى.');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading prayer times:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل أوقات الصلاة');
      setLoading(false);
    }
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

        {/* Prayer Times List */}
        <View style={styles.prayersList}>
          {prayers.map((prayer, index) => (
            <View key={prayer.name} style={styles.prayerCard}>
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
  prayersList: {
    marginBottom: spacing.lg,
  },
  prayerCard: {
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.medium,
  },
  prayerCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
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
});

export default PrayerTimesScreen;

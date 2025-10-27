/**
 * Qibla Direction Screen - اتجاه القبلة
 * Shows direction to Kaaba with compass
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Magnetometer } from 'expo-sensors';
import { colors, spacing, shadows } from '../utils/theme';
import {
  getCurrentLocation,
  calculateQiblaDirection,
  getDistanceToKaaba,
  getCityName,
} from '../utils/locationUtils';

const QiblaScreen = () => {
  const [loading, setLoading] = useState(true);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0);
  const [distance, setDistance] = useState(0);
  const [cityName, setCityName] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    initializeQibla();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const initializeQibla = async () => {
    try {
      setLoading(true);

      // Get location
      const coords = await getCurrentLocation();
      if (!coords) {
        Alert.alert(
          'موقع غير متاح',
          'يرجى تفعيل خدمات الموقع لتحديد اتجاه القبلة'
        );
        setLoading(false);
        return;
      }

      // Calculate Qibla direction
      const direction = calculateQiblaDirection(
        coords.latitude,
        coords.longitude
      );
      setQiblaDirection(direction);

      // Calculate distance to Kaaba
      const dist = getDistanceToKaaba(coords.latitude, coords.longitude);
      setDistance(dist);

      // Get city name
      const city = await getCityName(coords.latitude, coords.longitude);
      setCityName(city);

      // Start magnetometer
      Magnetometer.setUpdateInterval(100);
      const sub = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        setCompassHeading(angle);
      });
      setSubscription(sub);

      setLoading(false);
    } catch (error) {
      console.error('Error initializing Qibla:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديد اتجاه القبلة');
      setLoading(false);
    }
  };

  const getRotation = () => {
    return qiblaDirection - compassHeading;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.backgroundLight, colors.background]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>جاري تحديد اتجاه القبلة...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>اتجاه القبلة</Text>
          <Text style={styles.headerSubtitle}>Qibla Direction</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{cityName}</Text>
          </View>
          <Text style={styles.distanceText}>
            {distance.toLocaleString()} km to Kaaba
          </Text>
        </View>

        {/* Compass */}
        <View style={styles.compassContainer}>
          <View style={styles.compass}>
            {/* Compass Circle */}
            <View
              style={[
                styles.compassCircle,
                { transform: [{ rotate: `${-compassHeading}deg` }] },
              ]}
            >
              {/* Cardinal Directions */}
              <Text style={[styles.cardinalText, styles.northText]}>N</Text>
              <Text style={[styles.cardinalText, styles.eastText]}>E</Text>
              <Text style={[styles.cardinalText, styles.southText]}>S</Text>
              <Text style={[styles.cardinalText, styles.westText]}>W</Text>
            </View>

            {/* Kaaba Icon */}
            <View
              style={[
                styles.kaabaIndicator,
                { transform: [{ rotate: `${getRotation()}deg` }] },
              ]}
            >
              <View style={styles.arrow}>
                <Text style={styles.kaabaIcon}>🕋</Text>
                <View style={styles.arrowShape} />
              </View>
            </View>

            {/* Center Dot */}
            <View style={styles.centerDot} />
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Direction</Text>
            <Text style={styles.infoValue}>{Math.round(qiblaDirection)}°</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{distance} km</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Hold your device flat and rotate until the Kaaba icon points up
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ"
          </Text>
          <Text style={styles.footerTextEn}>
            "Turn your face toward al-Masjid al-Haram"
          </Text>
          <Text style={styles.footerReference}>- Surah Al-Baqarah (2:144)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.secondary,
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
    color: '#ffffff',
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compass: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  cardinalText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  northText: {
    top: 10,
  },
  eastText: {
    right: 10,
  },
  southText: {
    bottom: 10,
  },
  westText: {
    left: 10,
  },
  kaabaIndicator: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  arrow: {
    alignItems: 'center',
  },
  kaabaIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  arrowShape: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.secondary,
  },
  centerDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    ...shadows.small,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  instructions: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  footerText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  footerTextEn: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  footerReference: {
    fontSize: 11,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default QiblaScreen;

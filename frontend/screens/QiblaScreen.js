/**
 * Qibla Direction Screen - اتجاه القبلة
 * Shows direction to Kaaba with compass
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, shadows } from '../utils/theme';
import { useCompass } from '../hooks/useCompass';
import { KAABA } from '../utils/qibla';
import { getCityFromCoordinates } from '../utils/locationUtils';

const QiblaScreen = () => {
  const compassData = useCompass();
  const [locationInfo, setLocationInfo] = useState({ city: '', country: '' });
  const [showMap, setShowMap] = useState(false);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const calibrationOpacity = useRef(new Animated.Value(0)).current;

  // Animate compass rotation smoothly
  useEffect(() => {
    if (compassData.pointerRotation !== null) {
      Animated.timing(rotationAnim, {
        toValue: compassData.pointerRotation,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  }, [compassData.pointerRotation]);

  // Show calibration hint animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(calibrationOpacity, {
        toValue: compassData.needsCalibration ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [compassData.needsCalibration]);

  // Fetch location name
  useEffect(() => {
    const fetchLocationName = async () => {
      if (compassData.location) {
        try {
          const locData = await getCityFromCoordinates(
            compassData.location.lat,
            compassData.location.lon
          );
          setLocationInfo({
            city: locData.city || 'Unknown',
            country: locData.country || '',
          });
        } catch (error) {
          console.error('Failed to fetch location name:', error);
        }
      }
    };
    fetchLocationName();
  }, [compassData.location]);

  if (compassData.error === 'Location permission required') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📍</Text>
          <Text style={styles.errorTitle}>Location Permission Required</Text>
          <Text style={styles.errorMessage}>
            Please enable location services to find Qibla direction.{'\n\n'}
            Go to Settings {'>'} Privacy {'>'} Location Services
          </Text>
        </View>
      </View>
    );
  }

  if (compassData.error === 'Compass not available on this device' || showMap) {
    // Fallback to map view
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>اتجاه القبلة</Text>
            <Text style={styles.headerSubtitle}>Qibla Direction</Text>
            {!showMap && (
              <Text style={styles.fallbackText}>
                Compass not available - showing map direction
              </Text>
            )}
          </View>

          {compassData.location && (
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: compassData.location.lat,
                longitude: compassData.location.lon,
                latitudeDelta: 20,
                longitudeDelta: 20,
              }}
            >
              <Marker
                coordinate={{
                  latitude: compassData.location.lat,
                  longitude: compassData.location.lon,
                }}
                title="Your Location"
              />
              <Marker
                coordinate={{
                  latitude: KAABA.lat,
                  longitude: KAABA.lon,
                }}
                title="Kaaba"
              >
                <Text style={styles.kaabaMapIcon}>🕋</Text>
              </Marker>
              <Polyline
                coordinates={[
                  {
                    latitude: compassData.location.lat,
                    longitude: compassData.location.lon,
                  },
                  { latitude: KAABA.lat, longitude: KAABA.lon },
                ]}
                strokeColor={colors.secondary}
                strokeWidth={2}
                geodesic={true}
              />
            </MapView>
          )}

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setShowMap(!showMap)}
          >
            <Text style={styles.switchButtonText}>
              {showMap ? 'Hide Map' : 'Show Map View'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const loading = !compassData.location || compassData.deviceHeading === null;

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

          {/* Location Display */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationText}>
                {locationInfo.city && locationInfo.country
                  ? `${locationInfo.city}, ${locationInfo.country}`
                  : 'Loading location...'}
              </Text>
              {compassData.location && (
                <Text style={styles.coordsText}>
                  {compassData.location.lat.toFixed(4)}°,{' '}
                  {compassData.location.lon.toFixed(4)}°
                </Text>
              )}
            </View>
          </View>

          {/* Distance Display */}
          {compassData.distance && (
            <Text style={styles.distanceText}>
              {Math.round(compassData.distance).toLocaleString()} km to Kaaba
            </Text>
          )}
        </View>

        {/* Compass */}
        <View style={styles.compassContainer}>
          <View style={styles.compass}>
            {/* Compass Circle */}
            <Animated.View
              style={[
                styles.compassCircle,
                {
                  transform: [
                    { rotate: `${-compassData.deviceHeading || 0}deg` },
                  ],
                },
              ]}
            >
              {/* Cardinal Directions */}
              <Text style={[styles.cardinalText, styles.northText]}>N</Text>
              <Text style={[styles.cardinalText, styles.eastText]}>E</Text>
              <Text style={[styles.cardinalText, styles.southText]}>S</Text>
              <Text style={[styles.cardinalText, styles.westText]}>W</Text>
            </Animated.View>

            {/* Kaaba Icon */}
            <Animated.View
              style={[
                styles.kaabaIndicator,
                {
                  transform: [
                    {
                      rotate: rotationAnim.interpolate({
                        inputRange: [-180, 180],
                        outputRange: ['-180deg', '180deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.arrow}>
                <Text style={styles.kaabaIcon}>🕋</Text>
                <View style={styles.arrowShape} />
              </View>
            </Animated.View>

            {/* Center Dot */}
            <View style={styles.centerDot} />

            {/* Calibration Hint */}
            <Animated.View
              style={[
                styles.calibrationHint,
                { opacity: calibrationOpacity },
              ]}
            >
              <Text style={styles.calibrationText}>
                Rotate device in figure-8 pattern to calibrate
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Direction</Text>
            <Text style={styles.infoValue}>
              {Math.round(compassData.qiblaDirection || 0)}°
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>
              {Math.round(compassData.distance || 0)} km
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Hold your device flat and rotate until the Kaaba icon points up
          </Text>
        </View>

        {/* Show Map Button */}
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setShowMap(true)}
        >
          <Text style={styles.mapButtonText}>Show Map View</Text>
        </TouchableOpacity>

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 24,
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
  fallbackText: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    justifyContent: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  locationTextContainer: {
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  coordsText: {
    fontSize: 11,
    color: colors.secondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
  calibrationHint: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'rgba(255,215,0,0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  calibrationText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
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
  mapButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
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
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginVertical: spacing.lg,
  },
  kaabaMapIcon: {
    fontSize: 32,
  },
  switchButton: {
    backgroundColor: colors.secondary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 16,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
});

export default QiblaScreen;
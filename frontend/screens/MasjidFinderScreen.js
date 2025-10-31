/**
 * Masjid Finder Screen - مكتشف المساجد
 * In-app Google Maps integration for finding nearby mosques
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { colors, spacing, shadows } from '../utils/theme';
import { getCurrentLocation, getCityFromCoordinates } from '../utils/locationUtils';
import { API_KEYS, API_URLS } from '../config/api';

const { width, height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MasjidFinderScreen = ({ navigation }) => {
  const [region, setRegion] = useState(INITIAL_REGION);
  const [userLocation, setUserLocation] = useState(null);
  const [mosques, setMosques] = useState([]);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mapRef = useRef(null);
  const bottomSheetAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeMap();
    startPulseAnimation();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const initializeMap = async () => {
    try {
      console.log('🗺️ [MasjidFinder] Initializing map...');
      setLoading(true);

      // Get user location
      const location = await getCurrentLocation();
      
      if (!location || !location.latitude || !location.longitude) {
        console.warn('⚠️ [MasjidFinder] Location not available');
        Alert.alert(
          'Location Required',
          'Please enable location services to find nearby mosques.',
          [
            { text: 'Retry', onPress: initializeMap },
            { text: 'Cancel', onPress: () => navigation.goBack() },
          ]
        );
        setLoading(false);
        return;
      }

      console.log(`✅ [MasjidFinder] Location: ${location.latitude}, ${location.longitude}`);
      
      setUserLocation(location);
      
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      
      setRegion(newRegion);

      // Get city name
      const locationData = await getCityFromCoordinates(location.latitude, location.longitude);
      setCityName(locationData.formatted || locationData.city);
      console.log(`🌍 [MasjidFinder] City: ${locationData.formatted}`);

      // Fetch nearby mosques
      await fetchNearbyMosques(location.latitude, location.longitude);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ [MasjidFinder] Error initializing map:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load map. Please try again.');
    }
  };

  const fetchNearbyMosques = async (lat, lon, radius = 3000) => {
    try {
      console.log(`🕌 [MasjidFinder] Fetching mosques near (${lat}, ${lon}), radius: ${radius}m`);
      setSearching(true);

      const apiKey = API_KEYS.GOOGLE_PLACES;
      
      if (!apiKey || apiKey.includes('Dummy')) {
        console.warn('⚠️ [MasjidFinder] Google Places API key not configured');
        // Use fallback demo data for testing
        setMosques(generateDemoMosques(lat, lon));
        setSearching(false);
        return;
      }

      const url = `${API_URLS.GOOGLE_PLACES}?location=${lat},${lon}&radius=${radius}&type=mosque&key=${apiKey}`;
      
      console.log('📡 [MasjidFinder] Calling Google Places API...');
      const response = await axios.get(url);

      if (response.data.results) {
        console.log(`✅ [MasjidFinder] Found ${response.data.results.length} mosques`);
        setMosques(response.data.results);
      } else {
        console.warn('⚠️ [MasjidFinder] No mosques found');
        setMosques([]);
      }

      setSearching(false);
    } catch (error) {
      console.error('❌ [MasjidFinder] Error fetching mosques:', error.message);
      
      // Use fallback demo data
      console.log('🔄 [MasjidFinder] Using demo data as fallback');
      setMosques(generateDemoMosques(lat, lon));
      setSearching(false);
    }
  };

  const generateDemoMosques = (lat, lon) => {
    // Generate some demo mosques nearby for testing
    const demoMosques = [];
    const offsets = [
      { lat: 0.01, lon: 0.01, name: 'Masjid Al-Rahman' },
      { lat: -0.01, lon: 0.01, name: 'Masjid Al-Noor' },
      { lat: 0.01, lon: -0.01, name: 'Masjid Al-Taqwa' },
      { lat: -0.01, lon: -0.01, name: 'Masjid Al-Huda' },
      { lat: 0.015, lon: 0, name: 'Masjid Al-Iman' },
    ];

    offsets.forEach((offset, index) => {
      demoMosques.push({
        place_id: `demo_${index}`,
        name: offset.name,
        geometry: {
          location: {
            lat: lat + offset.lat,
            lng: lon + offset.lon,
          },
        },
        vicinity: 'Demo Location',
      });
    });

    return demoMosques;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const handleMarkerPress = (mosque) => {
    console.log('📍 [MasjidFinder] Mosque selected:', mosque.name);
    setSelectedMosque(mosque);
    
    // Animate bottom sheet up
    Animated.spring(bottomSheetAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Center map on mosque
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: mosque.geometry.location.lat,
        longitude: mosque.geometry.location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const closeBottomSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedMosque(null);
    });
  };

  const openInGoogleMaps = () => {
    if (!selectedMosque) return;

    const { lat, lng } = selectedMosque.geometry.location;
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        Linking.openURL(webUrl);
      }
    });
  };

  const recenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0B3D2E', '#145A32']}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>جاري تحميل الخريطة...</Text>
        <Text style={styles.loadingTextEn}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Google Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        onPress={closeBottomSheet}
      >
        {/* User Location Circle */}
        {userLocation && (
          <>
            <Circle
              center={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              radius={50}
              fillColor="rgba(74, 144, 226, 0.3)"
              strokeColor="rgba(74, 144, 226, 0.8)"
              strokeWidth={2}
            />
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.userMarker}>
                  <View style={styles.userMarkerInner} />
                </View>
              </Animated.View>
            </Marker>
          </>
        )}

        {/* Mosque Markers */}
        {mosques.map((mosque, index) => (
          <Marker
            key={mosque.place_id || `mosque_${index}`}
            coordinate={{
              latitude: mosque.geometry.location.lat,
              longitude: mosque.geometry.location.lng,
            }}
            onPress={() => handleMarkerPress(mosque)}
          >
            <Animated.View
              style={[
                styles.mosqueMarker,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['#34A853', '#0F9D58']}
                style={styles.markerGradient}
              >
                <Text style={styles.mosqueIcon}>🕌</Text>
              </LinearGradient>
            </Animated.View>
          </Marker>
        ))}
      </MapView>

      {/* Top Info Card */}
      <Animated.View style={[styles.topCard, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(11,61,46,0.95)', 'rgba(20,90,50,0.95)']}
          style={styles.topCardGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.topCardContent}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#FFD700" />
            <View style={styles.topCardText}>
              <Text style={styles.cityName}>{cityName || 'Finding location...'}</Text>
              <Text style={styles.mosquesCount}>
                {searching ? 'Searching...' : `${mosques.length} مساجد قريبة`}
              </Text>
            </View>
          </View>

          {searching && (
            <ActivityIndicator size="small" color="#FFD700" style={styles.searchingIndicator} />
          )}
        </LinearGradient>
      </Animated.View>

      {/* Recenter Button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={recenterMap}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.recenterGradient}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      {selectedMosque && (
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: bottomSheetAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#fff', '#E8F5E9']}
            style={styles.bottomSheetGradient}
          >
            {/* Handle */}
            <View style={styles.bottomSheetHandle} />

            {/* Mosque Info */}
            <View style={styles.mosqueInfo}>
              <View style={styles.mosqueHeader}>
                <Text style={styles.mosqueIcon}>🕌</Text>
                <View style={styles.mosqueTitleContainer}>
                  <Text style={styles.mosqueName}>{selectedMosque.name}</Text>
                  <Text style={styles.mosqueAddress}>
                    {selectedMosque.vicinity || 'No address available'}
                  </Text>
                </View>
              </View>

              {userLocation && (
                <View style={styles.distanceContainer}>
                  <MaterialCommunityIcons name="map-marker-distance" size={18} color="#666" />
                  <Text style={styles.distanceText}>
                    {calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      selectedMosque.geometry.location.lat,
                      selectedMosque.geometry.location.lng
                    )} away
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={openInGoogleMaps}
                >
                  <LinearGradient
                    colors={['#0B3D2E', '#145A32']}
                    style={styles.directionsGradient}
                  >
                    <MaterialCommunityIcons name="directions" size={20} color="#fff" />
                    <Text style={styles.directionsText}>اتجاهات / Directions</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeBottomSheet}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Mosque Count Badge */}
      <View style={styles.countBadge}>
        <LinearGradient
          colors={['rgba(52,168,83,0.95)', 'rgba(15,157,88,0.95)']}
          style={styles.countBadgeGradient}
        >
          <MaterialCommunityIcons name="mosque" size={20} color="#fff" />
          <Text style={styles.countBadgeText}>{mosques.length}</Text>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: spacing.md,
    fontWeight: '600',
  },
  loadingTextEn: {
    fontSize: 14,
    color: '#fff',
    marginTop: spacing.xs,
  },

  // User Marker
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    borderWidth: 3,
    borderColor: '#fff',
    ...shadows.medium,
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },

  // Mosque Marker
  mosqueMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...shadows.large,
  },
  markerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mosqueIcon: {
    fontSize: 24,
  },

  // Top Card
  topCard: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.large,
  },
  topCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  topCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  topCardText: {
    marginLeft: spacing.sm,
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  mosquesCount: {
    fontSize: 13,
    color: '#FFD700',
    marginTop: 2,
  },
  searchingIndicator: {
    marginRight: spacing.sm,
  },

  // Recenter Button
  recenterButton: {
    position: 'absolute',
    bottom: 140,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...shadows.large,
  },
  recenterGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...shadows.large,
  },
  bottomSheetGradient: {
    padding: spacing.lg,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  mosqueInfo: {
    marginBottom: spacing.md,
  },
  mosqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mosqueTitleContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  mosqueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B3D2E',
    marginBottom: 4,
  },
  mosqueAddress: {
    fontSize: 14,
    color: '#666',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  directionsButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  directionsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  directionsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Count Badge
  countBadge: {
    position: 'absolute',
    top: 130,
    right: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.medium,
  },
  countBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default MasjidFinderScreen;


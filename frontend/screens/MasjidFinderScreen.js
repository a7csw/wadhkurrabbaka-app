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
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  Linking,
  SafeAreaView,
  Alert,
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
  const [fullAddress, setFullAddress] = useState(''); // ADDED: Full formatted address
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [nearestMosque, setNearestMosque] = useState(null);
  
  const mapRef = useRef(null);
  const bottomSheetAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const markerScaleAnim = useRef(new Animated.Value(0)).current; // ADDED: For marker animation

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

  // ADDED: Animate markers when mosques load
  useEffect(() => {
    if (mosques.length > 0) {
      // Find and set nearest mosque
      if (userLocation) {
        const nearest = mosques[0]; // Already sorted by distance
        setNearestMosque(nearest);
        console.log(`📌 [MasjidFinder] Nearest mosque: ${nearest.name}`);
      }

      // Animate markers appearing
      Animated.spring(markerScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [mosques, userLocation]);

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

      // Get city name and full address
      const locationData = await getCityFromCoordinates(location.latitude, location.longitude);
      setCityName(`${locationData.city}, ${locationData.country}`);
      setFullAddress(locationData.formatted || `${locationData.city}, ${locationData.country}`);
      console.log(`🌍 [MasjidFinder] Location: ${locationData.formatted}`);

      // Fetch nearby mosques
      await fetchNearbyMosques(location.latitude, location.longitude);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ [MasjidFinder] Error initializing map:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load map. Please try again.');
    }
  };

  // ENHANCED: Fetch nearby mosques with improved API parameters and error handling
  const fetchNearbyMosques = async (lat, lon, radius = 5000) => {
    try {
      console.log(`🕌 [MasjidFinder] Fetching mosques near (${lat}, ${lon}), radius: ${radius}m`);
      setSearching(true);

      const apiKey = API_KEYS.GOOGLE_PLACES;
      
      if (!apiKey || apiKey.includes('Dummy')) {
        console.warn('⚠️ [MasjidFinder] Google Places API key not configured');
        console.log('📝 [MasjidFinder] Using demo mosques for testing');
        // Use fallback demo data for testing
        setMosques(generateDemoMosques(lat, lon));
        setSearching(false);
        return;
      }

      // ENHANCED: More specific API parameters for better results
      const params = new URLSearchParams({
        location: `${lat},${lon}`,
        radius: radius.toString(),
        type: 'mosque',
        keyword: 'mosque masjid', // ADDED: Better keyword matching
        key: apiKey,
      });

      const url = `${API_URLS.GOOGLE_PLACES}?${params.toString()}`;
      
      console.log('📡 [MasjidFinder] Calling Google Places API...');
      console.log(`🔗 [MasjidFinder] URL: ${API_URLS.GOOGLE_PLACES}`);
      
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        console.log(`✅ [MasjidFinder] Found ${response.data.results.length} mosques`);
        console.log(`📍 [MasjidFinder] First mosque: ${response.data.results[0].name}`);
        
        // Sort by distance (closest first)
        const sortedMosques = response.data.results.sort((a, b) => {
          const distA = calculateDistanceInKm(lat, lon, a.geometry.location.lat, a.geometry.location.lng);
          const distB = calculateDistanceInKm(lat, lon, b.geometry.location.lat, b.geometry.location.lng);
          return distA - distB;
        });
        
        setMosques(sortedMosques);
        setError(null); // Clear any previous errors
      } else {
        console.warn('⚠️ [MasjidFinder] No mosques found in API response');
        setMosques([]);
        setError({
          type: 'no_results',
          message: 'No mosques found nearby',
          messageAr: 'لم يتم العثور على مساجد قريبة',
        });
      }

      setSearching(false);
    } catch (error) {
      console.error('❌ [MasjidFinder] Error fetching mosques:', error.message);
      console.error('❌ [MasjidFinder] Error details:', error.response?.data || error);
      
      // ENHANCED: Better error handling with user-friendly messages
      if (error.message.includes('timeout')) {
        setError({
          type: 'timeout',
          message: 'Request timed out. Check your internet connection.',
          messageAr: 'انقطع الاتصال. تحقق من اتصالك بالإنترنت.',
        });
      } else if (error.message.includes('Network')) {
        setError({
          type: 'network',
          message: 'No internet connection. Please check your network.',
          messageAr: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من شبكتك.',
        });
      } else {
        setError({
          type: 'api_error',
          message: 'Unable to fetch mosques. Using demo data.',
          messageAr: 'تعذر جلب المساجد. استخدام بيانات تجريبية.',
        });
      }
      
      // Use fallback demo data only if API fails
      console.log('🔄 [MasjidFinder] Using demo mosques as fallback');
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

  // ENHANCED: Calculate distance in km (for sorting)
  const calculateDistanceInKm = (lat1, lon1, lat2, lon2) => {
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
    return R * c; // Returns km as number
  };

  // ENHANCED: Calculate distance with formatted output
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const distance = calculateDistanceInKm(lat1, lon1, lat2, lon2);
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

        {/* REFINED: Mosque Markers - uniform green with golden glow on nearest */}
        {mosques.map((mosque, index) => {
          const isNearest = nearestMosque && mosque.place_id === nearestMosque.place_id;
          
          return (
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
                  styles.mosqueMarker, // Same base size for all (52×52)
                  isNearest && styles.nearestMosqueGlow, // Add glow only to nearest
                  {
                    opacity: markerScaleAnim,
                    transform: [
                      {
                        scale: markerScaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1], // Same scale for all
                        }),
                      },
                      // REFINED: Gentle pulse only for nearest
                      isNearest && {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.3],
                          outputRange: [1, 1.08], // Subtle pulse (8%)
                        }),
                      },
                    ].filter(Boolean),
                  },
                ]}
              >
                {/* REFINED: All markers use same green gradient */}
                <LinearGradient
                  colors={['#34A853', '#0F9D58']}
                  style={styles.markerGradient}
                >
                  <Text style={styles.mosqueIcon}>🕌</Text>
                </LinearGradient>
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      {/* ENHANCED: Redesigned Top Header Card with SafeAreaView */}
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.topCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(0,128,64,0.9)', 'rgba(11,61,46,0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topCardGradient}
          >
            {/* REFINED: Back Button - correct arrow direction (left for back) */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            
            {/* Center: Address Text (full formatted address) */}
            <View style={styles.topCardContent}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={22} 
                color="#fff"
                style={styles.locationIcon}
              />
              <View style={styles.addressContainer}>
                <Text 
                  style={styles.addressText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {fullAddress || cityName || 'Finding location...'}
                </Text>
              </View>
            </View>

            {/* Right: Compact Mosque Count Badge */}
            {searching ? (
              <ActivityIndicator size="small" color="#FFD700" style={styles.loadingIndicator} />
            ) : (
              <View style={styles.mosqueBadge}>
                <Text style={styles.mosqueBadgeText}>{mosques.length}</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>

      {/* ENHANCED: Error Message Card (for no mosques or network issues) */}
      {error && mosques.length === 0 && !searching && (
        <Animated.View style={[styles.errorCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(255, 193, 7, 0.95)', 'rgba(255, 152, 0, 0.95)']}
            style={styles.errorGradient}
          >
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#fff" />
            <Text style={styles.errorMessageAr}>{error.messageAr}</Text>
            <Text style={styles.errorMessageEn}>{error.message}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                if (userLocation) {
                  fetchNearbyMosques(userLocation.latitude, userLocation.longitude);
                }
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="reload" size={18} color="#fff" />
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}

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

      {/* ENHANCED: Error/Empty State Message */}
      {!loading && !searching && mosques.length === 0 && (
        <View style={styles.emptyStateCard}>
          <LinearGradient
            colors={['rgba(20,90,50,0.95)', 'rgba(11,61,46,0.95)']}
            style={styles.emptyStateGradient}
          >
            <MaterialCommunityIcons name="mosque-outline" size={48} color="#FFD700" />
            <Text style={styles.emptyStateTitle}>لا توجد مساجد قريبة</Text>
            <Text style={styles.emptyStateSubtitle}>No mosques found nearby</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchNearbyMosques(userLocation.latitude, userLocation.longitude)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="reload" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
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

  // REFINED: All mosque markers - uniform size (52×52)
  mosqueMarker: {
    width: 52, // UNIFIED: Same size for all markers
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    // Standard shadow for regular mosques
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  // REFINED: Golden glow effect for nearest mosque only
  nearestMosqueGlow: {
    shadowColor: '#FFD700', // Golden shadow
    shadowOffset: { width: 0, height: 0 }, // Glow all around
    shadowOpacity: 0.8, // Strong glow
    shadowRadius: 8, // Wide spread
    elevation: 8, // Higher elevation on Android
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

  // ENHANCED: SafeAreaView for header
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  // ENHANCED: Redesigned Top Card - clean, modern layout
  topCard: {
    marginTop: Platform.OS === 'ios' ? 0 : spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    // Enhanced shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  topCardGradient: {
    flexDirection: 'row', // Left (back) | Center (address) | Right (badge)
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, // Consistent horizontal padding
    paddingVertical: 10, // Consistent vertical padding
  },
  // REFINED: Back button - clear visual, proper spacing
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2, // ADDED: Small left margin for balance
  },
  topCardContent: {
    flex: 1, // Take remaining space
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  locationIcon: {
    marginRight: 6, // Small gap between icon and text
  },
  addressContainer: {
    flex: 1, // Allow text to expand and wrap
  },
  addressText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  mosquesCountSubtext: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
    marginTop: 2,
  },
  // ENHANCED: Mosque count badge - white background, green text
  mosqueBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosqueBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a6b3a',
  },
  loadingIndicator: {
    marginRight: 4,
  },

  // ENHANCED: Error Message Card
  errorCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 140,
    left: spacing.md,
    right: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.large,
  },
  errorGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorMessageAr: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  errorMessageEn: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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

  // ENHANCED: Empty State Card
  emptyStateCard: {
    position: 'absolute',
    top: '40%',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.large,
  },
  emptyStateGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.xs,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MasjidFinderScreen;


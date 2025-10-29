import * as Location from 'expo-location';
import { saveLastLocation, getLastLocation } from './storage';
import { API_KEYS, API_URLS } from '../config/api';

export const requestLocationPermission = async () => {
  try {
    console.log('🔑 [LocationUtils] Requesting location permissions...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log(`✅ [LocationUtils] Permission status: ${status}`);
    return status === 'granted';
  } catch (error) {
    console.error('❌ [LocationUtils] Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    console.log('📍 [LocationUtils] Getting current location...');
    
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      console.warn('⚠️ [LocationUtils] Location permission denied, trying last known location');
      const lastLocation = await getLastLocation();
      if (lastLocation) {
        console.log('✅ [LocationUtils] Using last known location:', lastLocation);
        return lastLocation;
      }
      console.error('❌ [LocationUtils] No last known location available');
      return null;
    }

    console.log('🌐 [LocationUtils] Fetching GPS position...');
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000, // 10 second timeout
    });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    console.log('✅ [LocationUtils] GPS position obtained:');
    console.log(`   Latitude: ${coords.latitude}`);
    console.log(`   Longitude: ${coords.longitude}`);
    console.log(`   Accuracy: ${location.coords.accuracy}m`);
    console.log(`   Altitude: ${location.coords.altitude}m`);

    // Save location for future use
    await saveLastLocation(coords);
    console.log('💾 [LocationUtils] Location saved to storage');
    
    return coords;
  } catch (error) {
    console.error('❌ [LocationUtils] Error getting current location:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Try to return last known location as fallback
    console.log('🔄 [LocationUtils] Attempting fallback to last known location...');
    const lastLocation = await getLastLocation();
    if (lastLocation) {
      console.log('✅ [LocationUtils] Fallback successful:', lastLocation);
      return lastLocation;
    }
    
    console.error('❌ [LocationUtils] No fallback location available');
    return null;
  }
};

export const calculateQiblaDirection = (userLat, userLon) => {
  console.log(`🧭 [LocationUtils] Calculating Qibla from (${userLat}, ${userLon})`);
  
  // Kaaba coordinates (Mecca, Saudi Arabia)
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  // Convert to radians
  const lat1 = (userLat * Math.PI) / 180;
  const lat2 = (kaabaLat * Math.PI) / 180;
  const deltaLon = ((kaabaLon - userLon) * Math.PI) / 180;

  // Calculate bearing using spherical trigonometry
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  let bearing = Math.atan2(y, x);

  // Convert to degrees
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  console.log(`✅ [LocationUtils] Qibla direction calculated: ${bearing.toFixed(2)}°`);
  return bearing;
};

export const getDistanceToKaaba = (userLat, userLon) => {
  console.log(`📏 [LocationUtils] Calculating distance from (${userLat}, ${userLon}) to Kaaba`);
  
  // Kaaba coordinates (Mecca, Saudi Arabia)
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  // Haversine formula for great circle distance
  const R = 6371; // Earth's radius in km
  const dLat = ((kaabaLat - userLat) * Math.PI) / 180;
  const dLon = ((kaabaLon - userLon) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((kaabaLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const roundedDistance = Math.round(distance);

  console.log(`✅ [LocationUtils] Distance to Kaaba: ${roundedDistance.toLocaleString()} km`);
  return roundedDistance;
};

export const getCityName = async (latitude, longitude) => {
  try {
    const result = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (result && result.length > 0) {
      const { city, region, country } = result[0];
      return city || region || country || 'Unknown Location';
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Error getting city name:', error);
    return 'Unknown Location';
  }
};

/**
 * Get detailed city and country from coordinates using OpenCage API
 * @param {number} latitude - User latitude
 * @param {number} longitude - User longitude
 * @returns {Promise<{city: string, country: string, formatted: string}>}
 */
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    console.log(`🌍 [LocationUtils] Reverse geocoding (${latitude}, ${longitude})`);
    
    // First, try OpenCage API for more detailed results
    if (API_KEYS.OPENCAGE) {
      console.log('🔑 [LocationUtils] Using OpenCage API...');
      const url = `${API_URLS.OPENCAGE}/json?q=${latitude}+${longitude}&key=${API_KEYS.OPENCAGE}&language=en&pretty=1`;
      
      console.log(`📡 [LocationUtils] API Request: ${API_URLS.OPENCAGE}/json?q=${latitude}+${longitude}&key=***`);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`📥 [LocationUtils] OpenCage API status: ${data.status?.code || 'unknown'}`);
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
        console.log('📦 [LocationUtils] OpenCage components:', JSON.stringify(components, null, 2));
        
        // Extract city (try multiple possible fields)
        const city = components.city 
          || components.town 
          || components.village 
          || components.county 
          || components.state_district 
          || components.state 
          || 'Unknown';
        
        // Extract country
        const country = components.country || 'Unknown';
        
        // Full formatted address
        const formatted = result.formatted || `${city}, ${country}`;
        
        console.log(`✅ [LocationUtils] OpenCage result: ${city}, ${country}`);
        
        return {
          city,
          country,
          formatted,
          latitude,
          longitude,
        };
      } else {
        console.warn('⚠️ [LocationUtils] OpenCage returned no results');
      }
    } else {
      console.warn('⚠️ [LocationUtils] OpenCage API key not configured');
    }
    
    // Fallback to Expo's built-in reverse geocoding
    console.log('🔄 [LocationUtils] Falling back to Expo Location API...');
    const result = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (result && result.length > 0) {
      const { city, region, country } = result[0];
      const locationCity = city || region || 'Unknown';
      const locationCountry = country || 'Unknown';
      
      console.log(`✅ [LocationUtils] Expo Location result: ${locationCity}, ${locationCountry}`);
      
      return {
        city: locationCity,
        country: locationCountry,
        formatted: `${locationCity}, ${locationCountry}`,
        latitude,
        longitude,
      };
    }
    
    // Final fallback
    console.warn('⚠️ [LocationUtils] All geocoding methods failed, using fallback');
    return {
      city: 'Unknown',
      country: 'Unknown',
      formatted: 'Unknown Location',
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('❌ [LocationUtils] Error getting location details:', error);
    console.error('Error message:', error.message);
    
    // Return error fallback
    return {
      city: 'Unknown',
      country: 'Unknown',
      formatted: 'Unknown Location',
      latitude,
      longitude,
    };
  }
};



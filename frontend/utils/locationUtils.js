import * as Location from 'expo-location';
import { saveLastLocation, getLastLocation } from './storage';
import { API_KEYS, API_URLS } from '../config/api';

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      console.log('Location permission not granted, trying to get last known location');
      return await getLastLocation();
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Save location for future use
    await saveLastLocation(coords);
    
    return coords;
  } catch (error) {
    console.error('Error getting current location:', error);
    // Try to return last known location
    return await getLastLocation();
  }
};

export const calculateQiblaDirection = (userLat, userLon) => {
  // Kaaba coordinates
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  // Convert to radians
  const lat1 = (userLat * Math.PI) / 180;
  const lat2 = (kaabaLat * Math.PI) / 180;
  const deltaLon = ((kaabaLon - userLon) * Math.PI) / 180;

  // Calculate bearing
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  let bearing = Math.atan2(y, x);

  // Convert to degrees
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return bearing;
};

export const getDistanceToKaaba = (userLat, userLon) => {
  // Kaaba coordinates
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  // Haversine formula
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

  return Math.round(distance);
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
    // First, try OpenCage API for more detailed results
    if (API_KEYS.OPENCAGE) {
      const url = `${API_URLS.OPENCAGE}/json?q=${latitude}+${longitude}&key=${API_KEYS.OPENCAGE}&language=en&pretty=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
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
        
        return {
          city,
          country,
          formatted,
          latitude,
          longitude,
        };
      }
    }
    
    // Fallback to Expo's built-in reverse geocoding
    const result = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (result && result.length > 0) {
      const { city, region, country } = result[0];
      const locationCity = city || region || 'Unknown';
      const locationCountry = country || 'Unknown';
      
      return {
        city: locationCity,
        country: locationCountry,
        formatted: `${locationCity}, ${locationCountry}`,
        latitude,
        longitude,
      };
    }
    
    // Final fallback
    return {
      city: 'Unknown',
      country: 'Unknown',
      formatted: 'Unknown Location',
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('Error getting location details from coordinates:', error);
    
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



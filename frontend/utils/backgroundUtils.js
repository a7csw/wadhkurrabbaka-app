/**
 * Background Image Utility for Wathkur Rabbak
 * 
 * Fetches random images from Unsplash API based on prayer time
 * Implements caching to avoid frequent API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UNSPLASH_ACCESS_KEY } from '@env';

const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/random';
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const CACHE_KEY_PREFIX = 'background_image_';

/**
 * Get search query based on current prayer time
 * @param {string} currentPrayerTime - Current prayer period (Fajr, Dhuhr, Asr, Maghrib, Isha)
 * @returns {string} - Unsplash search query
 */
export const getSearchQueryForPrayerTime = (currentPrayerTime) => {
  const queries = {
    Fajr: 'kaaba dawn',
    Dhuhr: 'prophet mosque daylight',
    Asr: 'kaaba afternoon',
    Maghrib: 'kaaba sunset',
    Isha: 'prophet mosque night',
  };
  
  return queries[currentPrayerTime] || 'kaaba makkah';
};

/**
 * Determine current prayer time period based on hour
 * @param {number} hour - Current hour (0-23)
 * @returns {string} - Prayer time period
 */
export const getCurrentPrayerPeriod = (hour) => {
  if (hour >= 4 && hour < 11) return 'Fajr';
  if (hour >= 11 && hour < 15) return 'Dhuhr';
  if (hour >= 15 && hour < 18) return 'Asr';
  if (hour >= 18 && hour < 20) return 'Maghrib';
  return 'Isha';
};

/**
 * Fetch background image from Unsplash API
 * @param {string} query - Search query
 * @returns {Promise<object>} - Image data with URL and photographer info
 */
export const fetchBackgroundFromUnsplash = async (query) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not found. Using fallback image.');
      return null;
    }

    const response = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&orientation=portrait&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      url: data.urls.regular,
      photographer: data.user.name,
      photographerUrl: data.user.links.html,
      downloadLocation: data.links.download_location,
    };
  } catch (error) {
    console.error('Error fetching background from Unsplash:', error);
    return null;
  }
};

/**
 * Get cached background image
 * @param {string} prayerPeriod - Prayer time period
 * @returns {Promise<object|null>} - Cached image data or null
 */
const getCachedBackground = async (prayerPeriod) => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${prayerPeriod}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 3 hours)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
    
    // Cache expired, remove it
    await AsyncStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Error reading cached background:', error);
    return null;
  }
};

/**
 * Cache background image data
 * @param {string} prayerPeriod - Prayer time period
 * @param {object} imageData - Image data to cache
 */
const cacheBackground = async (prayerPeriod, imageData) => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${prayerPeriod}`;
    const cacheData = {
      data: imageData,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching background:', error);
  }
};

/**
 * Get fallback background color based on prayer period
 * @param {string} prayerPeriod - Prayer time period
 * @returns {array} - Gradient colors for LinearGradient
 */
export const getFallbackBackground = (prayerPeriod) => {
  // Using gradient colors as fallback instead of images
  // This ensures the app works even without local images
  const gradients = {
    Fajr: ['#0A4F3F', '#145A32', '#1F7A4D'], // Dawn greens
    Dhuhr: ['#145A32', '#1F7A4D', '#2E8B57'], // Bright day greens
    Asr: ['#1F7A4D', '#2E8B57', '#3CB371'], // Afternoon lighter greens
    Maghrib: ['#D4AF37', '#145A32', '#0A4F3F'], // Sunset gold to green
    Isha: ['#0A3D2F', '#0A4F3F', '#145A32'], // Night dark greens
  };
  
  return gradients[prayerPeriod] || gradients.Fajr;
};

/**
 * Main function to get background image for current time
 * @returns {Promise<object>} - Background image data
 */
export const getBackgroundImage = async () => {
  const hour = new Date().getHours();
  const prayerPeriod = getCurrentPrayerPeriod(hour);
  
  // Try to get cached image first
  const cached = await getCachedBackground(prayerPeriod);
  if (cached) {
    console.log(`Using cached background for ${prayerPeriod}`);
    return { ...cached, prayerPeriod, fromCache: true };
  }
  
  // Fetch new image from Unsplash
  const query = getSearchQueryForPrayerTime(prayerPeriod);
  const imageData = await fetchBackgroundFromUnsplash(query);
  
  if (imageData) {
    // Cache the new image
    await cacheBackground(prayerPeriod, imageData);
    return { ...imageData, prayerPeriod, fromCache: false };
  }
  
  // Fallback to local image if API fails
  console.log(`Using fallback background for ${prayerPeriod}`);
  return {
    url: getFallbackBackground(prayerPeriod),
    prayerPeriod,
    isFallback: true,
  };
};

/**
 * Trigger download tracking for Unsplash (required by API guidelines)
 * @param {string} downloadLocation - Download location URL from image data
 */
export const triggerUnsplashDownload = async (downloadLocation) => {
  if (!downloadLocation || !UNSPLASH_ACCESS_KEY) return;
  
  try {
    await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
  } catch (error) {
    console.error('Error triggering Unsplash download:', error);
  }
};


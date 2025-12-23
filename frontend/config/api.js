/**
 * API Configuration - Secure Environment Variable Setup
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy env.example to .env in the frontend directory
 * 2. Add your real API keys to .env file
 * 3. Restart Expo with: npx expo start --clear
 * 
 * NEVER commit real API keys to GitHub!
 */

// Access environment variables via process.env (Expo native support)
// Note: EXPO_PUBLIC_* variables are available at build time

// Helper function to show missing key warnings
const showMissingKeyWarning = (keyName, description) => {
  const message = `🔴 Missing API Key: ${keyName}`;
  const instruction = `📝 Add ${keyName} to your .env file. ${description}`;
  console.warn(message);
  console.warn(instruction);
  if (__DEV__) {
    console.warn('💡 Copy env.example to .env and add your API keys');
  }
  return null;
};

// Validate and assign API keys
export const API_KEYS = {
  // OpenCage Geocoding API - REQUIRED for location names
  OPENCAGE: process.env.EXPO_PUBLIC_OPENCAGE_API_KEY || showMissingKeyWarning('EXPO_PUBLIC_OPENCAGE_API_KEY', 'Get from https://opencagedata.com/api'),
  
  // Aladhan Prayer Times API - no key needed
  ALADHAN: null,
  
  // OpenWeatherMap API - optional for weather notifications
  OPENWEATHER: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || null,
  
  // Google API - REQUIRED for maps and places (single variable)
  GOOGLE_MAPS: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || showMissingKeyWarning('EXPO_PUBLIC_GOOGLE_API_KEY', 'Get from https://console.cloud.google.com/apis/credentials'),
  
  // Google Places API - uses same key as Maps
  GOOGLE_PLACES: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || showMissingKeyWarning('EXPO_PUBLIC_GOOGLE_API_KEY', 'Get from https://console.cloud.google.com/apis/credentials'),
};

export const API_URLS = {
  OPENCAGE: 'https://api.opencagedata.com/geocode/v1',
  ALADHAN: process.env.EXPO_PUBLIC_ALADHAN_API || 'https://api.aladhan.com/v1',
  OPENWEATHER: 'https://api.openweathermap.org/data/2.5',
  GOOGLE_MAPS: process.env.EXPO_PUBLIC_GOOGLE_MAPS_URL || 'https://www.google.com/maps/search/mosque/',
  GOOGLE_PLACES: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
};

// Show configuration status
console.log('🔑 [API Config] Security Check:');
console.log('  OpenCage API:', API_KEYS.OPENCAGE ? '✅ Configured' : '❌ MISSING - Location names will not work');
console.log('  Google Maps:', API_KEYS.GOOGLE_MAPS ? '✅ Configured' : '❌ MISSING - Maps will not work');
console.log('  Google Places:', API_KEYS.GOOGLE_PLACES ? '✅ Configured' : '❌ MISSING - Mosque finder will use demo data');
console.log('  Aladhan API:', API_URLS.ALADHAN);

// Show setup reminder if keys are missing
const missingKeys = [];
if (!API_KEYS.OPENCAGE) missingKeys.push('OPENCAGE');
if (!API_KEYS.GOOGLE_MAPS) missingKeys.push('GOOGLE_MAPS');
if (!API_KEYS.GOOGLE_PLACES) missingKeys.push('GOOGLE_PLACES');

if (missingKeys.length > 0) {
  console.error('🚨 [API Config] SETUP REQUIRED:');
  console.error('  1. Copy env.example to .env');
  console.error('  2. Add your API keys to .env file');
  console.error('  3. Restart with: npx expo start --clear');
  console.error(`  Missing: ${missingKeys.join(', ')}`);
}

export default { API_KEYS, API_URLS };
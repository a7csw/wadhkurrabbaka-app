/**
 * API Configuration
 * Supports both environment variables and fallback values
 * 
 * To use environment variables:
 * 1. Create .env file in frontend directory
 * 2. Add: OPENCAGE_API_KEY=your_key
 * 3. Restart Expo with: npx expo start --clear
 */

// Try to import from .env, fallback to hardcoded values
let envVars = {};
try {
  // This will work if react-native-dotenv is configured in babel.config.js
  envVars = require('@env');
} catch (error) {
  console.log('📝 [API Config] Environment variables not available, using fallback values');
}

export const API_KEYS = {
  // OpenCage Geocoding API - for reverse geocoding (coordinates to city name)
  OPENCAGE: envVars.OPENCAGE_API_KEY || 'f823f720145748cc99c3a37e2cf41a70',
  
  // Aladhan Prayer Times API - no key needed
  ALADHAN: null,
  
  // OpenWeatherMap API - for weather notifications (optional)
  OPENWEATHER: envVars.OPENWEATHER_API_KEY || null,
};

export const API_URLS = {
  OPENCAGE: 'https://api.opencagedata.com/geocode/v1',
  ALADHAN: envVars.ALADHAN_API || 'https://api.aladhan.com/v1',
  OPENWEATHER: 'https://api.openweathermap.org/data/2.5',
  GOOGLE_MAPS: envVars.GOOGLE_MAPS_URL || 'https://www.google.com/maps/search/mosque/',
};

console.log('🔑 [API Config] Configuration loaded:');
console.log('  OpenCage API:', API_KEYS.OPENCAGE ? '✅ Configured' : '❌ Missing');
console.log('  Aladhan API:', API_URLS.ALADHAN);
console.log('  Google Maps:', API_URLS.GOOGLE_MAPS);

export default { API_KEYS, API_URLS };





/**
 * API Configuration
 * Store your API keys here
 */

export const API_KEYS = {
  // OpenCage Geocoding API - for reverse geocoding (coordinates to city name)
  OPENCAGE: 'f823f720145748cc99c3a37e2cf41a70',
  
  // Aladhan Prayer Times API - no key needed
  ALADHAN: null,
  
  // OpenWeatherMap API - for weather notifications (optional)
  OPENWEATHER: null,
};

export const API_URLS = {
  OPENCAGE: 'https://api.opencagedata.com/geocode/v1',
  ALADHAN: 'https://api.aladhan.com/v1',
  OPENWEATHER: 'https://api.openweathermap.org/data/2.5',
};

export default { API_KEYS, API_URLS };


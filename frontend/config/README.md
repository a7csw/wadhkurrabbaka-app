# API Configuration

## 📁 File Structure

```
config/
├── api.js          # API keys and URLs
└── README.md       # This file
```

## 🔑 API Keys

This directory contains `api.js` which stores API keys for external services:

### 1. **OpenCage Geocoding API**
- **Purpose**: Converts GPS coordinates to city/country names (reverse geocoding)
- **Usage**: Prayer Widget, location display
- **Status**: ✅ Configured
- **API Key**: `f823f720145748cc99c3a37e2cf41a70`
- **Website**: https://opencagedata.com/
- **Free Tier**: 2,500 requests/day

### 2. **Aladhan Prayer Times API**
- **Purpose**: Fetches accurate prayer times based on location
- **Usage**: Prayer Widget, Prayer Times screen
- **Status**: ✅ Active (no key required)
- **Website**: https://aladhan.com/prayer-times-api

### 3. **OpenWeatherMap API** (Optional)
- **Purpose**: Weather data for rain notifications
- **Usage**: Notification system
- **Status**: ⚠️ Not configured (optional)
- **Website**: https://openweathermap.org/api

## 🔒 Security Notes

### Important:
1. **DO NOT commit sensitive API keys to public repositories**
2. For production apps, use environment variables (`.env` files)
3. The current `api.js` file is for development purposes
4. Consider rotating keys regularly
5. Monitor API usage to prevent exceeding free tier limits

### Best Practices:
- Use `.gitignore` to exclude sensitive config files
- Create separate config files for development/production
- Use environment variables in production
- Implement rate limiting on API calls
- Cache API responses when possible

## 🚀 How to Use

### Option 1: Direct Import (Current)
```javascript
import { API_KEYS, API_URLS } from '../config/api';

// Use in your code
const apiKey = API_KEYS.OPENCAGE;
const apiUrl = API_URLS.OPENCAGE;
```

### Option 2: Environment Variables (Recommended for Production)
Create `.env` file:
```
OPENCAGE_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
```

Update `api.js`:
```javascript
import { OPENCAGE_API_KEY } from '@env';

export const API_KEYS = {
  OPENCAGE: OPENCAGE_API_KEY,
  // ...
};
```

## 📊 API Usage Limits

| Service | Free Tier | Limit |
|---------|-----------|-------|
| OpenCage | 2,500 req/day | Geocoding only |
| Aladhan | Unlimited | No key required |
| OpenWeatherMap | 60 calls/min | Weather data |

## 🛠️ Troubleshooting

### OpenCage API Issues:
- **Error 401**: Invalid API key → Check key in `api.js`
- **Error 402**: Quota exceeded → Upgrade plan or wait 24h
- **Error 403**: Forbidden → Check API permissions
- **No results**: Invalid coordinates or location

### Solutions:
1. Verify API key is correct
2. Check internet connection
3. Ensure coordinates are valid (-90 to 90 lat, -180 to 180 lng)
4. Monitor console logs for detailed errors
5. Implement fallback to Expo's built-in geocoding

## 📝 Adding New APIs

To add a new API service:

1. Add key to `API_KEYS` object:
```javascript
export const API_KEYS = {
  // ... existing keys
  NEW_SERVICE: 'your_api_key',
};
```

2. Add URL to `API_URLS` object:
```javascript
export const API_URLS = {
  // ... existing URLs
  NEW_SERVICE: 'https://api.newservice.com/v1',
};
```

3. Create utility function in appropriate `utils/` file
4. Update this README with service details

## 🔗 Useful Links

- [OpenCage Documentation](https://opencagedata.com/api)
- [Aladhan API Docs](https://aladhan.com/prayer-times-api)
- [OpenWeatherMap Docs](https://openweathermap.org/api)
- [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)

---

**Last Updated**: October 29, 2025  
**Maintainer**: وَاذْكُر رَبَّكَ Team


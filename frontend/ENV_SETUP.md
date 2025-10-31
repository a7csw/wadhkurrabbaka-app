# Environment Variables Setup Guide

## 📝 Overview

The Noor app uses environment variables to securely store API keys and configuration. While the app works with hardcoded fallbacks, using a `.env` file is recommended for production.

## 🔧 Setup Instructions

### Step 1: Create `.env` File

Create a new file named `.env` in the `frontend/` directory:

```bash
cd frontend
touch .env
```

### Step 2: Add Environment Variables

Copy and paste the following into your `.env` file:

```env
# OpenCage Geocoding API - Reverse geocoding (coordinates to city/country)
OPENCAGE_API_KEY=f823f720145748cc99c3a37e2cf41a70

# Aladhan Prayer Times API - Islamic prayer times
ALADHAN_API=https://api.aladhan.com/v1

# Google Maps URL - Find nearby mosques
GOOGLE_MAPS_URL=https://www.google.com/maps/search/mosque/

# OpenWeatherMap API (Optional - for weather notifications)
# OPENWEATHER_API_KEY=your_key_here
```

### Step 3: Restart Expo

After creating/modifying the `.env` file, restart Expo with cleared cache:

```bash
npx expo start --clear
```

or

```bash
npm run start:clear
```

## 🔑 API Keys

### OpenCage Geocoding API ✅
- **Purpose**: Convert GPS coordinates to city/country names
- **Status**: Pre-configured with working key
- **Free Tier**: 2,500 requests/day
- **Website**: https://opencagedata.com/
- **Required**: Yes (for location display)

### Aladhan Prayer Times API ✅
- **Purpose**: Fetch accurate Islamic prayer times
- **Status**: Active (no key required)
- **Free Tier**: Unlimited
- **Website**: https://aladhan.com/
- **Required**: Yes (for prayer times)

### Google Maps ✅
- **Purpose**: Find nearby mosques
- **Status**: Active (no key required for basic search)
- **Required**: Yes (for Find Mosque feature)

### OpenWeatherMap API ⚠️
- **Purpose**: Weather data for rain notifications
- **Status**: Optional (not required)
- **Free Tier**: 60 calls/minute
- **Website**: https://openweathermap.org/api
- **Required**: No (optional feature)

## 📂 File Structure

```
frontend/
├── .env                 ← Your environment variables (create this)
├── .env.template        ← Template file (if protected)
├── babel.config.js      ← Already configured for react-native-dotenv
├── config/
│   └── api.js           ← Uses env vars with fallbacks
└── utils/
    ├── locationUtils.js ← Uses OPENCAGE_API_KEY
    ├── apiUtils.js      ← Uses ALADHAN_API
    └── ...
```

## 🔒 Security Notes

### ⚠️ Important:
1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. For production, use proper secrets management
3. Rotate API keys regularly
4. Monitor API usage to prevent exceeding limits

### Current Status:
- `.env` file is ignored by Git ✅
- API keys have fallback values for development ✅
- All keys are logged (for debugging) - remove in production ⚠️

## 🛠️ Configuration Details

### babel.config.js

The app is already configured to use `react-native-dotenv`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
```

### config/api.js

The API configuration file tries to load from `.env` first, then falls back to hardcoded values:

```javascript
let envVars = {};
try {
  envVars = require('@env');
} catch (error) {
  console.log('Using fallback values');
}

export const API_KEYS = {
  OPENCAGE: envVars.OPENCAGE_API_KEY || 'fallback_key',
  // ...
};
```

## 🧪 Testing

### Verify Environment Variables Loaded:

1. Start the app with `npx expo start --clear`
2. Check the console for:
   ```
   🔑 [API Config] Configuration loaded:
     OpenCage API: ✅ Configured
     Aladhan API: https://api.aladhan.com/v1
     Google Maps: https://www.google.com/maps/search/mosque/
   ```

### Test Each Feature:

1. **Location Display**: HomeScreen should show your city/country
2. **Prayer Times**: Should display accurate times for your location
3. **Qibla**: Should calculate correct direction from your coordinates
4. **Find Mosque**: Should open maps at your location

## 🐛 Troubleshooting

### Problem: Environment variables not loading

**Solution:**
1. Ensure `.env` file is in `frontend/` directory (not root)
2. Restart Expo with `--clear` flag
3. Check for syntax errors in `.env` (no spaces around `=`)
4. Ensure `react-native-dotenv` is installed:
   ```bash
   npm install react-native-dotenv
   ```

### Problem: API calls failing

**Solution:**
1. Check console for error messages
2. Verify API keys are correct
3. Test internet connection
4. Check API rate limits

### Problem: Using wrong API key

**Solution:**
1. The app logs which configuration is being used
2. Check console for: `"Using fallback values"` vs environment values
3. Ensure `.env` file has correct format

## 📊 API Usage Limits

| Service | Free Tier | Daily Limit |
|---------|-----------|-------------|
| OpenCage | 2,500 requests | Per day |
| Aladhan | Unlimited | No limit |
| Google Maps | N/A | No API key needed |
| OpenWeatherMap | 60 requests | Per minute |

## 🚀 Production Deployment

For production apps:

1. **Don't use `.env` files** - Use platform-specific secrets:
   - **iOS**: Use Xcode build configurations
   - **Android**: Use `android/gradle.properties`
   - **Expo**: Use `eas.json` secrets

2. **Use EAS Secrets** (recommended for Expo):
   ```bash
   eas secret:create --scope project --name OPENCAGE_API_KEY --value your_key
   ```

3. **Remove console.log statements** for production:
   - Use a logging library like `react-native-logs`
   - Disable logs in production builds

## 📝 Summary

- ✅ `.env` file is optional (app has fallbacks)
- ✅ Pre-configured with working OpenCage key
- ✅ Aladhan API requires no key
- ✅ All features work out of the box
- ⚠️ For production, use proper secrets management
- ⚠️ Remember to restart Expo after changing `.env`

---

**Last Updated**: October 31, 2025  
**Project**: وَاذْكُر رَبَّكَ (Wadhkur Rabbaka)


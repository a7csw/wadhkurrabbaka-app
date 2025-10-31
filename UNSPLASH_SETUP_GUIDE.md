# Unsplash API Setup Guide

## 🎯 Overview

The Wathkur Rabbak app now displays **real dynamic background photos** of the Kaaba and Prophet's Mosque from Unsplash, changing based on prayer times.

---

## 🔑 Get Your Free Unsplash API Key

### Step 1: Create an Unsplash Account
1. Go to [https://unsplash.com/join](https://unsplash.com/join)
2. Sign up with your email or social account
3. Verify your email address

### Step 2: Register Your Application
1. Visit [https://unsplash.com/oauth/applications](https://unsplash.com/oauth/applications)
2. Click **"New Application"**
3. Accept the API Terms and Conditions
4. Fill in the application details:
   - **Application name:** Wathkur Rabbak
   - **Description:** Islamic app displaying Kaaba and Prophet's Mosque photos
   - **Privacy Policy URL:** (optional, can skip for development)
   - **Redirect URI:** (can use `https://localhost` for development)

### Step 3: Get Your Access Key
1. After creating the application, you'll see your **Access Key** (also called Client ID)
2. Copy this key - you'll need it in the next step

---

## ⚙️ Configure the App

### Step 1: Create `.env` File
In the `frontend` directory, create a file named `.env`:

```bash
cd frontend
cp .env.example .env
```

### Step 2: Add Your API Key
Open the `.env` file and replace the placeholder with your actual key:

```env
UNSPLASH_ACCESS_KEY=YOUR_ACTUAL_ACCESS_KEY_HERE
```

**Example:**
```env
UNSPLASH_ACCESS_KEY=abc123xyz789yourrealaccesskey
```

### Step 3: Restart Expo Server
After adding the API key, you **must** restart the Expo development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart with cache cleared:
npx expo start --clear
```

---

## 📸 How It Works

### Background Photo Selection
The app automatically selects photos based on the current prayer time:

| Prayer Time | Search Query | Theme |
|------------|--------------|-------|
| **Fajr** | "kaaba dawn" | Dawn/sunrise at Kaaba |
| **Dhuhr** | "prophet mosque daylight" | Bright daylight at Madinah |
| **Asr** | "kaaba afternoon" | Afternoon golden hour |
| **Maghrib** | "kaaba sunset" | Sunset at Kaaba |
| **Isha** | "prophet mosque night" | Nighttime at Madinah |

### Caching System
- Photos are cached for **3 hours** to minimize API calls
- Cached photos are stored in AsyncStorage
- When cache expires, a new photo is automatically fetched

### Fallback System
If the Unsplash API is unavailable or the key is missing:
- The app uses **gradient fallbacks** with Islamic green colors
- The app continues to work normally without photos
- No errors or crashes occur

---

## 🚀 Testing

### Step 1: Run the App
```bash
cd frontend
npx expo start --ios
```

### Step 2: Check Console
Watch for these logs in your terminal:
```
✅ Using cached background for Fajr
✅ Photo by [Photographer Name] on Unsplash
```

### Step 3: Pull to Refresh
Swipe down on the HomeScreen to force-refresh the background photo

---

## 🎨 Prayer Widget

The new top widget displays:
- 🕋 **Next Prayer** - Name in Arabic & English
- ⏳ **Countdown** - Live countdown timer (HH:MM:SS)
- 📍 **Location** - Your current city

Updates automatically every 60 seconds.

---

## 🔒 API Limits & Guidelines

### Free Tier Limits
- **50 requests per hour**
- **50,000 requests per month**

### Recommendations
- With 3-hour caching, you'll make ~8 requests per day
- This is well within the free tier limits
- For production apps with many users, consider upgrading

### Unsplash Guidelines
- Always display photographer attribution (automatically handled)
- Trigger download tracking (automatically handled)
- Use high-quality images only (implemented)

---

## 🛠️ Troubleshooting

### Issue: "Background not loading"
**Solution:**
1. Check that `.env` file exists in `frontend/` directory
2. Verify your API key is correct (no extra spaces)
3. Restart Expo with `npx expo start --clear`
4. Check internet connection

### Issue: "401 Unauthorized" in console
**Solution:**
- Your API key is invalid or expired
- Generate a new key from Unsplash dashboard
- Update `.env` file

### Issue: "Rate limit exceeded"
**Solution:**
- You've hit the 50 requests/hour limit
- Wait 1 hour or upgrade your Unsplash plan
- The app will use gradient fallbacks automatically

### Issue: "Photos not changing"
**Solution:**
- This is normal! Photos are cached for 3 hours
- Pull down to refresh if you want to force a new photo
- Clear AsyncStorage in Settings (if implemented)

---

## 🎯 Next Steps

### Optional Enhancements
1. **Add more search queries** for specific times of day
2. **Implement photo history** to avoid repeating recent photos
3. **Add user preferences** for photo categories
4. **Integrate other Islamic locations** (Al-Aqsa, etc.)

### Production Deployment
1. **Never commit `.env`** to version control (already in .gitignore)
2. Use **environment variables** in production (e.g., Expo EAS Secrets)
3. Consider **upgrading Unsplash plan** for higher limits
4. Implement **error tracking** (Sentry, etc.)

---

## 📚 Resources

- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Unsplash Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)
- [React Native Dotenv](https://github.com/goatandsheep/react-native-dotenv)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

---

## 🤝 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your API key is correctly configured
3. Test with fallback gradients (remove API key temporarily)
4. Check Unsplash API status: [status.unsplash.com](https://status.unsplash.com)

---

**Enjoy beautiful, dynamic Islamic architecture photos in your app! 🕌✨**






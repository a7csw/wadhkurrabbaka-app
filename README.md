# وَاذْكُر رَبَّكَ - Wadhkur Rabbaka

<div align="center">

![App Logo](https://img.shields.io/badge/وَاذْكُر%20رَبَّكَ-Islamic%20App-145A32?style=for-the-badge&logo=react&logoColor=white)

**A comprehensive Islamic mobile application for daily remembrance, prayers, and spiritual guidance**

[![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?style=flat-square&logo=react&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![iOS](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-000000?style=flat-square&logo=apple&logoColor=white)](https://developer.apple.com/)

</div>

## 🌟 Features

### 📱 Core Islamic Features
- **🕌 Adhkar**: Daily remembrance and dhikr with beautiful Arabic typography
- **🤲 Duas**: Comprehensive collection of Islamic supplications
- **🕐 Prayer Times**: Accurate prayer times based on your location with live countdown widget
- **🧭 Qibla**: Precise compass direction to Mecca with real-time magnetometer
- **📿 Tasbeeh**: Digital prayer counter with customizable dhikr and gamified garden
- **🗺️ Masjid Finder**: In-app Google Maps integration to find nearby mosques
- **⚙️ Settings**: User preferences and notification management

### 🎨 Premium Design
- **📸 Dynamic Backgrounds**: Real photos of Kaaba & Prophet's Mosque from Unsplash
  - Changes based on prayer times (dawn, daylight, afternoon, sunset, night)
  - 3-hour caching for optimal performance
  - Gradient fallbacks for offline use
- **🕋 Prayer Widget**: Live top-bar showing next prayer, countdown, and location
- **Emerald Green Theme**: Elegant `#145A32` primary color
- **Gold Accents**: Luxurious `#D4AF37` secondary highlights
- **Arabic Typography**: Beautiful RTL text rendering
- **3D Depth Effects**: Modern shadows and elevation
- **Responsive Design**: Optimized for all screen sizes

### 🔧 Technical Features
- **Cross-Platform**: iOS and Android support
- **Offline Capable**: Core features work without internet
- **Location Services**: GPS-based prayer times and location detection
- **Reverse Geocoding**: OpenCage API for accurate city/country names
- **Google Maps Integration**: In-app interactive maps with nearby mosque search
- **Google Places API**: Real-time mosque data with distance calculation
- **Push Notifications**: Prayer reminders and daily adhkar
- **User Authentication**: Secure JWT-based login system (backend)
- **Data Persistence**: AsyncStorage for local data, MongoDB for cloud sync

## 🏗️ Tech Stack

### Frontend
- **React Native (Expo)** - Cross-platform mobile development
- **React Navigation** - Screen navigation and routing
- **React Native Paper** - Material Design components
- **React Native Maps** - Google Maps integration
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **Expo Location** - GPS and location services
- **Expo Notifications** - Push notification system
- **Expo Sensors** - Magnetometer for Qibla compass
- **OpenCage API** - Reverse geocoding for location names
- **Google Maps API** - Interactive map display
- **Google Places API** - Nearby mosque search
- **Aladhan API** - Accurate Islamic prayer times
- **Moment.js** - Time calculations and timezone handling
- **AsyncStorage** - Local data persistence

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing

## 📁 Project Structure

```
wadhkurrabbaka-app/
├── 📱 frontend/                 # React Native Expo App
│   ├── 📂 screens/             # App screens
│   │   ├── HomeScreen.js       # Main dashboard
│   │   ├── AdhkarScreen.js     # Daily remembrance
│   │   ├── DuasScreen.js       # Islamic supplications
│   │   ├── PrayerTimesScreen.js # Prayer times
│   │   ├── QiblaScreen.js      # Qibla direction
│   │   ├── TasbeehScreen.js    # Prayer counter
│   │   └── SettingsScreen.js   # App settings
│   ├── 📂 components/          # Reusable components
│   ├── 📂 context/             # React Context providers
│   ├── 📂 services/            # API services
│   ├── 📂 utils/               # Utility functions
│   └── 📄 App.js               # Main app component
└── 🖥️ backend/                 # Node.js API Server
    ├── 📂 models/              # Database models
    │   ├── User.js             # User schema
    │   ├── Zikr.js             # Adhkar schema
    │   ├── Dua.js              # Dua schema
    │   ├── PrayerTime.js       # Prayer times schema
    │   ├── Tasbeeh.js          # Tasbeeh counter schema
    │   └── Reminder.js         # Reminder schema
    ├── 📂 routes/              # API routes
    ├── 📂 middleware/          # Custom middleware
    ├── 📂 config/              # Configuration files
    └── 📄 server.js            # Express server
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **MongoDB** (local or cloud)
- **iOS Simulator** or **Android Emulator**

### 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/a7csw/wadhkurrabbaka-app.git
cd wadhkurrabbaka-app
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Add your Unsplash API key to .env (see Setup Guide below)
npx expo start
```

### 🔑 API Configuration

The app uses several external APIs to provide enhanced functionality:

#### 1. 📍 OpenCage Geocoding API (✅ Pre-configured)
**Purpose**: Converts GPS coordinates to accurate city and country names

- **Status**: ✅ **Already configured** with API key
- **Location**: `frontend/config/api.js`
- **Free Tier**: 2,500 requests/day
- **Features**: 
  - Accurate reverse geocoding
  - Multi-language support
  - Fallback to Expo's built-in geocoding
- **Current Key**: `f823f720145748cc99c3a37e2cf41a70`

**No action needed** - The OpenCage API is ready to use!

#### 2. 📸 Unsplash API (Optional - for Background Photos)
**Purpose**: Displays beautiful photos of Kaaba & Prophet's Mosque

1. **Get a free Unsplash API key:**
   - Visit [https://unsplash.com/developers](https://unsplash.com/developers)
   - Create a free account
   - Register a new application
   - Copy your Access Key

2. **Add the API key to `.env`:**
   ```bash
   cd frontend
   # Edit .env file
   UNSPLASH_ACCESS_KEY=your_actual_access_key_here
   ```

3. **Restart Expo:**
   ```bash
   npx expo start --clear
   ```

📖 **For detailed setup instructions, see [UNSPLASH_SETUP_GUIDE.md](./UNSPLASH_SETUP_GUIDE.md)**

**Note:** The app works without an Unsplash key using local rotating backgrounds!

#### 3. 🕌 Aladhan Prayer Times API (✅ No key required)
**Purpose**: Provides accurate prayer times based on location

- **Status**: ✅ Active (no API key needed)
- **Endpoint**: `https://api.aladhan.com/v1`
- **Features**: Fajr, Dhuhr, Asr, Maghrib, Isha times
- **Free Tier**: Unlimited requests

#### 4. 🗺️ Google Maps API (Required for Masjid Finder)
**Purpose**: In-app interactive maps to find nearby mosques

1. **Get Google Maps API key:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable: **Maps SDK for iOS** and **Maps SDK for Android**
   - Create credentials → API Key
   - Copy your key

2. **Add the API key to `.env`:**
   ```bash
   cd frontend
   # Edit .env file
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Add to `app.json`:**
   - Update `ios.config.googleMapsApiKey`
   - Update `android.config.googleMaps.apiKey`

📖 **For detailed setup, see [MASJID_FINDER_SETUP.md](./MASJID_FINDER_SETUP.md)**

#### 5. 🕌 Google Places API (Required for Masjid Finder)
**Purpose**: Search for nearby mosques with accurate data

1. **Enable Places API** in the same Google Cloud project
2. **Create another API key** (or use the same one)
3. **Add to `.env`:**
   ```bash
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   ```

**Free Tier**: ~40,000 requests/month

#### 6. 🌦️ OpenWeatherMap API (Optional - for Weather Notifications)
**Purpose**: Rain detection for weather-based notifications

- **Status**: ⚠️ Optional (not required)
- **Get Key**: [https://openweathermap.org/api](https://openweathermap.org/api)
- **Add to**: `frontend/config/api.js`

**Summary**: OpenCage is pre-configured. Add Google Maps/Places for Masjid Finder! 🕌

### 🎯 Running the App

#### iOS Simulator
```bash
cd frontend
npx expo start --ios
```

#### Android Emulator
```bash
cd frontend
npx expo start --android
```

#### Web Preview
```bash
cd frontend
npx expo start --web
```

## 🔌 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### 📿 Adhkar
- `GET /api/adhkar` - Get all adhkar
- `GET /api/adhkar/:id` - Get specific adhkar
- `POST /api/adhkar` - Create new adhkar (admin)
- `PUT /api/adhkar/:id` - Update adhkar (admin)

### 🤲 Duas
- `GET /api/duas` - Get all duas
- `GET /api/duas/:id` - Get specific dua
- `POST /api/duas` - Create new dua (admin)
- `PUT /api/duas/:id` - Update dua (admin)

### 🕐 Prayer Times
- `GET /api/prayer-times` - Get prayer times for location
- `POST /api/prayer-times` - Update prayer times
- `GET /api/prayer-times/qibla` - Get Qibla direction

### 📿 Tasbeeh
- `GET /api/tasbeeh` - Get user's tasbeeh counters
- `POST /api/tasbeeh` - Create new tasbeeh counter
- `PUT /api/tasbeeh/:id` - Update tasbeeh counter

## 🎨 Theme & Design

### Color Palette
- **Primary**: `#145A32` (Emerald Green)
- **Secondary**: `#D4AF37` (Gold)
- **Text**: `#1E1E1E` (Dark Gray)
- **Background**: `#FAF9F6` (Off-White)
- **Accent**: `#2E7D32` (Darker Green)

### Typography
- **Arabic Font**: System default with RTL support
- **English Font**: System default
- **Sizes**: Responsive using `rem` and `vw` units

## 🌍 Internationalization

- **Arabic (RTL)**: Primary language with proper text direction
- **English**: Secondary language support
- **Dynamic Greetings**: Time-based Arabic greetings
- **Cultural Sensitivity**: Islamic calendar and traditions

## 📱 Platform Support

- **iOS**: 13.0+ (iPhone and iPad)
- **Android**: API 21+ (Android 5.0+)
- **Web**: Modern browsers with PWA support

## 🤝 Contributing

We welcome contributions to make this Islamic app better! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow Islamic principles in content and design
- Maintain Arabic language accuracy
- Test on both iOS and Android
- Ensure accessibility compliance
- Write clear commit messages

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Quranic Verses**: From the Holy Quran
- **Islamic Content**: Authentic hadith and scholarly sources
- **Prayer Times**: Aladhan API for accurate calculations
- **Qibla Direction**: Mathematical calculations for precise direction

## 📞 Support

If you have any questions or need help:

- **Issues**: [GitHub Issues](https://github.com/a7csw/wadhkurrabbaka-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/a7csw/wadhkurrabbaka-app/discussions)
- **Email**: [Contact Developer](mailto:your-email@example.com)

---

<div align="center">

**بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ**

*In the name of Allah, the Most Gracious, the Most Merciful*

Made with ❤️ for the Muslim community

</div>


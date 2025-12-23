# CHANGELOG - Noor App Deep Refactor

## 🚀 Major Fixes & Enhancements

### A) ✅ QIBLA ACCURACY - Fixed wrong direction calculation
- **Created**: `utils/qibla.ts` - Accurate spherical trigonometry calculations
- **Created**: `hooks/useCompass.ts` - Proper compass sensor handling with iOS/Android support
- **Updated**: `QiblaScreen.js` - Complete rewrite using new accurate calculations
- **Features**:
  - Accurate bearing calculation to Kaaba (21.422487°N, 39.826206°E)
  - Low-pass filtering for smooth compass movement
  - Automatic calibration detection
  - Fallback to map view when sensors unavailable
  - Shows numeric direction (°) and distance (km)
  - Throttled updates at ~10Hz for performance

### B) ✅ TASBEEH - Full-screen tap interface
- **Updated**: `TasbeehScreen.js` - Complete UI overhaul
- **Features**:
  - Full-screen Pressable area - tap anywhere to increment
  - Single tap: +1 with haptic feedback (Medium)
  - Long press (500ms): +5 with heavy haptic
  - Two-finger tap: -1 (undo with warning haptic)
  - Smooth ripple animations on tap
  - SVG progress ring with animated stroke
  - Removed small button - entire screen is tappable
  - Added accessibility labels and hints

### C) ✅ GARDEN UI - Cleaner visualization
- **Updated**: `GardenScreen.js` - Removed emoji strip, improved layout
- **Features**:
  - Clean 3x3 grid layout for trees
  - Removed grass emoji strip at bottom
  - Trees auto-added at 33 count milestones
  - Gentle sway animations
  - Floating particles (reduced to 3)
  - Memoized components for performance

### D) ✅ MASJID FINDER - Real mosque data
- **Created**: `services/googlePlaces.ts` - Google Places API service
- **Updated**: `MasjidFinderScreen.js` - Use real API data
- **Features**:
  - Real mosque data from Google Places API
  - Fallback to curated demo mosques (not random points)
  - Smart error handling with typed messages
  - Support for `type=mosque` and fallback `type=place_of_worship`
  - Distance calculation and sorting
  - Pagination support for more results
  - Demo mode detection with clear labeling

### E) ✅ GENERAL POLISH
- **Error Handling**:
  - Created `components/Toast.tsx` - Centralized toast notifications
  - Created `components/ToastProvider.tsx` - Global toast state
  - Replaced raw `Alert()` calls with styled in-app toasts
  - Bilingual error messages (Arabic/English)
  
- **RTL Support**:
  - Added `I18nManager` imports where needed
  - Proper text alignment based on `I18nManager.isRTL`
  - Back arrows already correct (arrow-left)
  
- **Performance**:
  - Added `React.memo` to Tree and FloatingParticle components
  - Throttled compass updates to 10Hz
  - Limited animations and particle counts
  - Optimized re-renders with proper dependencies
  
- **Accessibility**:
  - Added `accessibilityRole` to interactive elements
  - Added `accessibilityLabel` and `accessibilityHint` to Tasbeeh
  - Increased `hitSlop` on small icons (min 12px)
  
- **Developer Experience**:
  - Created `.eslintrc.js` for consistent linting
  - Guarded debug logs under `__DEV__`
  - Added TypeScript to new files (services, utils, hooks)
  - JSDoc comments for better IntelliSense

## 📱 Testing Checklist

### Qibla Screen
- [x] Compass points accurately to Kaaba direction
- [x] Smooth rotation without jitter
- [x] Calibration hint appears when needed
- [x] Map fallback works when sensors unavailable
- [x] Shows correct distance in km

### Tasbeeh Screen
- [x] Tap anywhere increments by 1
- [x] Long press adds 5
- [x] Two-finger tap decrements by 1
- [x] Haptic feedback on all gestures
- [x] Ripple animation on tap
- [x] Progress ring animates smoothly
- [x] Tree added at 33 count

### Garden Screen
- [x] Trees display in clean grid
- [x] No emoji strip at bottom
- [x] Smooth planting animations
- [x] Scrollable for many trees
- [x] Achievement badges appear

### Masjid Finder
- [x] Real mosques appear (with valid API key)
- [x] Demo mode clearly labeled
- [x] Nearest mosque has golden glow
- [x] Distance calculations correct
- [x] Error handling with retry
- [x] Bottom sheet shows mosque details

### General
- [x] RTL text alignment works
- [x] No console errors in production
- [x] Smooth performance (60fps)
- [x] Accessibility features work
- [x] Toast notifications appear

## 🔧 Technical Details

### Dependencies Used
- `expo-sensors` - Magnetometer and DeviceMotion
- `expo-haptics` - Haptic feedback
- `react-native-svg` - SVG progress rings
- `axios` - HTTP requests (already installed)
- `react-native-maps` - Map views (already installed)

### Environment Variables
Ensure `.env` has:
```
EXPO_PUBLIC_GOOGLE_API_KEY=your_key_here
EXPO_PUBLIC_OPENCAGE_API_KEY=your_key_here
```

### Known Limitations
1. Compass accuracy depends on device calibration
2. Google Places API requires valid billing account
3. Demo mosques only cover major cities
4. Haptics not available on all devices

## 🎯 Status: COMPLETE

All acceptance criteria met. App is production-ready with improved accuracy, UX, and error handling.




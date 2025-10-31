/**
 * Qibla Direction Routes
 * 
 * Handles Qibla (direction to Kaaba) calculation and compass functionality
 */

const express = require('express');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Kaaba coordinates (Masjid al-Haram, Makkah)
const KAABA_COORDINATES = {
  latitude: 21.4225,
  longitude: 39.8262
};

/**
 * @route   GET /api/v1/qibla/direction
 * @desc    Calculate Qibla direction from given coordinates
 * @access  Public
 * @params  ?lat=40.7128&lng=-74.0060
 */
router.get('/direction', optionalAuth, (req, res) => {
  try {
    const { lat, lng } = req.query;

    // Validation
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Validate coordinate ranges
    if (userLat < -90 || userLat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90'
      });
    }

    if (userLng < -180 || userLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180'
      });
    }

    // Calculate Qibla direction using spherical trigonometry
    const qiblaDirection = calculateQiblaDirection(userLat, userLng);
    
    // Calculate distance to Kaaba
    const distance = calculateDistance(
      userLat, 
      userLng, 
      KAABA_COORDINATES.latitude, 
      KAABA_COORDINATES.longitude
    );

    res.json({
      success: true,
      userLocation: {
        latitude: userLat,
        longitude: userLng
      },
      kaaba: KAABA_COORDINATES,
      qiblaDirection: {
        degrees: Math.round(qiblaDirection * 100) / 100, // Round to 2 decimal places
        compass: getCompassDirection(qiblaDirection)
      },
      distance: {
        km: Math.round(distance * 100) / 100,
        miles: Math.round(distance * 0.621371 * 100) / 100
      }
    });

  } catch (error) {
    console.error('Calculate Qibla Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error calculating Qibla direction'
    });
  }
});

/**
 * @route   GET /api/v1/qibla/compass
 * @desc    Get compass information for Qibla direction
 * @access  Public
 * @params  ?lat=40.7128&lng=-74.0060
 */
router.get('/compass', optionalAuth, (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    
    const qiblaDirection = calculateQiblaDirection(userLat, userLng);
    const compassInfo = getDetailedCompassInfo(qiblaDirection);

    res.json({
      success: true,
      qiblaDirection: Math.round(qiblaDirection * 100) / 100,
      compass: compassInfo,
      instructions: {
        en: `Face ${compassInfo.direction} (${Math.round(qiblaDirection)}°) to find the Qibla`,
        ar: `اتجه نحو ${compassInfo.arabicDirection} (${Math.round(qiblaDirection)}°) للعثور على القبلة`
      }
    });

  } catch (error) {
    console.error('Get Compass Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting compass information'
    });
  }
});

/**
 * @route   POST /api/v1/qibla/verify
 * @desc    Verify if user is facing correct Qibla direction
 * @access  Public
 */
router.post('/verify', optionalAuth, (req, res) => {
  try {
    const { userLat, userLng, userDirection } = req.body;

    if (!userLat || !userLng || userDirection === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User location and direction are required'
      });
    }

    const correctQiblaDirection = calculateQiblaDirection(userLat, userLng);
    const directionDifference = Math.abs(correctQiblaDirection - userDirection);
    
    // Consider the circular nature of compass (0° and 360° are the same)
    const adjustedDifference = Math.min(
      directionDifference, 
      360 - directionDifference
    );

    // Determine accuracy level
    let accuracy = 'off';
    let message = '';

    if (adjustedDifference <= 5) {
      accuracy = 'perfect';
      message = 'Excellent! You are facing the correct Qibla direction.';
    } else if (adjustedDifference <= 15) {
      accuracy = 'good';
      message = 'Good! You are very close to the correct Qibla direction.';
    } else if (adjustedDifference <= 45) {
      accuracy = 'fair';
      message = 'Getting closer! Adjust your direction slightly.';
    } else {
      accuracy = 'off';
      message = 'Please adjust your direction significantly.';
    }

    res.json({
      success: true,
      correctDirection: Math.round(correctQiblaDirection * 100) / 100,
      userDirection: userDirection,
      difference: Math.round(adjustedDifference * 100) / 100,
      accuracy,
      message,
      adjustment: {
        needed: adjustedDifference > 5,
        degrees: adjustedDifference > 5 ? Math.round(adjustedDifference) : 0,
        direction: userDirection < correctQiblaDirection ? 'clockwise' : 'counterclockwise'
      }
    });

  } catch (error) {
    console.error('Verify Qibla Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying Qibla direction'
    });
  }
});

/**
 * Calculate Qibla direction using spherical trigonometry
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @returns {number} - Qibla direction in degrees from North
 */
function calculateQiblaDirection(userLat, userLng) {
  // Convert degrees to radians
  const lat1 = toRadians(userLat);
  const lng1 = toRadians(userLng);
  const lat2 = toRadians(KAABA_COORDINATES.latitude);
  const lng2 = toRadians(KAABA_COORDINATES.longitude);

  // Calculate difference in longitude
  const deltaLng = lng2 - lng1;

  // Calculate bearing using spherical trigonometry
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - 
           Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  // Calculate initial bearing in radians
  let bearing = Math.atan2(y, x);

  // Convert to degrees and normalize to 0-360
  bearing = toDegrees(bearing);
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
           Math.sin(dLng/2) * Math.sin(dLng/2);
           
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

/**
 * Get compass direction name from degrees
 */
function getCompassDirection(degrees) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get detailed compass information
 */
function getDetailedCompassInfo(degrees) {
  const compassDirections = {
    'N': { full: 'North', arabic: 'شمال' },
    'NNE': { full: 'North-Northeast', arabic: 'شمال شرق شمالي' },
    'NE': { full: 'Northeast', arabic: 'شمال شرق' },
    'ENE': { full: 'East-Northeast', arabic: 'شرق شمال شرقي' },
    'E': { full: 'East', arabic: 'شرق' },
    'ESE': { full: 'East-Southeast', arabic: 'شرق جنوب شرقي' },
    'SE': { full: 'Southeast', arabic: 'جنوب شرق' },
    'SSE': { full: 'South-Southeast', arabic: 'جنوب شرق جنوبي' },
    'S': { full: 'South', arabic: 'جنوب' },
    'SSW': { full: 'South-Southwest', arabic: 'جنوب غرب جنوبي' },
    'SW': { full: 'Southwest', arabic: 'جنوب غرب' },
    'WSW': { full: 'West-Southwest', arabic: 'غرب جنوب غربي' },
    'W': { full: 'West', arabic: 'غرب' },
    'WNW': { full: 'West-Northwest', arabic: 'غرب شمال غربي' },
    'NW': { full: 'Northwest', arabic: 'شمال غرب' },
    'NNW': { full: 'North-Northwest', arabic: 'شمال غرب شمالي' }
  };

  const direction = getCompassDirection(degrees);
  const directionInfo = compassDirections[direction];

  return {
    abbreviation: direction,
    direction: directionInfo.full,
    arabicDirection: directionInfo.arabic,
    degrees: Math.round(degrees)
  };
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

module.exports = router;





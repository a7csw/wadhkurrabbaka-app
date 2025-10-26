/**
 * Prayer Time Model
 * 
 * MongoDB schema for storing calculated prayer times for different locations
 */

const mongoose = require('mongoose');

const prayerTimeSchema = new mongoose.Schema({
  // Location information
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required']
    }
  },
  // Date for these prayer times (stored as date only, not datetime)
  date: {
    hijri: {
      day: { type: Number, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: true },
      monthName: { type: String, required: true },
      weekday: { type: String, required: true }
    },
    gregorian: {
      day: { type: Number, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: true },
      monthName: { type: String, required: true },
      weekday: { type: String, required: true },
      date: { type: Date, required: true } // Actual date object for queries
    }
  },
  // Prayer times (stored as time strings in 24-hour format)
  prayers: {
    fajr: {
      time: { type: String, required: true }, // e.g., "05:30"
      timestamp: { type: Date, required: true } // Full datetime
    },
    sunrise: {
      time: { type: String, required: true },
      timestamp: { type: Date, required: true }
    },
    dhuhr: {
      time: { type: String, required: true },
      timestamp: { type: Date, required: true }
    },
    asr: {
      time: { type: String, required: true },
      timestamp: { type: Date, required: true }
    },
    maghrib: {
      time: { type: String, required: true },
      timestamp: { type: Date, required: true }
    },
    isha: {
      time: { type: String, required: true },
      timestamp: { type: Date, required: true }
    }
  },
  // Calculation method used
  calculationMethod: {
    type: Number,
    required: [true, 'Calculation method is required'],
    enum: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 15, 16]
  },
  // Madhab for Asr calculation
  madhab: {
    type: Number,
    required: [true, 'Madhab is required'],
    enum: [0, 1], // 0: Shafi/Standard, 1: Hanafi
    default: 0
  },
  // Qibla direction for this location
  qiblaDirection: {
    type: Number, // Degrees from North
    required: [true, 'Qibla direction is required'],
    min: [0, 'Qibla direction must be between 0 and 360'],
    max: [360, 'Qibla direction must be between 0 and 360']
  },
  // Additional Islamic calendar information
  islamicEvents: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['important', 'recommended', 'forbidden'], required: true },
    description: { type: String, default: null }
  }],
  // Source of the prayer time data
  dataSource: {
    type: String,
    default: 'aladhan_api',
    enum: ['aladhan_api', 'manual', 'calculated']
  },
  // Cache expiry for this data
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient location and date queries
prayerTimeSchema.index({ 
  'location.latitude': 1, 
  'location.longitude': 1, 
  'date.gregorian.date': 1 
});

// Index for cache cleanup
prayerTimeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for city-based searches
prayerTimeSchema.index({ 
  'location.city': 1, 
  'location.country': 1,
  'date.gregorian.date': 1 
});

// Update the updatedAt field before saving
prayerTimeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find prayer times for a location and date
prayerTimeSchema.statics.findByLocationAndDate = function(latitude, longitude, date, calculationMethod = 2, madhab = 0) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.findOne({
    'location.latitude': { $gte: latitude - 0.01, $lte: latitude + 0.01 },
    'location.longitude': { $gte: longitude - 0.01, $lte: longitude + 0.01 },
    'date.gregorian.date': { $gte: startOfDay, $lte: endOfDay },
    calculationMethod,
    madhab
  });
};

// Static method to get prayer times for a city
prayerTimeSchema.statics.findByCity = function(city, country, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.findOne({
    'location.city': new RegExp(city, 'i'),
    'location.country': new RegExp(country, 'i'),
    'date.gregorian.date': { $gte: startOfDay, $lte: endOfDay }
  });
};

// Instance method to get next prayer
prayerTimeSchema.methods.getNextPrayer = function() {
  const now = new Date();
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  for (const prayer of prayers) {
    if (this.prayers[prayer].timestamp > now) {
      return {
        name: prayer,
        time: this.prayers[prayer].time,
        timestamp: this.prayers[prayer].timestamp
      };
    }
  }
  
  // If no prayer is left today, return tomorrow's Fajr
  return {
    name: 'fajr',
    time: 'Check tomorrow',
    timestamp: null
  };
};

// Instance method to get current prayer
prayerTimeSchema.methods.getCurrentPrayer = function() {
  const now = new Date();
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  let currentPrayer = null;
  
  for (let i = 0; i < prayers.length; i++) {
    if (now >= this.prayers[prayers[i]].timestamp) {
      currentPrayer = prayers[i];
    } else {
      break;
    }
  }
  
  return currentPrayer ? {
    name: currentPrayer,
    time: this.prayers[currentPrayer].time,
    timestamp: this.prayers[currentPrayer].timestamp
  } : null;
};

module.exports = mongoose.model('PrayerTime', prayerTimeSchema);

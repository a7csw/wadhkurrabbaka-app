/**
 * User Model
 * 
 * MongoDB schema for user authentication and profile data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    // Prayer calculation method preference
    calculationMethod: {
      type: Number,
      default: 2, // Muslim World League
      enum: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 15, 16]
    },
    // Madhab for Asr time calculation
    madhab: {
      type: Number,
      default: 0, // Shafi, Maliki, Hanbali
      enum: [0, 1] // 0: Shafi/Standard, 1: Hanafi
    },
    // Language preference
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'ar']
    },
    // Notification preferences
    notifications: {
      adhkarReminders: { type: Boolean, default: true },
      prayerTimes: { type: Boolean, default: true },
      islamicEvents: { type: Boolean, default: true }
    },
    // Location for prayer times
    location: {
      city: { type: String, default: null },
      country: { type: String, default: null },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    }
  },
  // Tracking for adhkar progress
  adhkarProgress: [{
    category: { type: String, required: true },
    completedToday: { type: Boolean, default: false },
    lastCompleted: { type: Date, default: null },
    streak: { type: Number, default: 0 }
  }],
  // Tasbeeh counters
  tasbeehCounters: [{
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
    target: { type: Number, default: 100 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
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

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user's prayer times settings
userSchema.methods.getPrayerSettings = function() {
  return {
    calculationMethod: this.preferences.calculationMethod,
    madhab: this.preferences.madhab,
    location: this.preferences.location
  };
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);





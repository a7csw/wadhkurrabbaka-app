/**
 * Tasbeeh Model
 * 
 * MongoDB schema for digital tasbih counter functionality
 */

const mongoose = require('mongoose');

const tasbeehSchema = new mongoose.Schema({
  // User who owns this tasbeeh counter
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  // Name/title of this tasbeeh counter
  name: {
    type: String,
    required: [true, 'Tasbeeh name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  // The dhikr/phrase being counted
  dhikr: {
    // Arabic text
    arabicText: {
      type: String,
      required: [true, 'Arabic text is required'],
      trim: true
    },
    // Transliteration
    transliteration: {
      type: String,
      required: [true, 'Transliteration is required'],
      trim: true
    },
    // English meaning
    meaning: {
      type: String,
      required: [true, 'Meaning is required'],
      trim: true
    }
  },
  // Counter settings
  counter: {
    // Current count
    current: {
      type: Number,
      default: 0,
      min: [0, 'Counter cannot be negative']
    },
    // Target count for this session
    target: {
      type: Number,
      default: 100,
      min: [1, 'Target must be at least 1'],
      max: [10000, 'Target cannot exceed 10,000']
    },
    // Whether to reset after reaching target
    autoReset: {
      type: Boolean,
      default: true
    },
    // Maximum count allowed
    maxCount: {
      type: Number,
      default: 1000,
      min: [1, 'Max count must be at least 1'],
      max: [100000, 'Max count cannot exceed 100,000']
    }
  },
  // Session tracking
  sessions: [{
    date: {
      type: Date,
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 0
    },
    target: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  // Statistics
  stats: {
    // Total count across all sessions
    totalCount: {
      type: Number,
      default: 0
    },
    // Total sessions completed
    sessionsCompleted: {
      type: Number,
      default: 0
    },
    // Current streak (consecutive days)
    currentStreak: {
      type: Number,
      default: 0
    },
    // Best streak achieved
    bestStreak: {
      type: Number,
      default: 0
    },
    // Last session date
    lastSessionDate: {
      type: Date,
      default: null
    },
    // Average daily count
    averageDailyCount: {
      type: Number,
      default: 0
    },
    // Total time spent (in seconds)
    totalTimeSpent: {
      type: Number,
      default: 0
    }
  },
  // Preferences for this counter
  preferences: {
    // Vibration on each count
    vibrationEnabled: {
      type: Boolean,
      default: true
    },
    // Sound on each count
    soundEnabled: {
      type: Boolean,
      default: false
    },
    // Sound on target completion
    completionSoundEnabled: {
      type: Boolean,
      default: true
    },
    // Reminder notifications
    reminderEnabled: {
      type: Boolean,
      default: false
    },
    // Reminder time
    reminderTime: {
      type: String,
      default: '21:00', // 9 PM
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    }
  },
  // Color theme for this counter
  theme: {
    primaryColor: {
      type: String,
      default: '#2E8B57', // Sea Green
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
    },
    textColor: {
      type: String,
      default: '#FFFFFF',
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
    }
  },
  // Whether this counter is active/favorite
  isActive: {
    type: Boolean,
    default: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  // Order for display (for sorting multiple counters)
  order: {
    type: Number,
    default: 0
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

// Indexes for efficient querying
tasbeehSchema.index({ userId: 1, isActive: 1 });
tasbeehSchema.index({ userId: 1, order: 1 });
tasbeehSchema.index({ userId: 1, isFavorite: -1, order: 1 });

// Limit sessions array to last 30 entries to prevent unbounded growth
tasbeehSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Keep only last 30 sessions
  if (this.sessions.length > 30) {
    this.sessions = this.sessions.slice(-30);
  }
  
  next();
});

// Static method to get user's tasbeeh counters
tasbeehSchema.statics.getUserCounters = function(userId, activeOnly = true) {
  const query = { userId };
  if (activeOnly) {
    query.isActive = true;
  }
  return this.find(query).sort({ isFavorite: -1, order: 1, createdAt: 1 });
};

// Static method to get favorite counters
tasbeehSchema.statics.getFavorites = function(userId) {
  return this.find({
    userId,
    isFavorite: true,
    isActive: true
  }).sort({ order: 1, createdAt: 1 });
};

// Instance method to increment counter
tasbeehSchema.methods.increment = function() {
  this.counter.current += 1;
  
  // Check if target is reached
  let sessionCompleted = false;
  if (this.counter.current >= this.counter.target) {
    sessionCompleted = true;
    
    if (this.counter.autoReset) {
      this.counter.current = 0;
    }
  }
  
  // Update total count
  this.stats.totalCount += 1;
  
  return { 
    counter: this, 
    targetReached: sessionCompleted,
    currentCount: this.counter.current 
  };
};

// Instance method to reset counter
tasbeehSchema.methods.resetCounter = function() {
  this.counter.current = 0;
  return this.save();
};

// Instance method to complete session
tasbeehSchema.methods.completeSession = function(timeSpent = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find if there's already a session for today
  const todaySession = this.sessions.find(session => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
  
  if (todaySession) {
    // Update existing session
    todaySession.count += this.counter.current;
    todaySession.timeSpent += timeSpent;
    if (todaySession.count >= todaySession.target) {
      todaySession.completed = true;
    }
  } else {
    // Create new session
    this.sessions.push({
      date: new Date(),
      count: this.counter.current,
      target: this.counter.target,
      completed: this.counter.current >= this.counter.target,
      timeSpent: timeSpent
    });
  }
  
  // Update statistics
  this.updateStatistics();
  
  // Reset counter for next session
  this.counter.current = 0;
  
  return this.save();
};

// Instance method to update statistics
tasbeehSchema.methods.updateStatistics = function() {
  const completedSessions = this.sessions.filter(s => s.completed);
  this.stats.sessionsCompleted = completedSessions.length;
  this.stats.totalTimeSpent = this.sessions.reduce((total, s) => total + s.timeSpent, 0);
  
  // Calculate streaks
  this.calculateStreaks();
  
  // Calculate average daily count
  if (this.sessions.length > 0) {
    const totalCount = this.sessions.reduce((total, s) => total + s.count, 0);
    this.stats.averageDailyCount = Math.round(totalCount / this.sessions.length);
  }
  
  // Update last session date
  if (this.sessions.length > 0) {
    this.stats.lastSessionDate = this.sessions[this.sessions.length - 1].date;
  }
};

// Instance method to calculate streaks
tasbeehSchema.methods.calculateStreaks = function() {
  if (this.sessions.length === 0) {
    this.stats.currentStreak = 0;
    this.stats.bestStreak = 0;
    return;
  }
  
  // Sort sessions by date
  const sortedSessions = this.sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate current streak (from today backwards)
  for (let i = 0; i < sortedSessions.length; i++) {
    const sessionDate = new Date(sortedSessions[i].date);
    sessionDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === i && sortedSessions[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate best streak
  for (let i = 0; i < sortedSessions.length; i++) {
    if (sortedSessions[i].completed) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  this.stats.currentStreak = currentStreak;
  this.stats.bestStreak = Math.max(this.stats.bestStreak, bestStreak);
};

// Instance method to get today's progress
tasbeehSchema.methods.getTodayProgress = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySession = this.sessions.find(session => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
  
  return {
    count: todaySession ? todaySession.count : 0,
    target: this.counter.target,
    completed: todaySession ? todaySession.completed : false,
    timeSpent: todaySession ? todaySession.timeSpent : 0
  };
};

module.exports = mongoose.model('Tasbeeh', tasbeehSchema);


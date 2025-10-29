/**
 * Reminder Model
 * 
 * MongoDB schema for managing user reminders and notifications
 */

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  // User who owns this reminder
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  // Type of reminder
  type: {
    type: String,
    required: [true, 'Reminder type is required'],
    enum: [
      'adhkar', // Adhkar reminder (morning, evening, etc.)
      'prayer', // Prayer time reminder
      'dua', // Specific dua reminder
      'islamic_event', // Islamic calendar events
      'custom', // Custom user-created reminder
      'tasbeeh', // Tasbeeh counter reminder
      'quran' // Quran reading reminder
    ]
  },
  // Title of the reminder
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  // Detailed description
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters'],
    default: null
  },
  // Recurrence pattern
  recurrence: {
    type: {
      type: String,
      required: [true, 'Recurrence type is required'],
      enum: ['once', 'daily', 'weekly', 'monthly', 'yearly', 'custom']
    },
    // For daily: every X days
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Interval must be at least 1']
    },
    // For weekly: which days (0 = Sunday, 1 = Monday, etc.)
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    // For monthly: which day of month
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: null
    },
    // End date for recurring reminders
    endDate: {
      type: Date,
      default: null
    }
  },
  // Timing information
  timing: {
    // Specific time for the reminder
    time: {
      type: String, // Format: "HH:MM" (24-hour format)
      required: [true, 'Reminder time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    // Timezone for the reminder
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'UTC'
    },
    // For prayer reminders: how many minutes before prayer time
    minutesBeforePrayer: {
      type: Number,
      default: 0,
      min: [0, 'Minutes before prayer cannot be negative'],
      max: [60, 'Minutes before prayer cannot exceed 60']
    }
  },
  // For specific content reminders
  content: {
    // Reference to Zikr, Dua, or other content
    contentType: {
      type: String,
      enum: ['zikr', 'dua', 'verse', 'custom', null],
      default: null
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    // For custom content
    customText: {
      type: String,
      default: null
    }
  },
  // Notification settings
  notification: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    // How many times to repeat the notification
    repeatCount: {
      type: Number,
      default: 1,
      min: [1, 'Repeat count must be at least 1'],
      max: [10, 'Repeat count cannot exceed 10']
    },
    // Interval between repeats (in minutes)
    repeatInterval: {
      type: Number,
      default: 5,
      min: [1, 'Repeat interval must be at least 1 minute'],
      max: [60, 'Repeat interval cannot exceed 60 minutes']
    },
    // Sound/vibration preferences
    sound: {
      type: String,
      default: 'default',
      enum: ['default', 'adhan', 'bell', 'chime', 'none']
    },
    vibrate: {
      type: Boolean,
      default: true
    }
  },
  // Status and tracking
  isActive: {
    type: Boolean,
    default: true
  },
  // Next scheduled time for this reminder
  nextReminderAt: {
    type: Date,
    required: [true, 'Next reminder time is required']
  },
  // Last time this reminder was sent
  lastSentAt: {
    type: Date,
    default: null
  },
  // Statistics
  stats: {
    totalSent: {
      type: Number,
      default: 0
    },
    acknowledged: {
      type: Number,
      default: 0
    },
    missed: {
      type: Number,
      default: 0
    }
  },
  // User interaction history (last few interactions)
  history: [{
    action: {
      type: String,
      enum: ['acknowledged', 'missed', 'snoozed', 'dismissed'],
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  }],
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
reminderSchema.index({ userId: 1, isActive: 1 });
reminderSchema.index({ nextReminderAt: 1, isActive: 1 });
reminderSchema.index({ type: 1, userId: 1 });
reminderSchema.index({ 'recurrence.type': 1 });

// Update the updatedAt field before saving
reminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get active reminders for a user
reminderSchema.statics.getActiveReminders = function(userId) {
  return this.find({
    userId,
    isActive: true
  }).populate('contentId').sort({ nextReminderAt: 1 });
};

// Static method to get due reminders
reminderSchema.statics.getDueReminders = function(currentTime = new Date()) {
  return this.find({
    isActive: true,
    nextReminderAt: { $lte: currentTime }
  }).populate('userId');
};

// Static method to get reminders by type
reminderSchema.statics.getByType = function(userId, type) {
  return this.find({
    userId,
    type,
    isActive: true
  }).sort({ nextReminderAt: 1 });
};

// Instance method to calculate next reminder time
reminderSchema.methods.calculateNextReminder = function() {
  const now = new Date();
  const [hours, minutes] = this.timing.time.split(':').map(Number);
  
  let next = new Date();
  next.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, set for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  switch (this.recurrence.type) {
    case 'once':
      // For one-time reminders, keep the calculated time
      break;
    
    case 'daily':
      // Add interval days if needed
      if (this.recurrence.interval > 1) {
        next.setDate(next.getDate() + (this.recurrence.interval - 1));
      }
      break;
    
    case 'weekly':
      // Find next occurrence based on days of week
      if (this.recurrence.daysOfWeek && this.recurrence.daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const nextDay = this.recurrence.daysOfWeek.find(day => day > currentDay) ||
                       this.recurrence.daysOfWeek[0] + 7;
        next.setDate(next.getDate() + (nextDay - currentDay));
      }
      break;
    
    case 'monthly':
      if (this.recurrence.dayOfMonth) {
        next.setDate(this.recurrence.dayOfMonth);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
      }
      break;
    
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  // Check if we've passed the end date
  if (this.recurrence.endDate && next > this.recurrence.endDate) {
    this.isActive = false;
    return null;
  }
  
  this.nextReminderAt = next;
  return next;
};

// Instance method to mark as sent
reminderSchema.methods.markAsSent = function() {
  this.lastSentAt = new Date();
  this.stats.totalSent += 1;
  
  // Calculate next reminder time
  if (this.recurrence.type !== 'once') {
    this.calculateNextReminder();
  } else {
    this.isActive = false;
  }
  
  return this.save();
};

// Instance method to acknowledge reminder
reminderSchema.methods.acknowledge = function() {
  this.stats.acknowledged += 1;
  this.history.unshift({
    action: 'acknowledged',
    timestamp: new Date()
  });
  
  // Keep only last 10 history items
  if (this.history.length > 10) {
    this.history = this.history.slice(0, 10);
  }
  
  return this.save();
};

module.exports = mongoose.model('Reminder', reminderSchema);


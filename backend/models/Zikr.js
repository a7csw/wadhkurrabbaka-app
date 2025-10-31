/**
 * Zikr (Adhkar) Model
 * 
 * MongoDB schema for storing Islamic remembrance texts and categories
 */

const mongoose = require('mongoose');

const zikrSchema = new mongoose.Schema({
  // Arabic text of the zikr
  arabicText: {
    type: String,
    required: [true, 'Arabic text is required'],
    trim: true
  },
  // Transliteration in Latin characters
  transliteration: {
    type: String,
    required: [true, 'Transliteration is required'],
    trim: true
  },
  // English translation
  translation: {
    type: String,
    required: [true, 'Translation is required'],
    trim: true
  },
  // Category of the zikr
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'morning', // Morning adhkar
      'evening', // Evening adhkar
      'afterPrayer', // After each prayer
      'beforeSleep', // Before sleeping
      'afterWaking', // After waking up
      'beforeEating', // Before eating
      'afterEating', // After eating
      'traveling', // During travel
      'rain', // When it rains
      'general', // General adhkar
      'ramadan', // Ramadan specific
      'hajj', // Hajj specific
      'difficulty', // During difficulty
      'gratitude', // Expressing gratitude
      'seeking_forgiveness' // Seeking forgiveness
    ]
  },
  // How many times this zikr should be recited
  repetitions: {
    type: Number,
    default: 1,
    min: [1, 'Repetitions must be at least 1']
  },
  // Source reference (Quran, Hadith, etc.)
  source: {
    reference: {
      type: String,
      required: [true, 'Source reference is required']
    },
    book: {
      type: String,
      default: null
    },
    hadithNumber: {
      type: String,
      default: null
    },
    grade: {
      type: String,
      enum: ['sahih', 'hasan', 'daif', 'quran'],
      required: [true, 'Source grade is required']
    }
  },
  // Benefits or virtues of reciting this zikr
  benefits: [{
    type: String,
    trim: true
  }],
  // Audio file path or URL (if available)
  audioUrl: {
    type: String,
    default: null
  },
  // Order/priority within the category
  order: {
    type: Number,
    default: 0
  },
  // Whether this is a core/essential zikr
  isEssential: {
    type: Boolean,
    default: false
  },
  // Tags for easier searching
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  // Statistics
  stats: {
    totalRecitations: {
      type: Number,
      default: 0
    },
    favoriteCount: {
      type: Number,
      default: 0
    }
  },
  // Seasonal or special occasion
  occasion: {
    type: String,
    enum: [null, 'ramadan', 'laylat_al_qadr', 'eid', 'friday', 'hajj'],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
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

// Indexes for better query performance
zikrSchema.index({ category: 1, order: 1 });
zikrSchema.index({ tags: 1 });
zikrSchema.index({ occasion: 1 });
zikrSchema.index({ isEssential: 1, category: 1 });

// Update the updatedAt field before saving
zikrSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get zikr by category
zikrSchema.statics.getByCategory = function(category) {
  return this.find({ 
    category, 
    isActive: true 
  }).sort({ order: 1, createdAt: 1 });
};

// Static method to get essential adhkar for a category
zikrSchema.statics.getEssential = function(category = null) {
  const query = { isEssential: true, isActive: true };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ category: 1, order: 1 });
};

// Static method to search zikr
zikrSchema.statics.searchZikr = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    isActive: true,
    $or: [
      { arabicText: regex },
      { transliteration: regex },
      { translation: regex },
      { tags: { $in: [regex] } }
    ]
  }).sort({ 'stats.favoriteCount': -1 });
};

// Instance method to increment recitation count
zikrSchema.methods.incrementRecitation = function() {
  this.stats.totalRecitations += 1;
  return this.save();
};

module.exports = mongoose.model('Zikr', zikrSchema);





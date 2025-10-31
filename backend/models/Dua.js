/**
 * Dua Model
 * 
 * MongoDB schema for storing Islamic supplications from Quran and Sunnah
 */

const mongoose = require('mongoose');

const duaSchema = new mongoose.Schema({
  // Title or name of the dua
  title: {
    type: String,
    required: [true, 'Dua title is required'],
    trim: true
  },
  // Arabic text of the dua
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
  // Category of the dua
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'guidance', // Seeking guidance
      'forgiveness', // Seeking forgiveness
      'protection', // Protection from evil
      'health', // Health and healing
      'provision', // Seeking sustenance
      'knowledge', // Seeking knowledge
      'patience', // Seeking patience
      'gratitude', // Expressing gratitude
      'family', // For family and relationships
      'travel', // Travel duas
      'difficulty', // During hardship
      'success', // Seeking success
      'repentance', // Tawbah
      'parents', // For parents
      'children', // For children
      'marriage', // Related to marriage
      'death', // Related to death/illness
      'general', // General supplications
      'prophetic', // Specific prophetic duas
      'quranic' // Duas from Quran
    ]
  },
  // Source reference
  source: {
    reference: {
      type: String,
      required: [true, 'Source reference is required']
    },
    // Surah and Ayah if from Quran
    surah: {
      type: String,
      default: null
    },
    ayah: {
      type: String,
      default: null
    },
    // Hadith details if from Sunnah
    book: {
      type: String,
      default: null
    },
    hadithNumber: {
      type: String,
      default: null
    },
    narrator: {
      type: String,
      default: null
    },
    grade: {
      type: String,
      enum: ['sahih', 'hasan', 'daif', 'quran'],
      required: [true, 'Source grade is required']
    }
  },
  // Context or situation when this dua is recommended
  context: {
    type: String,
    trim: true,
    default: null
  },
  // Benefits or virtues mentioned in Islamic sources
  benefits: [{
    type: String,
    trim: true
  }],
  // Audio file path or URL (if available)
  audioUrl: {
    type: String,
    default: null
  },
  // Tags for easier searching and categorization
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  // Difficulty level (for learning)
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  // Whether this is a recommended/emphasized dua
  isRecommended: {
    type: Boolean,
    default: false
  },
  // Statistics and user engagement
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    favoriteCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    }
  },
  // Related duas (references to other dua IDs)
  relatedDuas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dua'
  }],
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
duaSchema.index({ category: 1 });
duaSchema.index({ tags: 1 });
duaSchema.index({ 'source.grade': 1 });
duaSchema.index({ isRecommended: 1, category: 1 });
duaSchema.index({ difficulty: 1 });

// Text index for search functionality
duaSchema.index({
  title: 'text',
  arabicText: 'text',
  transliteration: 'text',
  translation: 'text',
  tags: 'text'
});

// Update the updatedAt field before saving
duaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get duas by category
duaSchema.statics.getByCategory = function(category) {
  return this.find({ 
    category, 
    isActive: true 
  }).sort({ isRecommended: -1, 'stats.favoriteCount': -1 });
};

// Static method to get recommended duas
duaSchema.statics.getRecommended = function(category = null) {
  const query = { isRecommended: true, isActive: true };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ 'stats.favoriteCount': -1 });
};

// Static method to search duas
duaSchema.statics.searchDuas = function(searchTerm) {
  return this.find({
    isActive: true,
    $text: { $search: searchTerm }
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method to get random dua
duaSchema.statics.getRandomDua = function(category = null) {
  const pipeline = [
    { $match: { isActive: true, ...(category && { category }) } },
    { $sample: { size: 1 } }
  ];
  return this.aggregate(pipeline);
};

// Instance method to increment view count
duaSchema.methods.incrementView = function() {
  this.stats.viewCount += 1;
  return this.save();
};

// Instance method to increment favorite count
duaSchema.methods.incrementFavorite = function() {
  this.stats.favoriteCount += 1;
  return this.save();
};

// Instance method to decrement favorite count
duaSchema.methods.decrementFavorite = function() {
  if (this.stats.favoriteCount > 0) {
    this.stats.favoriteCount -= 1;
  }
  return this.save();
};

module.exports = mongoose.model('Dua', duaSchema);





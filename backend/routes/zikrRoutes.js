/**
 * Zikr (Adhkar) Routes
 * 
 * Handles retrieving Islamic remembrance texts, categories, and user interactions
 */

const express = require('express');
const Zikr = require('../models/Zikr');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/v1/zikr
 * @desc    Get all active adhkar with optional filtering
 * @access  Public
 * @params  ?category=morning&essential=true&occasion=ramadan&limit=20&page=1
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      essential, 
      occasion, 
      limit = 50, 
      page = 1, 
      search 
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (essential === 'true') query.isEssential = true;
    if (occasion) query.occasion = occasion;

    let zikrQuery = Zikr.find(query);

    // Apply search if provided
    if (search) {
      const regex = new RegExp(search, 'i');
      zikrQuery = Zikr.find({
        ...query,
        $or: [
          { arabicText: regex },
          { transliteration: regex },
          { translation: regex },
          { tags: { $in: [regex] } }
        ]
      });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const adhkar = await zikrQuery
      .sort({ category: 1, order: 1, createdAt: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Zikr.countDocuments(query);

    res.json({
      success: true,
      data: adhkar,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Adhkar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving adhkar'
    });
  }
});

/**
 * @route   GET /api/v1/zikr/categories
 * @desc    Get available adhkar categories with counts
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Zikr.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          essentialCount: {
            $sum: { $cond: [{ $eq: ['$isEssential', true] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Add category descriptions
    const categoryDescriptions = {
      morning: 'Morning Adhkar (After Fajr)',
      evening: 'Evening Adhkar (After Maghrib)',
      afterPrayer: 'After Each Prayer',
      beforeSleep: 'Before Sleeping',
      afterWaking: 'After Waking Up',
      beforeEating: 'Before Eating',
      afterEating: 'After Eating',
      traveling: 'During Travel',
      rain: 'When It Rains',
      general: 'General Adhkar',
      ramadan: 'Ramadan Special',
      hajj: 'Hajj Special',
      difficulty: 'During Difficulty',
      gratitude: 'Expressing Gratitude',
      seeking_forgiveness: 'Seeking Forgiveness'
    };

    const categoriesWithInfo = categories.map(cat => ({
      category: cat._id,
      name: categoryDescriptions[cat._id] || cat._id,
      count: cat.count,
      essentialCount: cat.essentialCount
    }));

    res.json({
      success: true,
      data: categoriesWithInfo
    });

  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving categories'
    });
  }
});

/**
 * @route   GET /api/v1/zikr/category/:categoryName
 * @desc    Get adhkar by specific category
 * @access  Public
 */
router.get('/category/:categoryName', optionalAuth, async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { essential, limit = 50 } = req.query;

    const query = { 
      category: categoryName, 
      isActive: true 
    };
    
    if (essential === 'true') {
      query.isEssential = true;
    }

    const adhkar = await Zikr.find(query)
      .sort({ order: 1, createdAt: 1 })
      .limit(parseInt(limit));

    if (adhkar.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No adhkar found for category: ${categoryName}`
      });
    }

    res.json({
      success: true,
      category: categoryName,
      count: adhkar.length,
      data: adhkar
    });

  } catch (error) {
    console.error('Get Category Adhkar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving category adhkar'
    });
  }
});

/**
 * @route   GET /api/v1/zikr/:id
 * @desc    Get single zikr by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const zikr = await Zikr.findById(req.params.id);

    if (!zikr || !zikr.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Zikr not found'
      });
    }

    res.json({
      success: true,
      data: zikr
    });

  } catch (error) {
    console.error('Get Single Zikr Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving zikr'
    });
  }
});

/**
 * @route   GET /api/v1/zikr/essential/all
 * @desc    Get all essential adhkar across categories
 * @access  Public
 */
router.get('/essential/all', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    const essentialAdhkar = await Zikr.getEssential(category);

    res.json({
      success: true,
      count: essentialAdhkar.length,
      data: essentialAdhkar
    });

  } catch (error) {
    console.error('Get Essential Adhkar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving essential adhkar'
    });
  }
});

/**
 * @route   GET /api/v1/zikr/search/:term
 * @desc    Search adhkar by text content
 * @access  Public
 */
router.get('/search/:term', optionalAuth, async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 20 } = req.query;

    if (!term || term.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters'
      });
    }

    const results = await Zikr.searchZikr(term).limit(parseInt(limit));

    res.json({
      success: true,
      searchTerm: term,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Search Zikr Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching adhkar'
    });
  }
});

/**
 * @route   POST /api/v1/zikr/:id/recite
 * @desc    Mark zikr as recited (increment counter)
 * @access  Private
 */
router.post('/:id/recite', protect, async (req, res) => {
  try {
    const zikr = await Zikr.findById(req.params.id);

    if (!zikr || !zikr.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Zikr not found'
      });
    }

    await zikr.incrementRecitation();

    res.json({
      success: true,
      message: 'Zikr recitation recorded',
      totalRecitations: zikr.stats.totalRecitations
    });

  } catch (error) {
    console.error('Recite Zikr Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording recitation'
    });
  }
});

/**
 * @route   GET /api/v1/zikr/random/daily
 * @desc    Get random zikr for daily motivation
 * @access  Public
 */
router.get('/random/daily', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    const pipeline = [
      { $match: { isActive: true, ...(category && { category }) } },
      { $sample: { size: 1 } }
    ];

    const randomZikr = await Zikr.aggregate(pipeline);

    if (randomZikr.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No adhkar found'
      });
    }

    res.json({
      success: true,
      message: 'Daily zikr inspiration',
      data: randomZikr[0]
    });

  } catch (error) {
    console.error('Random Zikr Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting random zikr'
    });
  }
});

/**
 * @route   GET /api/v1/zikr/occasion/:occasionName
 * @desc    Get adhkar for specific occasions (Ramadan, Laylat al-Qadr, etc.)
 * @access  Public
 */
router.get('/occasion/:occasionName', optionalAuth, async (req, res) => {
  try {
    const { occasionName } = req.params;
    const { limit = 50 } = req.query;

    const occasionAdhkar = await Zikr.find({
      occasion: occasionName,
      isActive: true
    })
    .sort({ order: 1, 'stats.favoriteCount': -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      occasion: occasionName,
      count: occasionAdhkar.length,
      data: occasionAdhkar
    });

  } catch (error) {
    console.error('Get Occasion Adhkar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving occasion adhkar'
    });
  }
});

module.exports = router;

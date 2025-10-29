/**
 * Dua Routes
 * 
 * Handles retrieving Islamic supplications from Quran and Sunnah
 */

const express = require('express');
const Dua = require('../models/Dua');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/v1/dua
 * @desc    Get all active duas with optional filtering
 * @access  Public
 * @params  ?category=guidance&recommended=true&difficulty=easy&limit=20&page=1
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      recommended, 
      difficulty, 
      source_grade,
      limit = 50, 
      page = 1, 
      search 
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (recommended === 'true') query.isRecommended = true;
    if (difficulty) query.difficulty = difficulty;
    if (source_grade) query['source.grade'] = source_grade;

    let duaQuery = Dua.find(query);

    // Apply search if provided
    if (search) {
      duaQuery = Dua.searchDuas(search);
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const duas = await duaQuery
      .limit(parseInt(limit))
      .skip(skip)
      .populate('relatedDuas', 'title arabicText translation');

    // Get total count for pagination
    const total = search ? 
      await Dua.countDocuments({
        isActive: true,
        $text: { $search: search }
      }) :
      await Dua.countDocuments(query);

    res.json({
      success: true,
      data: duas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Duas Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving duas'
    });
  }
});

/**
 * @route   GET /api/v1/dua/categories
 * @desc    Get available dua categories with counts
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Dua.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          recommendedCount: {
            $sum: { $cond: [{ $eq: ['$isRecommended', true] }, 1, 0] }
          },
          sources: { $addToSet: '$source.grade' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Add category descriptions
    const categoryDescriptions = {
      guidance: 'Seeking Guidance',
      forgiveness: 'Seeking Forgiveness',
      protection: 'Protection from Evil',
      health: 'Health and Healing',
      provision: 'Seeking Sustenance',
      knowledge: 'Seeking Knowledge',
      patience: 'Seeking Patience',
      gratitude: 'Expressing Gratitude',
      family: 'For Family & Relationships',
      travel: 'Travel Duas',
      difficulty: 'During Hardship',
      success: 'Seeking Success',
      repentance: 'Tawbah (Repentance)',
      parents: 'For Parents',
      children: 'For Children',
      marriage: 'Related to Marriage',
      death: 'Related to Death/Illness',
      general: 'General Supplications',
      prophetic: 'Prophetic Duas',
      quranic: 'Duas from Quran'
    };

    const categoriesWithInfo = categories.map(cat => ({
      category: cat._id,
      name: categoryDescriptions[cat._id] || cat._id,
      count: cat.count,
      recommendedCount: cat.recommendedCount,
      sources: cat.sources
    }));

    res.json({
      success: true,
      data: categoriesWithInfo
    });

  } catch (error) {
    console.error('Get Dua Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving categories'
    });
  }
});

/**
 * @route   GET /api/v1/dua/category/:categoryName
 * @desc    Get duas by specific category
 * @access  Public
 */
router.get('/category/:categoryName', optionalAuth, async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { recommended, difficulty, limit = 50 } = req.query;

    const query = { 
      category: categoryName, 
      isActive: true 
    };
    
    if (recommended === 'true') {
      query.isRecommended = true;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const duas = await Dua.find(query)
      .sort({ isRecommended: -1, 'stats.favoriteCount': -1 })
      .limit(parseInt(limit))
      .populate('relatedDuas', 'title arabicText translation');

    if (duas.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No duas found for category: ${categoryName}`
      });
    }

    res.json({
      success: true,
      category: categoryName,
      count: duas.length,
      data: duas
    });

  } catch (error) {
    console.error('Get Category Duas Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving category duas'
    });
  }
});

/**
 * @route   GET /api/v1/dua/:id
 * @desc    Get single dua by ID and increment view count
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const dua = await Dua.findById(req.params.id)
      .populate('relatedDuas', 'title arabicText translation category');

    if (!dua || !dua.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Dua not found'
      });
    }

    // Increment view count
    await dua.incrementView();

    res.json({
      success: true,
      data: dua
    });

  } catch (error) {
    console.error('Get Single Dua Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dua'
    });
  }
});

/**
 * @route   GET /api/v1/dua/recommended/all
 * @desc    Get all recommended duas across categories
 * @access  Public
 */
router.get('/recommended/all', optionalAuth, async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    
    const recommendedDuas = await Dua.getRecommended(category)
      .limit(parseInt(limit))
      .populate('relatedDuas', 'title translation');

    res.json({
      success: true,
      count: recommendedDuas.length,
      data: recommendedDuas
    });

  } catch (error) {
    console.error('Get Recommended Duas Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving recommended duas'
    });
  }
});

/**
 * @route   GET /api/v1/dua/search/:term
 * @desc    Search duas by text content
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

    const results = await Dua.searchDuas(term)
      .limit(parseInt(limit))
      .populate('relatedDuas', 'title translation');

    res.json({
      success: true,
      searchTerm: term,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Search Dua Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching duas'
    });
  }
});

/**
 * @route   GET /api/v1/dua/random/daily
 * @desc    Get random dua for daily inspiration
 * @access  Public
 */
router.get('/random/daily', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    const randomDua = await Dua.getRandomDua(category);

    if (randomDua.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No duas found'
      });
    }

    res.json({
      success: true,
      message: 'Daily dua inspiration',
      data: randomDua[0]
    });

  } catch (error) {
    console.error('Random Dua Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting random dua'
    });
  }
});

/**
 * @route   POST /api/v1/dua/:id/favorite
 * @desc    Add dua to favorites (increment favorite count)
 * @access  Private
 */
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const dua = await Dua.findById(req.params.id);

    if (!dua || !dua.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Dua not found'
      });
    }

    await dua.incrementFavorite();

    res.json({
      success: true,
      message: 'Dua added to favorites',
      favoriteCount: dua.stats.favoriteCount
    });

  } catch (error) {
    console.error('Favorite Dua Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding to favorites'
    });
  }
});

/**
 * @route   DELETE /api/v1/dua/:id/favorite
 * @desc    Remove dua from favorites (decrement favorite count)
 * @access  Private
 */
router.delete('/:id/favorite', protect, async (req, res) => {
  try {
    const dua = await Dua.findById(req.params.id);

    if (!dua || !dua.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Dua not found'
      });
    }

    await dua.decrementFavorite();

    res.json({
      success: true,
      message: 'Dua removed from favorites',
      favoriteCount: dua.stats.favoriteCount
    });

  } catch (error) {
    console.error('Unfavorite Dua Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from favorites'
    });
  }
});

/**
 * @route   GET /api/v1/dua/source/:grade
 * @desc    Get duas by source grade (sahih, hasan, quran, etc.)
 * @access  Public
 */
router.get('/source/:grade', optionalAuth, async (req, res) => {
  try {
    const { grade } = req.params;
    const { category, limit = 50 } = req.query;

    const query = { 
      'source.grade': grade, 
      isActive: true 
    };
    
    if (category) {
      query.category = category;
    }

    const duas = await Dua.find(query)
      .sort({ isRecommended: -1, 'stats.favoriteCount': -1 })
      .limit(parseInt(limit))
      .populate('relatedDuas', 'title translation');

    res.json({
      success: true,
      sourceGrade: grade,
      count: duas.length,
      data: duas
    });

  } catch (error) {
    console.error('Get Duas by Source Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving duas by source'
    });
  }
});

/**
 * @route   GET /api/v1/dua/difficulty/:level
 * @desc    Get duas by difficulty level (easy, medium, hard)
 * @access  Public
 */
router.get('/difficulty/:level', optionalAuth, async (req, res) => {
  try {
    const { level } = req.params;
    const { category, limit = 50 } = req.query;

    const query = { 
      difficulty: level, 
      isActive: true 
    };
    
    if (category) {
      query.category = category;
    }

    const duas = await Dua.find(query)
      .sort({ isRecommended: -1, 'stats.favoriteCount': -1 })
      .limit(parseInt(limit))
      .populate('relatedDuas', 'title translation');

    res.json({
      success: true,
      difficulty: level,
      count: duas.length,
      data: duas
    });

  } catch (error) {
    console.error('Get Duas by Difficulty Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving duas by difficulty'
    });
  }
});

module.exports = router;


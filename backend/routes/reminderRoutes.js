/**
 * Reminder Routes
 * 
 * Handles user reminders, notifications, and scheduling
 */

const express = require('express');
const Reminder = require('../models/Reminder');
const Tasbeeh = require('../models/Tasbeeh');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/v1/reminder
 * @desc    Get user's active reminders
 * @access  Private
 * @params  ?type=adhkar&limit=20&page=1
 */
router.get('/', protect, async (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    const userId = req.user.id;

    let query = { userId, isActive: true };
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;
    const reminders = await Reminder.find(query)
      .populate('contentId')
      .sort({ nextReminderAt: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Reminder.countDocuments(query);

    res.json({
      success: true,
      data: reminders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Reminders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reminders'
    });
  }
});

/**
 * @route   POST /api/v1/reminder
 * @desc    Create a new reminder
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type,
      title,
      description,
      recurrence,
      timing,
      content,
      notification,
      nextReminderAt
    } = req.body;

    // Validation
    if (!type || !title || !timing?.time) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and time are required'
      });
    }

    // Create reminder
    const reminder = new Reminder({
      userId,
      type,
      title: title.trim(),
      description: description?.trim(),
      recurrence: {
        type: recurrence?.type || 'once',
        interval: recurrence?.interval || 1,
        daysOfWeek: recurrence?.daysOfWeek || [],
        dayOfMonth: recurrence?.dayOfMonth,
        endDate: recurrence?.endDate
      },
      timing: {
        time: timing.time,
        timezone: timing.timezone || 'UTC',
        minutesBeforePrayer: timing.minutesBeforePrayer || 0
      },
      content: {
        contentType: content?.contentType,
        contentId: content?.contentId,
        customText: content?.customText
      },
      notification: {
        isEnabled: notification?.isEnabled !== false,
        repeatCount: notification?.repeatCount || 1,
        repeatInterval: notification?.repeatInterval || 5,
        sound: notification?.sound || 'default',
        vibrate: notification?.vibrate !== false
      },
      nextReminderAt: nextReminderAt || new Date()
    });

    // Calculate next reminder time if not provided
    if (!nextReminderAt) {
      reminder.calculateNextReminder();
    }

    await reminder.save();

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });

  } catch (error) {
    console.error('Create Reminder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating reminder'
    });
  }
});

/**
 * @route   GET /api/v1/reminder/:id
 * @desc    Get single reminder by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('contentId');

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      data: reminder
    });

  } catch (error) {
    console.error('Get Single Reminder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reminder'
    });
  }
});

/**
 * @route   PUT /api/v1/reminder/:id
 * @desc    Update reminder
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const {
      title,
      description,
      recurrence,
      timing,
      content,
      notification,
      isActive
    } = req.body;

    // Update fields
    if (title) reminder.title = title.trim();
    if (description !== undefined) reminder.description = description?.trim();
    if (recurrence) {
      reminder.recurrence = { ...reminder.recurrence, ...recurrence };
    }
    if (timing) {
      reminder.timing = { ...reminder.timing, ...timing };
    }
    if (content) {
      reminder.content = { ...reminder.content, ...content };
    }
    if (notification) {
      reminder.notification = { ...reminder.notification, ...notification };
    }
    if (isActive !== undefined) reminder.isActive = isActive;

    // Recalculate next reminder time if timing changed
    if (timing) {
      reminder.calculateNextReminder();
    }

    await reminder.save();

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder
    });

  } catch (error) {
    console.error('Update Reminder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating reminder'
    });
  }
});

/**
 * @route   DELETE /api/v1/reminder/:id
 * @desc    Delete reminder
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });

  } catch (error) {
    console.error('Delete Reminder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting reminder'
    });
  }
});

/**
 * @route   POST /api/v1/reminder/:id/acknowledge
 * @desc    Acknowledge reminder (user saw it)
 * @access  Private
 */
router.post('/:id/acknowledge', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    await reminder.acknowledge();

    res.json({
      success: true,
      message: 'Reminder acknowledged',
      stats: reminder.stats
    });

  } catch (error) {
    console.error('Acknowledge Reminder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error acknowledging reminder'
    });
  }
});

/**
 * @route   POST /api/v1/reminder/:id/snooze
 * @desc    Snooze reminder for specified minutes
 * @access  Private
 */
router.post('/:id/snooze', protect, async (req, res) => {
  try {
    const { minutes = 10 } = req.body;
    
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Snooze by adding minutes to next reminder time
    reminder.nextReminderAt = new Date(Date.now() + minutes * 60 * 1000);
    
    // Add to history
    reminder.history.unshift({
      action: 'snoozed',
      timestamp: new Date()
    });

    // Keep only last 10 history items
    if (reminder.history.length > 10) {
      reminder.history = reminder.history.slice(0, 10);
    }

    await reminder.save();

    res.json({
      success: true,
      message: `Reminder snoozed for ${minutes} minutes`,
      nextReminderAt: reminder.nextReminderAt
    });

  } catch (error) {
    console.error('Snooze Reminder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error snoozing reminder'
    });
  }
});

/**
 * @route   GET /api/v1/reminder/due/now
 * @desc    Get reminders that are due now (for notification service)
 * @access  Private
 */
router.get('/due/now', protect, async (req, res) => {
  try {
    const dueReminders = await Reminder.getDueReminders()
      .find({ userId: req.user.id });

    res.json({
      success: true,
      count: dueReminders.length,
      data: dueReminders
    });

  } catch (error) {
    console.error('Get Due Reminders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving due reminders'
    });
  }
});

/**
 * @route   GET /api/v1/reminder/type/:type
 * @desc    Get reminders by type
 * @access  Private
 */
router.get('/type/:type', protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20 } = req.query;

    const reminders = await Reminder.getByType(req.user.id, type)
      .limit(parseInt(limit))
      .populate('contentId');

    res.json({
      success: true,
      type,
      count: reminders.length,
      data: reminders
    });

  } catch (error) {
    console.error('Get Reminders by Type Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reminders by type'
    });
  }
});

/**
 * @route   POST /api/v1/reminder/bulk/create
 * @desc    Create multiple reminders at once (e.g., for prayer times)
 * @access  Private
 */
router.post('/bulk/create', protect, async (req, res) => {
  try {
    const { reminders } = req.body;

    if (!reminders || !Array.isArray(reminders)) {
      return res.status(400).json({
        success: false,
        message: 'Reminders array is required'
      });
    }

    // Add userId to each reminder
    const remindersWithUserId = reminders.map(reminder => ({
      ...reminder,
      userId: req.user.id
    }));

    // Validate and create reminders
    const createdReminders = await Reminder.insertMany(remindersWithUserId);

    // Calculate next reminder times
    for (const reminder of createdReminders) {
      if (!reminder.nextReminderAt) {
        reminder.calculateNextReminder();
        await reminder.save();
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdReminders.length} reminders created successfully`,
      count: createdReminders.length,
      data: createdReminders
    });

  } catch (error) {
    console.error('Bulk Create Reminders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating bulk reminders'
    });
  }
});

/**
 * @route   GET /api/v1/reminder/stats
 * @desc    Get reminder statistics for user
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Reminder.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          totalSent: { $sum: '$stats.totalSent' },
          acknowledged: { $sum: '$stats.acknowledged' },
          missed: { $sum: '$stats.missed' },
          byType: { 
            $push: { 
              type: '$type',
              count: 1,
              isActive: '$isActive'
            }
          }
        }
      }
    ]);

    const typeStats = {};
    if (stats[0]?.byType) {
      stats[0].byType.forEach(item => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, active: 0 };
        }
        typeStats[item.type].total += 1;
        if (item.isActive) {
          typeStats[item.type].active += 1;
        }
      });
    }

    const result = stats[0] || {
      total: 0,
      active: 0,
      totalSent: 0,
      acknowledged: 0,
      missed: 0
    };

    delete result.byType;
    result.byType = typeStats;

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get Reminder Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reminder statistics'
    });
  }
});

module.exports = router;


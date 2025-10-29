/**
 * Prayer Times Routes
 * 
 * Handles prayer times calculation, retrieval, and Islamic calendar data
 */

const express = require('express');
const axios = require('axios');
const PrayerTime = require('../models/PrayerTime');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/v1/prayer/times
 * @desc    Get prayer times for location and date
 * @access  Public
 * @params  ?lat=24.7136&lng=46.6753&date=2023-12-25&method=2&madhab=0
 */
router.get('/times', optionalAuth, async (req, res) => {
  try {
    const { 
      lat, 
      lng, 
      date = new Date().toISOString().split('T')[0], // Today's date
      method = 2, // Muslim World League
      madhab = 0  // Shafi/Standard
    } = req.query;

    // Validation
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const calculationMethod = parseInt(method);
    const madhabMethod = parseInt(madhab);

    // Check if we have cached prayer times
    let prayerTimes = await PrayerTime.findByLocationAndDate(
      latitude, 
      longitude, 
      new Date(date), 
      calculationMethod, 
      madhabMethod
    );

    if (!prayerTimes) {
      // Fetch from Aladhan API
      try {
        const aladhanUrl = `${process.env.ALADHAN_API || 'https://api.aladhan.com/v1'}/timings/${date}`;
        const params = {
          latitude,
          longitude,
          method: calculationMethod,
          madhab: madhabMethod
        };

        const response = await axios.get(aladhanUrl, { params });
        const data = response.data.data;

        // Create prayer times entry
        prayerTimes = new PrayerTime({
          location: {
            city: data.meta.timezone.split('/').pop().replace('_', ' '), // Extract city from timezone
            country: 'Unknown', // Would need geocoding API for accurate country
            latitude,
            longitude,
            timezone: data.meta.timezone
          },
          date: {
            hijri: {
              day: data.date.hijri.day,
              month: data.date.hijri.month.number,
              year: data.date.hijri.year,
              monthName: data.date.hijri.month.en,
              weekday: data.date.hijri.weekday.en
            },
            gregorian: {
              day: data.date.gregorian.day,
              month: data.date.gregorian.month.number,
              year: data.date.gregorian.year,
              monthName: data.date.gregorian.month.en,
              weekday: data.date.gregorian.weekday.en,
              date: new Date(date)
            }
          },
          prayers: {
            fajr: {
              time: data.timings.Fajr,
              timestamp: new Date(`${date}T${data.timings.Fajr}:00`)
            },
            sunrise: {
              time: data.timings.Sunrise,
              timestamp: new Date(`${date}T${data.timings.Sunrise}:00`)
            },
            dhuhr: {
              time: data.timings.Dhuhr,
              timestamp: new Date(`${date}T${data.timings.Dhuhr}:00`)
            },
            asr: {
              time: data.timings.Asr,
              timestamp: new Date(`${date}T${data.timings.Asr}:00`)
            },
            maghrib: {
              time: data.timings.Maghrib,
              timestamp: new Date(`${date}T${data.timings.Maghrib}:00`)
            },
            isha: {
              time: data.timings.Isha,
              timestamp: new Date(`${date}T${data.timings.Isha}:00`)
            }
          },
          calculationMethod,
          madhab: madhabMethod,
          qiblaDirection: data.meta.qiblaDirection || 0,
          dataSource: 'aladhan_api'
        });

        await prayerTimes.save();

      } catch (apiError) {
        console.error('Aladhan API Error:', apiError.message);
        return res.status(503).json({
          success: false,
          message: 'Prayer times service temporarily unavailable'
        });
      }
    }

    // Get next prayer and current prayer
    const nextPrayer = prayerTimes.getNextPrayer();
    const currentPrayer = prayerTimes.getCurrentPrayer();

    res.json({
      success: true,
      location: prayerTimes.location,
      date: prayerTimes.date,
      prayers: prayerTimes.prayers,
      qiblaDirection: prayerTimes.qiblaDirection,
      nextPrayer,
      currentPrayer,
      calculationMethod: {
        id: prayerTimes.calculationMethod,
        name: getCalculationMethodName(prayerTimes.calculationMethod)
      },
      madhab: {
        id: prayerTimes.madhab,
        name: prayerTimes.madhab === 0 ? 'Shafi/Standard' : 'Hanafi'
      }
    });

  } catch (error) {
    console.error('Get Prayer Times Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving prayer times'
    });
  }
});

/**
 * @route   GET /api/v1/prayer/times/city/:cityName
 * @desc    Get prayer times by city name
 * @access  Public
 */
router.get('/times/city/:cityName', optionalAuth, async (req, res) => {
  try {
    const { cityName } = req.params;
    const { 
      country = '', 
      date = new Date().toISOString().split('T')[0],
      method = 2,
      madhab = 0
    } = req.query;

    // Try to find cached prayer times for this city
    let prayerTimes = await PrayerTime.findByCity(cityName, country, new Date(date));

    if (!prayerTimes) {
      // Fetch from Aladhan API using city name
      try {
        const aladhanUrl = `${process.env.ALADHAN_API || 'https://api.aladhan.com/v1'}/timingsByCity/${date}`;
        const params = {
          city: cityName,
          country: country,
          method: parseInt(method),
          madhab: parseInt(madhab)
        };

        const response = await axios.get(aladhanUrl, { params });
        const data = response.data.data;

        // Create prayer times entry (similar to above)
        prayerTimes = new PrayerTime({
          location: {
            city: data.meta.timezone.split('/').pop().replace('_', ' '),
            country: country || 'Unknown',
            latitude: data.meta.latitude || 0,
            longitude: data.meta.longitude || 0,
            timezone: data.meta.timezone
          },
          date: {
            hijri: {
              day: data.date.hijri.day,
              month: data.date.hijri.month.number,
              year: data.date.hijri.year,
              monthName: data.date.hijri.month.en,
              weekday: data.date.hijri.weekday.en
            },
            gregorian: {
              day: data.date.gregorian.day,
              month: data.date.gregorian.month.number,
              year: data.date.gregorian.year,
              monthName: data.date.gregorian.month.en,
              weekday: data.date.gregorian.weekday.en,
              date: new Date(date)
            }
          },
          prayers: {
            fajr: {
              time: data.timings.Fajr,
              timestamp: new Date(`${date}T${data.timings.Fajr}:00`)
            },
            sunrise: {
              time: data.timings.Sunrise,
              timestamp: new Date(`${date}T${data.timings.Sunrise}:00`)
            },
            dhuhr: {
              time: data.timings.Dhuhr,
              timestamp: new Date(`${date}T${data.timings.Dhuhr}:00`)
            },
            asr: {
              time: data.timings.Asr,
              timestamp: new Date(`${date}T${data.timings.Asr}:00`)
            },
            maghrib: {
              time: data.timings.Maghrib,
              timestamp: new Date(`${date}T${data.timings.Maghrib}:00`)
            },
            isha: {
              time: data.timings.Isha,
              timestamp: new Date(`${date}T${data.timings.Isha}:00`)
            }
          },
          calculationMethod: parseInt(method),
          madhab: parseInt(madhab),
          qiblaDirection: data.meta.qiblaDirection || 0,
          dataSource: 'aladhan_api'
        });

        await prayerTimes.save();

      } catch (apiError) {
        console.error('City Prayer Times API Error:', apiError.message);
        return res.status(404).json({
          success: false,
          message: `Prayer times not found for city: ${cityName}`
        });
      }
    }

    const nextPrayer = prayerTimes.getNextPrayer();
    const currentPrayer = prayerTimes.getCurrentPrayer();

    res.json({
      success: true,
      location: prayerTimes.location,
      date: prayerTimes.date,
      prayers: prayerTimes.prayers,
      qiblaDirection: prayerTimes.qiblaDirection,
      nextPrayer,
      currentPrayer
    });

  } catch (error) {
    console.error('Get City Prayer Times Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving city prayer times'
    });
  }
});

/**
 * @route   GET /api/v1/prayer/calendar
 * @desc    Get Islamic calendar information for date
 * @access  Public
 */
router.get('/calendar', optionalAuth, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;

    const calendarUrl = `${process.env.ALADHAN_API || 'https://api.aladhan.com/v1'}/gToH/${date}`;
    const response = await axios.get(calendarUrl);
    const data = response.data.data;

    res.json({
      success: true,
      gregorian: {
        date: data.gregorian.date,
        day: data.gregorian.day,
        month: data.gregorian.month,
        year: data.gregorian.year,
        weekday: data.gregorian.weekday
      },
      hijri: {
        date: data.hijri.date,
        day: data.hijri.day,
        month: data.hijri.month,
        year: data.hijri.year,
        weekday: data.hijri.weekday
      }
    });

  } catch (error) {
    console.error('Get Calendar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving calendar information'
    });
  }
});

/**
 * @route   GET /api/v1/prayer/methods
 * @desc    Get available calculation methods
 * @access  Public
 */
router.get('/methods', (req, res) => {
  const methods = {
    1: 'University of Islamic Sciences, Karachi',
    2: 'Islamic Society of North America (ISNA)',
    3: 'Muslim World League (MWL)',
    4: 'Umm al-Qura, Makkah',
    5: 'Egyptian General Authority of Survey',
    7: 'Institute of Geophysics, University of Tehran',
    8: 'Gulf Region',
    9: 'Kuwait',
    10: 'Qatar',
    11: 'Majlis Ugama Islam Singapura, Singapore',
    12: 'Union Organization islamic de France',
    13: 'Diyanet İşleri Başkanlığı, Turkey',
    15: 'Spiritual Administration of Muslims of Russia',
    16: 'Moonsighting Committee Worldwide (also requires shafaq paramteer)'
  };

  const methodsArray = Object.entries(methods).map(([id, name]) => ({
    id: parseInt(id),
    name
  }));

  res.json({
    success: true,
    data: methodsArray,
    default: {
      id: 2,
      name: 'Muslim World League (MWL)'
    }
  });
});

/**
 * Helper function to get calculation method name
 */
function getCalculationMethodName(methodId) {
  const methods = {
    1: 'University of Islamic Sciences, Karachi',
    2: 'Islamic Society of North America (ISNA)', 
    3: 'Muslim World League (MWL)',
    4: 'Umm al-Qura, Makkah',
    5: 'Egyptian General Authority of Survey',
    7: 'Institute of Geophysics, University of Tehran',
    8: 'Gulf Region',
    9: 'Kuwait',
    10: 'Qatar',
    11: 'Majlis Ugama Islam Singapura, Singapore',
    12: 'Union Organization islamic de France',
    13: 'Diyanet İşleri Başkanlığı, Turkey',
    15: 'Spiritual Administration of Muslims of Russia',
    16: 'Moonsighting Committee Worldwide'
  };

  return methods[methodId] || 'Unknown Method';
}

module.exports = router;


import axios from 'axios';
import { API_URLS, API_KEYS } from '../config/api';

// Aladhan Prayer Times API
const ALADHAN_BASE_URL = API_URLS.ALADHAN;

/**
 * Fetch prayer times from Aladhan API
 * @param {number} latitude - User latitude
 * @param {number} longitude - User longitude
 * @param {number} method - Calculation method (2 = ISNA default)
 * @returns {Promise<Object>} Prayer times object
 */
export const fetchPrayerTimes = async (latitude, longitude, method = 2) => {
  try {
    console.log(`🕌 [ApiUtils] Fetching prayer times for (${latitude}, ${longitude})`);
    console.log(`   Method: ${method} (2=ISNA, 1=MWL, 3=Egypt, 4=Makkah, 5=Karachi)`);
    
    const url = `${ALADHAN_BASE_URL}/timings`;
    const params = {
      latitude,
      longitude,
      method,
    };
    
    console.log(`📡 [ApiUtils] API Request: ${url}`);
    const response = await axios.get(url, { params });

    if (response.data && response.data.data) {
      const timings = response.data.data.timings;
      const date = response.data.data.date;
      
      console.log('✅ [ApiUtils] Prayer times received:');
      console.log(`   Fajr: ${timings.Fajr}`);
      console.log(`   Dhuhr: ${timings.Dhuhr}`);
      console.log(`   Asr: ${timings.Asr}`);
      console.log(`   Maghrib: ${timings.Maghrib}`);
      console.log(`   Isha: ${timings.Isha}`);
      console.log(`   Date: ${date.readable}`);
      
      return {
        ...timings,
        date,
      };
    }

    console.error('❌ [ApiUtils] No prayer times data received');
    return null;
  } catch (error) {
    console.error('❌ [ApiUtils] Error fetching prayer times:', error.message);
    return null;
  }
};

// Legacy function name for backwards compatibility
export const getPrayerTimes = fetchPrayerTimes;

export const getMonthPrayerTimes = async (latitude, longitude, month, year, method = 2) => {
  try {
    const response = await axios.get(`${ALADHAN_BASE_URL}/calendar`, {
      params: {
        latitude,
        longitude,
        method,
        month,
        year,
      },
    });

    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: 'No data received',
    };
  } catch (error) {
    console.error('Error fetching month prayer times:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// OpenWeatherMap API (Optional)
const OPENWEATHER_BASE_URL = API_URLS.OPENWEATHER;
const OPENWEATHER_API_KEY = API_KEYS.OPENWEATHER;

export const getWeatherData = async (latitude, longitude) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      console.log('ℹ️ [ApiUtils] OpenWeatherMap API key not configured (optional feature)');
      return {
        success: false,
        error: 'API key not configured',
      };
    }

    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
      },
    });

    if (response.data) {
      return {
        success: true,
        data: {
          weather: response.data.weather[0].main, // Rain, Clear, Clouds, etc.
          description: response.data.weather[0].description,
          temperature: response.data.main.temp,
          humidity: response.data.main.humidity,
        },
      };
    }

    return {
      success: false,
      error: 'No data received',
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const isRaining = async (latitude, longitude) => {
  try {
    const weather = await getWeatherData(latitude, longitude);
    
    if (weather.success) {
      const weatherType = weather.data.weather.toLowerCase();
      return (
        weatherType.includes('rain') ||
        weatherType.includes('drizzle') ||
        weatherType.includes('thunderstorm')
      );
    }

    return false;
  } catch (error) {
    console.error('Error checking rain status:', error);
    return false;
  }
};

// Calculate time until next prayer
export const getNextPrayer = (prayerTimes) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.Fajr },
    { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.Sunrise },
    { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.Dhuhr },
    { name: 'Asr', nameAr: 'العصر', time: prayerTimes.Asr },
    { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.Maghrib },
    { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.Isha },
  ];

  // Convert prayer times to minutes
  const prayerMinutes = prayers.map((prayer) => {
    const [hours, minutes] = prayer.time.split(':');
    return {
      ...prayer,
      minutes: parseInt(hours) * 60 + parseInt(minutes),
    };
  });

  // Find next prayer
  let nextPrayer = null;
  let minDiff = Infinity;

  for (const prayer of prayerMinutes) {
    const diff = prayer.minutes - currentTime;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextPrayer = prayer;
    }
  }

  // If no prayer found for today, next prayer is Fajr tomorrow
  if (!nextPrayer) {
    nextPrayer = prayerMinutes[0];
    minDiff = 24 * 60 - currentTime + prayerMinutes[0].minutes;
  }

  const hours = Math.floor(minDiff / 60);
  const minutes = minDiff % 60;

  return {
    name: nextPrayer.name,
    nameAr: nextPrayer.nameAr,
    time: nextPrayer.time,
    timeUntil: {
      hours,
      minutes,
      formatted: `${hours}h ${minutes}m`,
    },
  };
};

// Hijri date conversion
export const getHijriDate = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // This is a simplified approximation
  // For accurate Hijri dates, use the Aladhan API response
  return {
    day,
    month,
    year,
  };
};






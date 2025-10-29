import axios from 'axios';

// Aladhan Prayer Times API
const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';

export const getPrayerTimes = async (latitude, longitude, method = 2) => {
  try {
    const response = await axios.get(`${ALADHAN_BASE_URL}/timings`, {
      params: {
        latitude,
        longitude,
        method, // 2 = ISNA (default), 1 = MWL, 3 = Egypt, 4 = Makkah, 5 = Karachi, 7 = Tehran, 8 = Jafari
      },
    });

    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data.timings,
        date: response.data.data.date,
      };
    }

    return {
      success: false,
      error: 'No data received',
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

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

// OpenWeatherMap API
// NOTE: User needs to add their own API key in app.json or here
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // User will replace this

export const getWeatherData = async (latitude, longitude) => {
  try {
    if (OPENWEATHER_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
      console.warn('OpenWeatherMap API key not set');
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



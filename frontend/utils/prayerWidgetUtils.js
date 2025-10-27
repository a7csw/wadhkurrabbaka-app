/**
 * Prayer Widget Utility for Wathkur Rabbak
 * 
 * Handles next prayer calculation and countdown logic
 */

import moment from 'moment-timezone';

/**
 * Calculate next prayer and time remaining
 * @param {object} prayerTimes - Prayer times object from Aladhan API
 * @returns {object} - Next prayer info with countdown
 */
export const calculateNextPrayer = (prayerTimes) => {
  if (!prayerTimes || !prayerTimes.timings) {
    return null;
  }

  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  for (let i = 0; i < prayerNames.length; i++) {
    const prayerName = prayerNames[i];
    const prayerTimeStr = prayerTimes.timings[prayerName];
    
    if (!prayerTimeStr) continue;
    
    const prayerMoment = moment(`${today} ${prayerTimeStr}`, 'YYYY-MM-DD HH:mm');
    
    if (prayerMoment.isAfter(now)) {
      const diffSeconds = prayerMoment.diff(now, 'seconds');
      const duration = moment.duration(diffSeconds, 'seconds');
      
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();
      
      return {
        name: prayerName,
        time: prayerTimeStr,
        countdown: {
          hours,
          minutes,
          seconds,
          formatted: `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`,
          shortFormatted: `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        },
      };
    }
  }
  
  // If no prayer left for today, get Fajr of next day
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
  const fajrTomorrow = moment(`${tomorrow} ${prayerTimes.timings.Fajr}`, 'YYYY-MM-DD HH:mm');
  const diffSeconds = fajrTomorrow.diff(now, 'seconds');
  const duration = moment.duration(diffSeconds, 'seconds');
  
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  
  return {
    name: 'Fajr',
    time: prayerTimes.timings.Fajr,
    countdown: {
      hours,
      minutes,
      seconds,
      formatted: `${hours}h ${minutes}m ${seconds}s`,
      shortFormatted: `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    },
  };
};

/**
 * Get prayer name in Arabic
 * @param {string} prayerName - Prayer name in English
 * @returns {string} - Prayer name in Arabic
 */
export const getPrayerNameInArabic = (prayerName) => {
  const arabicNames = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
  };
  
  return arabicNames[prayerName] || prayerName;
};

/**
 * Get prayer icon emoji
 * @param {string} prayerName - Prayer name in English
 * @returns {string} - Emoji icon
 */
export const getPrayerIcon = (prayerName) => {
  const icons = {
    Fajr: '🌅',
    Dhuhr: '☀️',
    Asr: '🌤️',
    Maghrib: '🌇',
    Isha: '🌙',
  };
  
  return icons[prayerName] || '🕋';
};

/**
 * Format countdown for display (compact version)
 * @param {object} countdown - Countdown object with hours, minutes, seconds
 * @returns {string} - Formatted countdown string
 */
export const formatCountdownCompact = (countdown) => {
  if (!countdown) return '--:--';
  
  const { hours, minutes } = countdown;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};


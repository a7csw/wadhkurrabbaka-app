/**
 * Prayer Times Utilities
 * Handles prayer time calculations, current/next prayer detection, and countdown logic
 */

/**
 * Get the current prayer and next prayer with countdown
 * @param {Object} prayerTimes - Prayer times object from Aladhan API
 * @returns {Object} Current prayer, next prayer, and time remaining
 */
export const getCurrentAndNextPrayer = (prayerTimes) => {
  if (!prayerTimes) {
    return {
      currentPrayer: null,
      nextPrayer: null,
      nextPrayerTime: null,
      timeRemaining: null,
      progress: 0,
    };
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Define prayer order
  const prayers = [
    { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.Fajr },
    { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.Dhuhr },
    { name: 'Asr', nameAr: 'العصر', time: prayerTimes.Asr },
    { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.Maghrib },
    { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.Isha },
  ];

  // Convert prayer times to minutes
  const prayerMinutes = prayers.map((prayer) => {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    return {
      ...prayer,
      minutes: hours * 60 + minutes,
    };
  });

  // Find current and next prayer
  let currentPrayer = null;
  let nextPrayer = null;
  let nextPrayerIndex = 0;

  for (let i = 0; i < prayerMinutes.length; i++) {
    if (currentTime < prayerMinutes[i].minutes) {
      nextPrayer = prayerMinutes[i];
      nextPrayerIndex = i;
      currentPrayer = i > 0 ? prayerMinutes[i - 1] : null;
      break;
    }
  }

  // If no next prayer found, next prayer is Fajr tomorrow
  if (!nextPrayer) {
    nextPrayer = prayerMinutes[0];
    currentPrayer = prayerMinutes[prayerMinutes.length - 1];
    nextPrayerIndex = 0;
  }

  // Calculate time remaining
  let minutesRemaining;
  if (nextPrayerIndex === 0 && currentTime >= prayerMinutes[prayerMinutes.length - 1].minutes) {
    // Next prayer is tomorrow's Fajr
    minutesRemaining = (24 * 60 - currentTime) + nextPrayer.minutes;
  } else {
    minutesRemaining = nextPrayer.minutes - currentTime;
  }

  const hours = Math.floor(minutesRemaining / 60);
  const minutes = Math.floor(minutesRemaining % 60);
  const seconds = Math.floor((now.getSeconds()));
  const remainingSeconds = 60 - seconds;

  // Calculate progress percentage
  let progress = 0;
  if (currentPrayer) {
    const totalMinutes = nextPrayer.minutes - currentPrayer.minutes;
    const elapsedMinutes = currentTime - currentPrayer.minutes;
    progress = (elapsedMinutes / totalMinutes) * 100;
  }

  return {
    currentPrayer: currentPrayer ? currentPrayer.name : 'Isha',
    currentPrayerAr: currentPrayer ? currentPrayer.nameAr : 'العشاء',
    nextPrayer: nextPrayer.name,
    nextPrayerAr: nextPrayer.nameAr,
    nextPrayerTime: nextPrayer.time,
    timeRemaining: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`,
    progress: Math.min(Math.max(progress, 0), 100),
    allPrayers: prayers,
  };
};

/**
 * Format time to 12-hour format with AM/PM
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format
 */
export const formatTime12Hour = (time24) => {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
};

/**
 * Check if a prayer is the current active prayer
 * @param {string} prayerName - Name of the prayer
 * @param {string} currentPrayer - Current active prayer name
 * @returns {boolean}
 */
export const isCurrentPrayer = (prayerName, currentPrayer) => {
  return prayerName === currentPrayer;
};

/**
 * Check if a prayer is the next upcoming prayer
 * @param {string} prayerName - Name of the prayer
 * @param {string} nextPrayer - Next prayer name
 * @returns {boolean}
 */
export const isNextPrayer = (prayerName, nextPrayer) => {
  return prayerName === nextPrayer;
};

/**
 * Get prayer icon emoji based on prayer name
 * @param {string} prayerName - Name of the prayer
 * @returns {string} Emoji icon
 */
export const getPrayerIcon = (prayerName) => {
  const icons = {
    Fajr: '🌅',
    Dhuhr: '☀️',
    Asr: '🌤️',
    Maghrib: '🌇',
    Isha: '🌙',
  };
  return icons[prayerName] || '🕌';
};

/**
 * Get greeting based on current time
 * @returns {Object} Greeting in Arabic and English
 */
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return {
      arabic: 'صباح الخير',
      english: 'Good Morning',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      arabic: 'مساء الخير',
      english: 'Good Afternoon',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      arabic: 'مساء الخير',
      english: 'Good Evening',
    };
  } else {
    return {
      arabic: 'مساء الخير',
      english: 'Good Night',
    };
  }
};

export default {
  getCurrentAndNextPrayer,
  formatTime12Hour,
  isCurrentPrayer,
  isNextPrayer,
  getPrayerIcon,
  getTimeBasedGreeting,
};


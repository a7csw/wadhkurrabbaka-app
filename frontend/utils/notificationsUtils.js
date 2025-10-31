import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotificationsEnabled } from './storage';
import { isRaining } from './apiUtils';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleAdhkarNotification = async (title, body, hour, minute) => {
  try {
    const enabled = await getNotificationsEnabled();
    if (!enabled) {
      console.log('Notifications are disabled');
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return null;
    }

    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const scheduleMorningAdhkarNotification = async () => {
  // Schedule for 6:30 AM (after Fajr typically)
  return await scheduleAdhkarNotification(
    '🌅 وقت أذكار الصباح',
    'حان وقت أذكار الصباح. اغتنم البركة!',
    6,
    30
  );
};

export const scheduleEveningAdhkarNotification = async () => {
  // Schedule for 5:00 PM (after Asr typically)
  return await scheduleAdhkarNotification(
    '🌙 وقت أذكار المساء',
    'حان وقت أذكار المساء. لا تنسَ ذكر الله!',
    17,
    0
  );
};

export const scheduleSleepAdhkarNotification = async () => {
  // Schedule for 10:00 PM
  return await scheduleAdhkarNotification(
    '🛌 وقت أذكار النوم',
    'حان وقت النوم. لا تنسَ أذكار النوم!',
    22,
    0
  );
};

export const scheduleAllAdhkarNotifications = async () => {
  try {
    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule new notifications
    const morning = await scheduleMorningAdhkarNotification();
    const evening = await scheduleEveningAdhkarNotification();
    const sleep = await scheduleSleepAdhkarNotification();

    return {
      morning,
      evening,
      sleep,
    };
  } catch (error) {
    console.error('Error scheduling all notifications:', error);
    return null;
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
};

export const sendRainNotification = async () => {
  try {
    const enabled = await getNotificationsEnabled();
    if (!enabled) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌧️ إنها تمطر!',
        body: 'تذكّر دعاء المطر: اللَّهُمَّ صَيِّبًا نَافِعًا',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    return true;
  } catch (error) {
    console.error('Error sending rain notification:', error);
    return false;
  }
};

export const checkWeatherAndNotify = async (latitude, longitude) => {
  try {
    const raining = await isRaining(latitude, longitude);
    
    if (raining) {
      await sendRainNotification();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking weather:', error);
    return false;
  }
};

export const schedulePrayerNotification = async (prayerName, prayerNameAr, hour, minute) => {
  try {
    const enabled = await getNotificationsEnabled();
    if (!enabled) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🕌 وقت صلاة ${prayerNameAr}`,
        body: `حان الآن وقت صلاة ${prayerNameAr} (${prayerName})`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling prayer notification:', error);
    return null;
  }
};

export const schedulePrayerNotifications = async (prayerTimes) => {
  try {
    const prayers = [
      { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.Fajr },
      { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.Dhuhr },
      { name: 'Asr', nameAr: 'العصر', time: prayerTimes.Asr },
      { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.Maghrib },
      { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.Isha },
    ];

    const notificationIds = [];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':');
      const notificationId = await schedulePrayerNotification(
        prayer.name,
        prayer.nameAr,
        parseInt(hours),
        parseInt(minutes)
      );
      if (notificationId) {
        notificationIds.push(notificationId);
      }
    }

    return notificationIds;
  } catch (error) {
    console.error('Error scheduling prayer notifications:', error);
    return [];
  }
};






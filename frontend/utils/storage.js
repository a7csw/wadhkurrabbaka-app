import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  TASBEEH_COUNT: '@tasbeeh_count',
  TASBEEH_TARGET: '@tasbeeh_target',
  TASBEEH_TEXT: '@tasbeeh_text',
  GARDEN_TREES: '@garden_trees',
  FAVORITE_ADHKAR: '@favorite_adhkar',
  FAVORITE_DUAS: '@favorite_duas',
  NOTIFICATIONS_ENABLED: '@notifications_enabled',
  LOCATION_ENABLED: '@location_enabled',
  LAST_LOCATION: '@last_location',
  PRAYER_CALCULATION_METHOD: '@prayer_calculation_method',
};

// Tasbeeh Storage
export const saveTasbeehCount = async (count) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASBEEH_COUNT, count.toString());
    return true;
  } catch (error) {
    console.error('Error saving Tasbeeh count:', error);
    return false;
  }
};

export const getTasbeehCount = async () => {
  try {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.TASBEEH_COUNT);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting Tasbeeh count:', error);
    return 0;
  }
};

export const resetTasbeehCount = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASBEEH_COUNT, '0');
    return true;
  } catch (error) {
    console.error('Error resetting Tasbeeh count:', error);
    return false;
  }
};

export const saveTasbeehText = async (text) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASBEEH_TEXT, text);
    return true;
  } catch (error) {
    console.error('Error saving Tasbeeh text:', error);
    return false;
  }
};

export const getTasbeehText = async () => {
  try {
    const text = await AsyncStorage.getItem(STORAGE_KEYS.TASBEEH_TEXT);
    return text || 'سُبْحَانَ اللهِ';
  } catch (error) {
    console.error('Error getting Tasbeeh text:', error);
    return 'سُبْحَانَ اللهِ';
  }
};

// Garden Trees Storage
export const saveGardenTrees = async (trees) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GARDEN_TREES, trees.toString());
    console.log(`🌳 [Storage] Saved ${trees} trees to garden`);
    return true;
  } catch (error) {
    console.error('Error saving garden trees:', error);
    return false;
  }
};

export const getGardenTrees = async () => {
  try {
    const trees = await AsyncStorage.getItem(STORAGE_KEYS.GARDEN_TREES);
    const count = trees ? parseInt(trees, 10) : 0;
    console.log(`🌳 [Storage] Retrieved ${count} trees from garden`);
    return count;
  } catch (error) {
    console.error('Error getting garden trees:', error);
    return 0;
  }
};

export const resetGardenTrees = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GARDEN_TREES, '0');
    console.log('🌳 [Storage] Garden trees reset to 0');
    return true;
  } catch (error) {
    console.error('Error resetting garden trees:', error);
    return false;
  }
};

// Favorites Storage
export const addFavoriteAdhkar = async (adhkarId) => {
  try {
    const favorites = await getFavoriteAdhkar();
    if (!favorites.includes(adhkarId)) {
      favorites.push(adhkarId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ADHKAR, JSON.stringify(favorites));
    }
    return true;
  } catch (error) {
    console.error('Error adding favorite Adhkar:', error);
    return false;
  }
};

export const removeFavoriteAdhkar = async (adhkarId) => {
  try {
    let favorites = await getFavoriteAdhkar();
    favorites = favorites.filter(id => id !== adhkarId);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ADHKAR, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error removing favorite Adhkar:', error);
    return false;
  }
};

export const getFavoriteAdhkar = async () => {
  try {
    const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_ADHKAR);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorite Adhkar:', error);
    return [];
  }
};

export const addFavoriteDua = async (duaId) => {
  try {
    const favorites = await getFavoriteDuas();
    if (!favorites.includes(duaId)) {
      favorites.push(duaId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_DUAS, JSON.stringify(favorites));
    }
    return true;
  } catch (error) {
    console.error('Error adding favorite Dua:', error);
    return false;
  }
};

export const removeFavoriteDua = async (duaId) => {
  try {
    let favorites = await getFavoriteDuas();
    favorites = favorites.filter(id => id !== duaId);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_DUAS, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error removing favorite Dua:', error);
    return false;
  }
};

export const getFavoriteDuas = async () => {
  try {
    const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_DUAS);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorite Duas:', error);
    return [];
  }
};

// Settings Storage
export const saveNotificationsEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled.toString());
    return true;
  } catch (error) {
    console.error('Error saving notifications setting:', error);
    return false;
  }
};

export const getNotificationsEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    return enabled === 'true';
  } catch (error) {
    console.error('Error getting notifications setting:', error);
    return true; // Default to enabled
  }
};

export const saveLocationEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_ENABLED, enabled.toString());
    return true;
  } catch (error) {
    console.error('Error saving location setting:', error);
    return false;
  }
};

export const getLocationEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_ENABLED);
    return enabled === 'true';
  } catch (error) {
    console.error('Error getting location setting:', error);
    return true; // Default to enabled
  }
};

export const saveLastLocation = async (location) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
    return true;
  } catch (error) {
    console.error('Error saving last location:', error);
    return false;
  }
};

export const getLastLocation = async () => {
  try {
    const location = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    return location ? JSON.parse(location) : null;
  } catch (error) {
    console.error('Error getting last location:', error);
    return null;
  }
};

export const savePrayerCalculationMethod = async (method) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_CALCULATION_METHOD, method);
    return true;
  } catch (error) {
    console.error('Error saving prayer calculation method:', error);
    return false;
  }
};

export const getPrayerCalculationMethod = async () => {
  try {
    const method = await AsyncStorage.getItem(STORAGE_KEYS.PRAYER_CALCULATION_METHOD);
    return method || '2'; // Default to ISNA (2)
  } catch (error) {
    console.error('Error getting prayer calculation method:', error);
    return '2';
  }
};

// Clear all storage (for debugging)
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};






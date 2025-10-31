/**
 * API Service
 * 
 * Handles all HTTP requests to the Noor backend API
 */

import axios from 'axios';
import Constants from 'expo-constants';

// API Base URL Configuration
// In development, use your local IP address or localhost
const getApiUrl = () => {
  const { manifest } = Constants;
  
  if (__DEV__) {
    // Development: Use your local IP address
    // Replace with your actual IP address when testing on physical device
    const localIP = manifest?.debuggerHost?.split(':')[0];
    return `http://${localIP || 'localhost'}:5000/api/v1`;
  }
  
  // Production: Use your deployed backend URL
  return 'https://your-noor-backend.herokuapp.com/api/v1';
};

const API_BASE_URL = getApiUrl();

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add timestamp for cache busting
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Token expired or invalid - you might want to logout user
      console.log('Authentication error - token may be expired');
    } else if (error.response?.status >= 500) {
      console.log('Server error - please try again later');
    } else if (error.code === 'ECONNABORTED') {
      console.log('Request timeout - please check your connection');
    } else if (error.code === 'NETWORK_ERROR') {
      console.log('Network error - please check your internet connection');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to add auth header
const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// ================================
// Authentication Services
// ================================
export const authService = {
  async login(email, password) {
    return await api.post('/auth/login', { email, password });
  },

  async register(name, email, password) {
    return await api.post('/auth/register', { name, email, password });
  },

  async getProfile(token) {
    return await api.get('/auth/me', withAuth(token));
  },

  async updateProfile(profileData, token) {
    return await api.put('/auth/profile', profileData, withAuth(token));
  },

  async updatePreferences(preferences, token) {
    return await api.put('/auth/preferences', preferences, withAuth(token));
  },

  async changePassword(currentPassword, newPassword, token) {
    return await api.put('/auth/password', 
      { currentPassword, newPassword }, 
      withAuth(token)
    );
  },

  async verifyToken(token) {
    return await api.post('/auth/verify-token', {}, withAuth(token));
  },

  async deactivateAccount(token) {
    return await api.delete('/auth/account', withAuth(token));
  },
};

// ================================
// Zikr (Adhkar) Services
// ================================
export const zikrService = {
  async getAllZikr(params = {}) {
    return await api.get('/zikr', { params });
  },

  async getCategories() {
    return await api.get('/zikr/categories');
  },

  async getZikrByCategory(category, params = {}) {
    return await api.get(`/zikr/category/${category}`, { params });
  },

  async getZikrById(id) {
    return await api.get(`/zikr/${id}`);
  },

  async getEssentialZikr(category = null) {
    const params = category ? { category } : {};
    return await api.get('/zikr/essential/all', { params });
  },

  async searchZikr(searchTerm, params = {}) {
    return await api.get(`/zikr/search/${searchTerm}`, { params });
  },

  async markAsRecited(zikrId, token) {
    return await api.post(`/zikr/${zikrId}/recite`, {}, withAuth(token));
  },

  async getRandomZikr(category = null) {
    const params = category ? { category } : {};
    return await api.get('/zikr/random/daily', { params });
  },

  async getOccasionZikr(occasion, params = {}) {
    return await api.get(`/zikr/occasion/${occasion}`, { params });
  },
};

// ================================
// Dua Services
// ================================
export const duaService = {
  async getAllDuas(params = {}) {
    return await api.get('/dua', { params });
  },

  async getCategories() {
    return await api.get('/dua/categories');
  },

  async getDuasByCategory(category, params = {}) {
    return await api.get(`/dua/category/${category}`, { params });
  },

  async getDuaById(id) {
    return await api.get(`/dua/${id}`);
  },

  async getRecommendedDuas(category = null, limit = 20) {
    const params = { limit };
    if (category) params.category = category;
    return await api.get('/dua/recommended/all', { params });
  },

  async searchDuas(searchTerm, params = {}) {
    return await api.get(`/dua/search/${searchTerm}`, { params });
  },

  async getRandomDua(category = null) {
    const params = category ? { category } : {};
    return await api.get('/dua/random/daily', { params });
  },

  async addToFavorites(duaId, token) {
    return await api.post(`/dua/${duaId}/favorite`, {}, withAuth(token));
  },

  async removeFromFavorites(duaId, token) {
    return await api.delete(`/dua/${duaId}/favorite`, withAuth(token));
  },

  async getDuasBySource(sourceGrade, params = {}) {
    return await api.get(`/dua/source/${sourceGrade}`, { params });
  },

  async getDuasByDifficulty(difficulty, params = {}) {
    return await api.get(`/dua/difficulty/${difficulty}`, { params });
  },
};

// ================================
// Prayer Times Services
// ================================
export const prayerService = {
  async getPrayerTimes(latitude, longitude, params = {}) {
    return await api.get('/prayer/times', {
      params: { lat: latitude, lng: longitude, ...params }
    });
  },

  async getPrayerTimesByCity(city, country = '', params = {}) {
    return await api.get(`/prayer/times/city/${city}`, {
      params: { country, ...params }
    });
  },

  async getIslamicCalendar(date = null) {
    const params = date ? { date } : {};
    return await api.get('/prayer/calendar', { params });
  },

  async getCalculationMethods() {
    return await api.get('/prayer/methods');
  },
};

// ================================
// Qibla Services
// ================================
export const qiblaService = {
  async getQiblaDirection(latitude, longitude) {
    return await api.get('/qibla/direction', {
      params: { lat: latitude, lng: longitude }
    });
  },

  async getCompassInfo(latitude, longitude) {
    return await api.get('/qibla/compass', {
      params: { lat: latitude, lng: longitude }
    });
  },

  async verifyDirection(userLat, userLng, userDirection) {
    return await api.post('/qibla/verify', {
      userLat,
      userLng,
      userDirection
    });
  },
};

// ================================
// Reminder Services
// ================================
export const reminderService = {
  async getAllReminders(token, params = {}) {
    return await api.get('/reminder', { ...withAuth(token), params });
  },

  async createReminder(reminderData, token) {
    return await api.post('/reminder', reminderData, withAuth(token));
  },

  async getReminderById(reminderId, token) {
    return await api.get(`/reminder/${reminderId}`, withAuth(token));
  },

  async updateReminder(reminderId, reminderData, token) {
    return await api.put(`/reminder/${reminderId}`, reminderData, withAuth(token));
  },

  async deleteReminder(reminderId, token) {
    return await api.delete(`/reminder/${reminderId}`, withAuth(token));
  },

  async acknowledgeReminder(reminderId, token) {
    return await api.post(`/reminder/${reminderId}/acknowledge`, {}, withAuth(token));
  },

  async snoozeReminder(reminderId, minutes = 10, token) {
    return await api.post(`/reminder/${reminderId}/snooze`, { minutes }, withAuth(token));
  },

  async getDueReminders(token) {
    return await api.get('/reminder/due/now', withAuth(token));
  },

  async getRemindersByType(type, token, limit = 20) {
    return await api.get(`/reminder/type/${type}`, { 
      ...withAuth(token), 
      params: { limit } 
    });
  },

  async createBulkReminders(reminders, token) {
    return await api.post('/reminder/bulk/create', { reminders }, withAuth(token));
  },

  async getReminderStats(token) {
    return await api.get('/reminder/stats', withAuth(token));
  },
};

// ================================
// Tasbeeh Services (if you add backend routes for this)
// ================================
export const tasbeehService = {
  // These would require additional backend routes
  async getUserCounters(token) {
    return await api.get('/tasbeeh', withAuth(token));
  },

  async createCounter(counterData, token) {
    return await api.post('/tasbeeh', counterData, withAuth(token));
  },

  async updateCounter(counterId, counterData, token) {
    return await api.put(`/tasbeeh/${counterId}`, counterData, withAuth(token));
  },

  async deleteCounter(counterId, token) {
    return await api.delete(`/tasbeeh/${counterId}`, withAuth(token));
  },
};

// ================================
// Utility Functions
// ================================
export const apiUtils = {
  // Get API base URL for debugging
  getBaseUrl: () => API_BASE_URL,
  
  // Health check
  async healthCheck() {
    try {
      return await api.get('/health');
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Test connection
  async testConnection() {
    try {
      const response = await api.get('/health');
      return { connected: true, response };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  },
};

// Export the configured axios instance for direct use if needed
export default api;





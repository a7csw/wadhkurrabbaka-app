/**
 * Connectivity utilities for handling network errors
 */

import { Alert } from 'react-native';

/**
 * Handle network connectivity errors with user-friendly messages
 * @param {Error} error - The error object
 * @param {Function} retryCallback - Optional callback to retry the operation
 */
export const handleConnectivityError = (error, retryCallback = null) => {
  console.error('🔌 [Connectivity] Network error:', error);

  const errorMessage = error.message || 'Unknown error';
  let title = 'Connection Error';
  let message = 'Unable to connect to the server.';

  // Specific error handling
  if (errorMessage.includes('Network Error') || errorMessage.includes('ENOTFOUND')) {
    message = 'Please check your internet connection and try again.';
  } else if (errorMessage.includes('timeout')) {
    message = 'The request timed out. Please try again.';
  } else if (errorMessage.includes('ECONNREFUSED')) {
    title = 'Server Unavailable';
    message = 'Could not connect to the server. Please try again later.';
  }

  const buttons = [];
  
  if (retryCallback) {
    buttons.push({ text: 'Retry', onPress: retryCallback });
  }
  
  buttons.push({ text: 'OK', style: 'cancel' });

  Alert.alert(title, message, buttons);
};

/**
 * Check if error is a network error
 * @param {Error} error - The error to check
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  return (
    errorString.includes('network') ||
    errorString.includes('enotfound') ||
    errorString.includes('econnrefused') ||
    errorString.includes('timeout') ||
    errorString.includes('connection')
  );
};

/**
 * Gracefully handle API errors
 * @param {Error} error - The error object
 * @param {string} context - Context of where the error occurred
 * @param {boolean} silent - If true, don't show alert to user
 * @returns {null} Returns null for safe error handling
 */
export const handleApiError = (error, context = 'API call', silent = false) => {
  console.error(`❌ [${context}] Error:`, error);

  if (!silent && isNetworkError(error)) {
    Alert.alert(
      'Connection Issue',
      `Unable to complete ${context}.\n\nPlease check your internet connection.`,
      [{ text: 'OK' }]
    );
  } else if (!silent) {
    console.warn(`⚠️ [${context}] Non-network error, handling silently`);
  }

  return null;
};

/**
 * Exponential backoff retry utility
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Result of function or throws error
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`🔄 [Retry] Attempt ${i + 1}/${maxRetries} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error; // Last attempt failed, throw error
      }
      
      // Wait with exponential backoff
      const waitTime = delay * Math.pow(2, i);
      console.log(`⏳ [Retry] Waiting ${waitTime}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

export default {
  handleConnectivityError,
  isNetworkError,
  handleApiError,
  retryWithBackoff,
};


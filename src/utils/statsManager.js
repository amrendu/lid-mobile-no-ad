/**
 * Stats Manager - Centralized manager for app statistics
 * 
 * This module provides methods to update and retrieve stats across the app.
 * It uses a simple event system to notify components when stats change.
 */

import { getItem, setItem } from './storage';

// Keys for storage
const BOOKMARKS_KEY = 'bookmarked_questions_v2';
const INCORRECT_KEY = 'incorrect_questions_v2';
const CORRECT_KEY = 'correct_questions_v2';

// Event listeners for stats changes
const listeners = [];

// Current stats cache
let statsCache = {
  bookmarkedCount: 0,
  incorrectCount: 0,
  correctCount: 0,
  lastUpdated: Date.now()
};

/**
 * Refresh stats from storage
 */
export const refreshStats = async () => {
  try {
    const bookmarked = await getItem(BOOKMARKS_KEY, []);
    const incorrect = await getItem(INCORRECT_KEY, []);
    const correct = await getItem(CORRECT_KEY, []);

    statsCache = {
      bookmarkedCount: bookmarked?.length || 0,
      incorrectCount: incorrect?.length || 0,
      correctCount: correct?.length || 0,
      lastUpdated: Date.now()
    };

    // Notify all listeners
    notifyListeners();

    return statsCache;
  } catch (error) {
    console.error('Error refreshing stats:', error);
    return statsCache;
  }
};

/**
 * Get the current stats (from cache)
 */
export const getStats = () => {
  return { ...statsCache };
};

/**
 * Subscribe to stats changes
 * @param {Function} callback Function to call when stats change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToStats = (callback) => {
  listeners.push(callback);

  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Update bookmarks and refresh stats
 * @param {string[]} bookmarkIds New array of bookmark IDs
 */
export const updateBookmarks = async (bookmarkIds) => {
  try {
    // Save the updated bookmarks
    await setItem(BOOKMARKS_KEY, bookmarkIds);

    // Update the stats cache
    statsCache.bookmarkedCount = bookmarkIds.length;
    statsCache.lastUpdated = Date.now();

    // Notify listeners of the change
    notifyListeners();

    return statsCache;
  } catch (error) {
    console.error('Error updating bookmarks:', error);
    return statsCache;
  }
};

/**
 * Save a correct answer
 * @param {string} questionId The ID of the correctly answered question
 */
export const saveCorrectAnswer = async (questionId) => {
  try {
    const correctIds = await getItem(CORRECT_KEY, []);
    
    // Only add if not already in the list
    if (!correctIds.includes(questionId)) {
      const updatedIds = [...correctIds, questionId];
      await setItem(CORRECT_KEY, updatedIds);
      
      // Update the stats cache
      statsCache.correctCount = updatedIds.length;
      statsCache.lastUpdated = Date.now();
      
      // Notify listeners of the change
      notifyListeners();
    }
    
    return statsCache;
  } catch (error) {
    console.error('Error saving correct answer:', error);
    return statsCache;
  }
};

/**
 * Notify all listeners of stats changes
 */
const notifyListeners = () => {
  listeners.forEach(listener => {
    try {
      listener(statsCache);
    } catch (error) {
      console.error('Error in stats listener:', error);
    }
  });
};

/**
 * Reset all app data and stats
 */
export const resetAllData = async () => {
  try {
    const { clearAllAppData } = require('./storage');
    await clearAllAppData();
    
    // Reset stats cache
    statsCache = {
      bookmarkedCount: 0,
      incorrectCount: 0,
      correctCount: 0,
      lastUpdated: Date.now()
    };
    
    // Notify all listeners
    notifyListeners();
    
    console.log('All app data and stats reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting app data:', error);
    return false;
  }
};

// Initialize stats on module load
refreshStats();

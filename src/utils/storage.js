import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItem = async (key, fallback = null) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value != null ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error('Error getting item from storage:', error);
    return fallback;
  }
};

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting item in storage:', error);
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item from storage:', error);
  }
};

// Clear all app data - useful for debugging/reset
export const clearAllAppData = async () => {
  try {
    const keys = [
      'bookmarked_questions_v2',
      'incorrect_questions_v2', 
      'correct_questions_v2',
      'answered_questions_v2',
      'selected_state_v1',
      // Add any other storage keys your app uses
    ];
    
    await AsyncStorage.multiRemove(keys);
    console.log('All app data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    return false;
  }
};

// Get all storage keys (for debugging)
export const getAllStorageKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('All storage keys:', keys);
    return keys;
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
};

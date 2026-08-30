/**
 * LocalStorage management with safe parsing and defaults
 */

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(`uniquest_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(`uniquest_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing localStorage key "${key}":`, e);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(`uniquest_${key}`);
    } catch (e) {
      console.error(`Error removing localStorage key "${key}":`, e);
    }
  },

  clear: () => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('uniquest_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }
};

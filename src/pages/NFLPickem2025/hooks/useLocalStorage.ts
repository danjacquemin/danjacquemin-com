import { useState } from 'react';

// localStorage persistence
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  // initialize state from localStorage, fallback to defaultValue
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      // warn if localStorage is unavailable or JSON is invalid
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // setter updates both state and localStorage
  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue];
}

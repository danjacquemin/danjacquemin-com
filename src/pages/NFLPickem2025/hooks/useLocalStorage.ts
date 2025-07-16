import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    // save to localStorage whenever value changes
    localStorage.setItem(key, JSON.stringify(value));

    // listen for storage events (e.g., changes from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // cleanup
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, value]);

  // rehydrate on mount or when key changes
  const rehydrate = useCallback(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      setValue(JSON.parse(storedValue));
    }
  }, [key]);

  // optional: Call rehydrate on mount if needed
  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  return [value, setValue, rehydrate] as const;
}

export default useLocalStorage;

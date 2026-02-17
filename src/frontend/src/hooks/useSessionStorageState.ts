import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing state that persists in sessionStorage
 * @param key Storage key
 * @param initialValue Initial value if nothing in storage
 * @returns [value, setValue] tuple similar to useState
 */
export function useSessionStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Initialize state from sessionStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update sessionStorage when state changes
  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

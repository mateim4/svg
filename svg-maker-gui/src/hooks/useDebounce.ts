import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by a specified delay
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Advanced debounced search hook with immediate display but delayed filtering
 * @param initialValue Initial search value
 * @param delay Debounce delay in milliseconds (default: 300ms)
 * @returns Object with displayValue (immediate), searchValue (debounced), and setter
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const debouncedValue = useDebounce(displayValue, delay);

  return {
    displayValue, // For immediate UI updates
    searchValue: debouncedValue, // For actual filtering
    setDisplayValue, // Function to update the display value
  };
}
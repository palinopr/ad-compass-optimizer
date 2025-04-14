
import { useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

export const useFetchState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const mountedRef = useRef(true);
  const cooldownTimeRef = useRef(5000); // Default cooldown of 5 seconds

  const startFetch = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(true);
    }
    isFetchingRef.current = true;
    lastFetchTimeRef.current = Date.now();
  }, []);

  const endFetch = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false);
    }
    isFetchingRef.current = false;
  }, []);

  const canFetch = useCallback((forceRefresh = false) => {
    if (isFetchingRef.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping this request');
      return false;
    }

    const now = Date.now();
    // Use dynamic cooldown time that increases if rate limits are hit
    const minWaitTime = cooldownTimeRef.current;
    
    if (now - lastFetchTimeRef.current < minWaitTime && !forceRefresh) {
      console.log(`Throttling fetch request - too soon after last fetch (${minWaitTime}ms cooldown)`);
      return false;
    }

    return true;
  }, []);

  // Create debounced versions of key functions
  const debouncedStartFetch = debounce(startFetch, 300);
  
  // Function to increase cooldown time when rate limits are hit
  const increaseCooldown = useCallback(() => {
    // Double the cooldown time when rate limit issues occur, up to 60 seconds
    cooldownTimeRef.current = Math.min(cooldownTimeRef.current * 2, 60000);
    console.log(`Increased fetch cooldown to ${cooldownTimeRef.current}ms due to potential rate limiting`);
  }, []);

  return {
    isLoading,
    isFetchingRef,
    lastFetchTimeRef,
    mountedRef,
    cooldownTimeRef,
    startFetch,
    debouncedStartFetch,
    endFetch,
    canFetch,
    increaseCooldown
  };
};

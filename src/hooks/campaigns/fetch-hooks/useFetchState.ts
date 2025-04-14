
import { useState, useRef } from 'react';

export const useFetchState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const mountedRef = useRef(true);

  const startFetch = () => {
    if (mountedRef.current) {
      setIsLoading(true);
    }
    isFetchingRef.current = true;
    lastFetchTimeRef.current = Date.now();
  };

  const endFetch = () => {
    if (mountedRef.current) {
      setIsLoading(false);
    }
    isFetchingRef.current = false;
  };

  const canFetch = (forceRefresh = false) => {
    if (isFetchingRef.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping this request');
      return false;
    }

    const now = Date.now();
    if (now - lastFetchTimeRef.current < 5000 && !forceRefresh) {
      console.log('Throttling fetch campaigns request - too soon after last fetch');
      return false;
    }

    return true;
  };

  return {
    isLoading,
    isFetchingRef,
    lastFetchTimeRef,
    mountedRef,
    startFetch,
    endFetch,
    canFetch
  };
};

import { useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { toast } from '@/hooks/use-toast';

export const useFetchState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const mountedRef = useRef(true);
  const cooldownTimeRef = useRef(5000);

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
    const minWaitTime = cooldownTimeRef.current;
    
    if (now - lastFetchTimeRef.current < minWaitTime && !forceRefresh) {
      console.log(`Throttling fetch request - too soon after last fetch (${minWaitTime}ms cooldown)`);
      return false;
    }

    return true;
  }, []);

  const handleFetchSuccess = useCallback(() => {
    setConsecutiveFailures(0);
    endFetch();
  }, [endFetch]);

  const handleFetchFailure = useCallback(() => {
    setConsecutiveFailures(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        toast({
          title: "⚠️ Multiple Fetch Failures",
          description: "Campaigns failed to load 3 times in a row. Try refreshing your connection or switching ad accounts.",
          variant: "destructive",
          duration: 10000,
        });
      }
      return newCount;
    });
    endFetch();
  }, [endFetch]);

  const debouncedStartFetch = debounce(startFetch, 300);
  
  const increaseCooldown = useCallback(() => {
    cooldownTimeRef.current = Math.min(cooldownTimeRef.current * 2, 60000);
    console.log(`Increased fetch cooldown to ${cooldownTimeRef.current}ms due to potential rate limiting`);
  }, []);

  return {
    isLoading,
    isFetchingRef,
    lastFetchTimeRef,
    mountedRef,
    cooldownTimeRef,
    consecutiveFailures,
    startFetch,
    debouncedStartFetch,
    endFetch,
    canFetch,
    increaseCooldown,
    handleFetchSuccess,
    handleFetchFailure
  };
};


import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export function useFetchState() {
  const [isLoading, setIsLoading] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [cooldownMinutes, setCooldownMinutes] = useState(1);
  const mountedRef = { current: true };

  const startFetch = useCallback(() => {
    setIsLoading(true);
  }, []);

  const debouncedStartFetch = useCallback(() => {
    setTimeout(() => startFetch(), 100);
  }, [startFetch]);

  const endFetch = useCallback(() => {
    setIsLoading(false);
  }, []);

  const canFetch = useCallback(() => {
    return !isLoading;
  }, [isLoading]);

  const increaseCooldown = useCallback(() => {
    setCooldownMinutes(prev => Math.min(prev * 2, 30));
    toast({
      title: "Rate Limit Protection",
      description: "Increasing cooldown period to prevent rate limiting.",
      variant: "default"
    });
  }, []);

  const handleFetchSuccess = useCallback((isMockData: boolean = false) => {
    setConsecutiveFailures(0);
    setCooldownMinutes(1);
    
    if (!isMockData) {
      toast({
        title: "Campaigns Updated",
        description: "Successfully fetched latest campaign data.",
        variant: "default"
      });
    }
  }, []);

  const handleFetchFailure = useCallback(() => {
    setConsecutiveFailures(prev => prev + 1);
  }, []);

  return {
    isLoading,
    startFetch,
    debouncedStartFetch,
    endFetch,
    canFetch,
    mountedRef,
    increaseCooldown,
    handleFetchSuccess,
    handleFetchFailure,
    consecutiveFailures
  };
}

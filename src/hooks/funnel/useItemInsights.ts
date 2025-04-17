
import { useCallback, useRef, useEffect } from 'react';
import { useInsightsState } from './hooks/useInsightsState';
import { useFetchInsights } from './hooks/useFetchInsights';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';
import { insightsQueueState, insightsThrottlingState } from '../campaigns/fetch-utils/insights/batchConfig';
import { RequestThrottlingService } from '@/services/api/insights/throttling/services/RequestThrottlingService';

// Create a global set to track which components have attempted fetches
const globalFetchAttempts = new Set<string>();

export const useItemInsights = () => {
  const { insights, setInsights, isLoading, setIsLoading, error, setError } = useInsightsState();
  const { fetchInsights } = useFetchInsights();
  const hasFetchedRef = useRef(false);
  const fetchAttemptedRef = useRef(false);
  const componentId = useRef(`item-insights-${Math.random().toString(36).substr(2, 9)}`);
  
  // Track when component unmounts to prevent state updates
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchItemInsights = useCallback(async (
    itemId: string, 
    itemType: 'campaign' | 'adset',
    datePreset: string = 'maximum'
  ) => {
    // Generate a unique signature for this exact request
    const requestKey = `${itemType}-${itemId}-${datePreset}`;
    
    // Check if a fetch has already been attempted globally
    if (globalFetchAttempts.has(requestKey)) {
      console.log(`⚠️ [INSIGHTS] Fetch already attempted globally for ${requestKey}`);
      return;
    }
    
    // Record attempt
    if (fetchAttemptedRef.current) {
      console.log(`⚠️ [INSIGHTS] Fetch already attempted for this component instance`);
      return;
    }
    
    fetchAttemptedRef.current = true;
    globalFetchAttempts.add(requestKey);
    
    // Early returns for various conditions
    if (RequestThrottlingService.isProcessing()) {
      console.log(`⚠️ [INSIGHTS] Queue is already processing requests`);
      return;
    }
    
    if (insightsThrottlingState.isActiveThrottling()) {
      console.log(`⚠️ [INSIGHTS] Global throttling active`);
      return;
    }
    
    if (insightsQueueState.isActiveLock()) {
      console.log(`⚠️ [INSIGHTS] Queue is locked`);
      return;
    }
    
    if (isLoading) {
      console.log(`⚠️ [INSIGHTS] Already loading`);
      return;
    }

    // Don't update state if component unmounted
    if (!isMountedRef.current) {
      console.log(`⚠️ [INSIGHTS] Component unmounted, skipping state updates`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await RequestThrottlingService.throttleRequest(
        () => fetchInsights(itemId, itemType, datePreset),
        `${itemType}-${itemId}-${componentId.current}`
      );
      
      // Don't update state if component unmounted during fetch
      if (!isMountedRef.current) {
        console.log(`⚠️ [INSIGHTS] Component unmounted during fetch, skipping updates`);
        return;
      }

      if (!data?.campaigns?.[0]?.insights) {
        setError('No insights data available');
        return;
      }

      setInsights(data.campaigns[0].insights);
    } catch (err: any) {
      // Only update error state if still mounted
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch insights');
      }
    } finally {
      // Only update loading state if still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchInsights, setError, setInsights, setIsLoading, isLoading]);

  return {
    insights,
    isLoading,
    error,
    fetchInsights: fetchItemInsights
  };
};

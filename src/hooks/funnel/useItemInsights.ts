
import { useCallback, useRef, useEffect } from 'react';
import { useInsightsState } from './hooks/useInsightsState';
import { useFetchInsights } from './hooks/useFetchInsights';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';
import { insightsQueueState, insightsThrottlingState } from '../campaigns/fetch-utils/insights/batchConfig';
import { RequestThrottlingService } from '@/services/api/insights/throttling/services/RequestThrottlingService';

// Create a global set to track which components have attempted fetches
// This prevents fetch storms from multiple component mounts
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
      console.log(`🔷 [INSIGHTS] Component unmounted: ${componentId.current}`);
    };
  }, []);

  const fetchItemInsights = useCallback(async (
    itemId: string, 
    itemType: 'campaign' | 'adset',
    datePreset: string = 'maximum'
  ) => {
    // Generate a unique signature for this exact request to prevent duplicates
    const requestKey = `${itemType}-${itemId}-${datePreset}`;
    
    // CRITICAL: Check if a fetch has already been attempted from ANY instance of this component
    // This prevents fetch storms when multiple components mount at the same time
    if (globalFetchAttempts.has(requestKey)) {
      console.log(`⚠️ [INSIGHTS] Fetch already attempted globally for ${requestKey}, skipping duplicate`);
      return;
    }
    
    // Record that we've attempted a fetch to prevent duplicate attempts from THIS component instance
    if (fetchAttemptedRef.current) {
      console.log(`⚠️ [INSIGHTS] Fetch already attempted for this ${itemType} component instance, skipping duplicate calls`);
      return;
    }
    
    // Mark this component instance as having attempted a fetch
    fetchAttemptedRef.current = true;
    // Also mark globally
    globalFetchAttempts.add(requestKey);
    console.log(`📝 [INSIGHTS] Adding ${requestKey} to global fetch attempts`);
    
    // CRITICAL: Check if queue is already processing - prevents additional queue starts
    if (RequestThrottlingService.isProcessing()) {
      console.log(`⚠️ [INSIGHTS] StrictQueueManager is already processing requests, queueing request: ${requestKey}`);
    }
    
    // Early return if global throttling is active
    if (insightsThrottlingState.isActiveThrottling()) {
      console.log(`⚠️ [INSIGHTS] Skipping insights fetch: global throttling active`);
      return;
    }
    
    // Early return if queue is locked
    if (insightsQueueState.isActiveLock()) {
      console.log(`⚠️ [INSIGHTS] Skipping insights fetch: global queue is locked`);
      return;
    }
    
    // Early return if already loading
    if (isLoading) {
      console.log(`⚠️ Insights fetch already in progress for ${itemType}, skipping`);
      return;
    }
    
    // Check if we've already fetched in this component lifecycle
    if (hasFetchedRef.current && itemType === 'campaign') {
      console.log(`⚠️ Insights already fetched for this ${itemType} component instance, skipping duplicate fetch`);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    // Validate item ID - strict validation and early return
    if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
      console.warn(`⚠️ Skipping insights fetch for ${itemType}: Invalid ID`);
      if (isMountedRef.current) {
        setError('Invalid item ID');
        setIsLoading(false);
      }
      return;
    }

    // Check if this item has already failed
    const requestSignature = DuplicateRequestChecker.generateRequestSignature(
      itemId,
      `insights-${itemType}`,
      { datePreset }
    );
    
    if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
      console.log(`⚠️ Skipping insights fetch for ${itemType} ${itemId}: 400 error or missing data.`);
      if (isMountedRef.current) {
        setError('This item cannot be fetched due to previous API errors');
        setIsLoading(false);
      }
      return;
    }

    try {
      console.log(`🟢 [FETCH START] ${itemType} ID: ${itemId}`);
      const data = await RequestThrottlingService.throttleRequest(
        () => fetchInsights(itemId, itemType, datePreset),
        `${itemType}-${itemId}-${componentId.current}`
      );
      console.log(`✅ [FETCH SUCCESS] ${itemType} ID: ${itemId}`);
      
      // Don't update state if component unmounted
      if (!isMountedRef.current) {
        console.log(`⚠️ [INSIGHTS] Component unmounted during fetch, skipping state updates for ${itemId}`);
        return;
      }
      
      // Mark as fetched for this component lifecycle
      hasFetchedRef.current = true;
      
      // Early return on null data
      if (!data) {
        console.log(`⚠️ No data returned from insights fetch for ${itemType} ${itemId}`);
        setError('No insights data available');
        setIsLoading(false);
        return;
      }
      
      if (!data.campaigns || data.campaigns.length === 0) {
        setError('No insights data available');
        setIsLoading(false);
        return;
      }

      setInsights(data.campaigns[0].insights);
    } catch (err) {
      console.error(`❌ [FETCH FAIL] ${itemType} ID: ${itemId}:`, err.message);
      
      // Don't update state if component unmounted
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch insights');
      }

      // If it's a 400 error, mark it as permanently failed
      if (err.status === 400 || (err.response && err.response.status === 400)) {
        const errorSignature = DuplicateRequestChecker.generateRequestSignature(
          itemId,
          `insights-${itemType}-error`,
          { datePreset }
        );
        
        DuplicateRequestChecker.markAsPermanentlyFailed(errorSignature);
        console.log(`⚠️ Skipping insights fetch for ${itemType} ${itemId}: 400 error or missing data.`);
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


import { useCallback, useRef } from 'react';
import { useInsightsState } from './hooks/useInsightsState';
import { useFetchInsights } from './hooks/useFetchInsights';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';
import { insightsQueueState, insightsThrottlingState } from '../campaigns/fetch-utils/insights/batchConfig';

export const useItemInsights = () => {
  const { insights, setInsights, isLoading, setIsLoading, error, setError } = useInsightsState();
  const { fetchInsights } = useFetchInsights();
  const hasFetchedRef = useRef(false);
  const fetchAttemptedRef = useRef(false);

  const fetchItemInsights = useCallback(async (
    itemId: string, 
    itemType: 'campaign' | 'adset',
    datePreset: string = 'maximum'
  ) => {
    // Record that we've attempted a fetch to prevent duplicate attempts
    if (fetchAttemptedRef.current) {
      console.log(`⚠️ [INSIGHTS] Fetch already attempted for this ${itemType} component instance, skipping duplicate calls`);
      return;
    }
    
    // Mark this component instance as having attempted a fetch
    fetchAttemptedRef.current = true;
    
    // Early return if global throttling is active
    if (insightsThrottlingState.isActiveThrottling()) {
      console.log(`⚠️ [INSIGHTS] Skipping insights fetch: global throttling active`);
      return;
    }
    
    // Early return if queue is locked
    if (insightsQueueState.isActiveLock()) {
      console.log(`⚠️ Insights fetch skipped: global queue is locked`);
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
      setError('Invalid item ID');
      setIsLoading(false);
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
      setError('This item cannot be fetched due to previous API errors');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`🟢 [FETCH START] ${itemType} ID: ${itemId}`);
      const data = await fetchInsights(itemId, itemType, datePreset);
      console.log(`✅ [FETCH SUCCESS] ${itemType} ID: ${itemId}`);
      
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
    } catch (err: any) {
      console.error(`❌ [FETCH FAIL] ${itemType} ID: ${itemId}:`, err.message);
      setError(err.message || 'Failed to fetch insights');

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
      setIsLoading(false);
    }
  }, [fetchInsights, setError, setInsights, setIsLoading, isLoading]);

  return {
    insights,
    isLoading,
    error,
    fetchInsights: fetchItemInsights
  };
};


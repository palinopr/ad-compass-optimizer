
import { useCallback } from 'react';
import { useInsightsState } from './hooks/useInsightsState';
import { useFetchInsights } from './hooks/useFetchInsights';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';

export const useItemInsights = () => {
  const { insights, setInsights, isLoading, setIsLoading, error, setError } = useInsightsState();
  const { fetchInsights } = useFetchInsights();

  const fetchItemInsights = useCallback(async (
    itemId: string, 
    itemType: 'campaign' | 'adset',
    datePreset: string = 'maximum'
  ) => {
    // Early return if already loading
    if (isLoading) {
      console.log(`⚠️ Insights fetch already in progress for ${itemType}, skipping`);
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
      const data = await fetchInsights(itemId, itemType, datePreset);
      
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
      console.error('Error fetching insights:', err);
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

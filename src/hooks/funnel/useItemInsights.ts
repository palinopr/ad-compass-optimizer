
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
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchInsights(itemId, itemType, datePreset);
      
      if (!data || !data.campaigns || data.campaigns.length === 0) {
        setError('No insights data available');
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
        console.log(`[INSIGHTS HOOK] Marked failed request due to catch block: ${errorSignature}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchInsights, setError, setInsights, setIsLoading]);

  return {
    insights,
    isLoading,
    error,
    fetchInsights: fetchItemInsights
  };
};

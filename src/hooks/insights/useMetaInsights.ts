
import { useState, useCallback, useEffect } from 'react';
import { MetaInsightsService, InsightFilterOptions, InsightsResponse } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { useRateLimitStatus } from './useRateLimitStatus';
import { useErrorHandling } from './useErrorHandling';
import { useInsightsFetching } from './useInsightsFetching';
import { toast } from '@/hooks/use-toast';

export function useMetaInsights() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { rateLimitStatus, updateRateLimitStatus, clearRateLimit } = useRateLimitStatus();
  const { error, setError, handleError, resetErrorState } = useErrorHandling();
  const { insights: fetchedInsights, isLoading: isFetchLoading, error: fetchError, handleInsightsFetch } = useInsightsFetching();
  
  // Update local state when fetched insights change
  useEffect(() => {
    if (fetchedInsights) {
      setInsights(fetchedInsights);
    }
  }, [fetchedInsights]);
  
  // Combine loading states
  useEffect(() => {
    setIsLoading(isFetchLoading);
  }, [isFetchLoading]);
  
  // Combine error states
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError, setError]);

  const fetchPageInsights = useCallback(async (pageId: string, options: InsightFilterOptions = {}) => {
    try {
      resetErrorState();
      setIsLoading(true);
      
      // First check if we're rate limited
      updateRateLimitStatus();
      
      if (rateLimitStatus.isRateLimited) {
        const errorMsg = `Meta API rate limit reached. Please wait approximately ${Math.ceil((rateLimitStatus.timeRemaining || 0) / 60000)} more minutes.`;
        setError(errorMsg);
        
        toast({
          title: "Rate Limited",
          description: errorMsg,
          variant: "destructive",
        });
        
        return null;
      }
      
      const token = metaAuthService.getAccessToken();
      if (!token) {
        setError('Not authenticated with Meta. Please connect your account.');
        return null;
      }
      
      const result = await handleInsightsFetch(
        MetaInsightsService.fetchInsights,
        pageId, 
        options
      );
      
      // Force a display refresh to fix rendering issues
      window.dispatchEvent(new CustomEvent('insights-display-refresh'));
      
      return result;
    } catch (err: any) {
      handleError(err, rateLimitStatus);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleInsightsFetch, rateLimitStatus, updateRateLimitStatus, handleError, resetErrorState, setError]);
  
  const fetchAdAccountInsights = useCallback(async (adAccountId: string, options: InsightFilterOptions = {}) => {
    try {
      resetErrorState();
      setIsLoading(true);
      
      updateRateLimitStatus();
      
      if (rateLimitStatus.isRateLimited) {
        const errorMsg = `Meta API rate limit reached. Please wait approximately ${Math.ceil((rateLimitStatus.timeRemaining || 0) / 60000)} more minutes.`;
        setError(errorMsg);
        
        toast({
          title: "Rate Limited",
          description: errorMsg,
          variant: "destructive",
        });
        
        return null;
      }
      
      const token = metaAuthService.getAccessToken();
      if (!token) {
        setError('Not authenticated with Meta. Please connect your account.');
        return null;
      }
      
      const result = await handleInsightsFetch(
        MetaInsightsService.fetchAccountInsights,
        adAccountId, 
        options
      );
      
      // Force a display refresh to fix rendering issues
      window.dispatchEvent(new CustomEvent('insights-display-refresh'));
      
      return result;
    } catch (err: any) {
      handleError(err, rateLimitStatus);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleInsightsFetch, rateLimitStatus, updateRateLimitStatus, handleError, resetErrorState, setError]);

  return {
    insights,
    isLoading,
    error,
    fetchPageInsights,
    fetchAdAccountInsights,
    clearRateLimit,
    rateLimitStatus
  };
}

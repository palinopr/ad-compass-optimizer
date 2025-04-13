
import { useState, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaInsightsService, InsightFilterOptions, InsightsResponse } from '@/services/api/MetaInsightsService';
import { toast } from '@/hooks/use-toast';
import { checkRateLimitStatus, notifyRateLimit } from '@/hooks/campaigns/fetch-utils/rateLimit';

interface UseMetaInsightsReturn {
  insights: InsightsResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchInsights: (objectId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchCampaignInsights: (campaignId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAccountInsights: (accountId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAdSetInsights: (adSetId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAdInsights: (adId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
}

export function useMetaInsights(): UseMetaInsightsReturn {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleInsightsFetch = useCallback(async (
    fetchFunction: (token: string, id: string, options: InsightFilterOptions) => Promise<InsightsResponse>,
    id: string, 
    options: InsightFilterOptions = {}
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we're rate limited
      const rateStatus = checkRateLimitStatus();
      if (rateStatus.isRateLimited) {
        notifyRateLimit(rateStatus.timeRemaining || undefined);
        setError(`Meta API rate limit reached. Please wait approximately ${rateStatus.timeRemaining} more minutes.`);
        setIsLoading(false);
        return null;
      }
      
      // Get the token
      const token = metaAuthService.getAccessToken();
      if (!token) {
        setError('Not authenticated with Meta. Please connect your account.');
        setIsLoading(false);
        return null;
      }
      
      // Execute the fetch function
      const result = await fetchFunction(token, id, options);
      setInsights(result);
      return result;
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      const errorMessage = err.message || 'An error occurred while fetching insights data';
      setError(errorMessage);
      
      // Show toast notification for errors
      toast({
        title: "Error Fetching Insights",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchInsights = useCallback((objectId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaInsightsService.fetchInsights, objectId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchCampaignInsights = useCallback((campaignId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaInsightsService.fetchCampaignInsights, campaignId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchAccountInsights = useCallback((accountId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaInsightsService.fetchAccountInsights, accountId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchAdSetInsights = useCallback((adSetId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaInsightsService.fetchAdSetInsights, adSetId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchAdInsights = useCallback((adId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaInsightsService.fetchAdInsights, adId, options || {});
  }, [handleInsightsFetch]);
  
  return {
    insights,
    isLoading,
    error,
    fetchInsights,
    fetchCampaignInsights,
    fetchAccountInsights,
    fetchAdSetInsights,
    fetchAdInsights
  };
}


import { useState, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { InsightFilterOptions, InsightsResponse } from '@/services/api/MetaInsightsService';
import { toast } from '@/hooks/use-toast';

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
      if (MetaApiService.isRateLimited()) {
        const remainingTime = MetaApiService.getRateLimitTimeRemaining();
        const errorMsg = `Meta API rate limit reached. Please wait approximately ${Math.ceil((remainingTime || 0) / 60)} more minutes.`;
        setError(errorMsg);
        setIsLoading(false);
        
        toast({
          title: "API Rate Limited",
          description: errorMsg,
          variant: "destructive",
        });
        
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
      let errorMessage = err.message || 'An error occurred while fetching insights data';
      
      // Check for rate limit error
      if (errorMessage.includes('request limit reached') || err.code === 17) {
        errorMessage = 'Meta API rate limit reached. Your request has been queued and will be processed when the rate limit expires.';
      }
      
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
    return handleInsightsFetch(MetaApiService.fetchInsights, objectId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchCampaignInsights = useCallback((campaignId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaApiService.fetchCampaignInsights, campaignId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchAccountInsights = useCallback((accountId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaApiService.fetchAccountInsights, accountId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchAdSetInsights = useCallback((adSetId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(
      (token, id, opts) => MetaApiService.fetchInsights(token, id, { ...opts, level: 'adset' }), 
      adSetId,
      options || {}
    );
  }, [handleInsightsFetch]);
  
  const fetchAdInsights = useCallback((adId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(
      (token, id, opts) => MetaApiService.fetchInsights(token, id, { ...opts, level: 'ad' }), 
      adId,
      options || {}
    );
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

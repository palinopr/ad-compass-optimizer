import { useState, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { InsightFilterOptions, InsightsResponse } from '@/services/api/MetaInsightsService';
import { toast } from '@/hooks/use-toast';

interface UseMetaInsightsReturn {
  insights: InsightsResponse | null;
  isLoading: boolean;
  error: string | null;
  rateLimitStatus: {
    isRateLimited: boolean;
    limitType?: string;
    timeRemaining?: number | null;
  };
  fetchInsights: (objectId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchCampaignInsights: (campaignId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAccountInsights: (accountId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAdSetInsights: (adSetId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAdInsights: (adId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  clearRateLimit: () => void;
  resetErrorState: () => void;
}

export function useMetaInsights(): UseMetaInsightsReturn {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState({
    isRateLimited: MetaApiService.isRateLimited(),
    limitType: MetaApiService.getRateLimitInfo().limitType,
    timeRemaining: MetaApiService.getRateLimitTimeRemaining()
  });
  
  const updateRateLimitStatus = useCallback(() => {
    const rateLimitInfo = MetaApiService.getRateLimitInfo();
    setRateLimitStatus({
      isRateLimited: MetaApiService.isRateLimited(),
      limitType: rateLimitInfo.limitType,
      timeRemaining: MetaApiService.getRateLimitTimeRemaining()
    });
  }, []);
  
  const resetErrorState = useCallback(() => {
    setError(null);
    setRateLimitStatus(prev => ({
      ...prev,
      isRateLimited: false,
      limitType: undefined,
      timeRemaining: null
    }));
  }, []);

  const handleInsightsFetch = useCallback(async (
    fetchFunction: (token: string, id: string, options: InsightFilterOptions) => Promise<InsightsResponse>,
    id: string, 
    options: InsightFilterOptions = {}
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      updateRateLimitStatus();
      
      if (MetaApiService.isRateLimited() && !MetaApiService.isRateLimitOverridden()) {
        const rateLimitInfo = MetaApiService.getRateLimitInfo();
        const remainingTime = MetaApiService.getRateLimitTimeRemaining();
        const limitTypeText = rateLimitInfo.limitType === 'app' ? 'Application' : 
                             rateLimitInfo.limitType === 'user' ? 'User' :
                             rateLimitInfo.limitType === 'adaccount' ? 'Ad Account' : 'API';
        
        const errorMsg = `Meta ${limitTypeText} rate limit reached. Please wait approximately ${Math.ceil((remainingTime || 0) / 60)} more minutes.`;
        setError(errorMsg);
        setIsLoading(false);
        
        toast({
          title: `${limitTypeText} Rate Limited`,
          description: errorMsg,
          variant: "destructive",
        });
        
        return null;
      }
      
      const token = metaAuthService.getAccessToken();
      if (!token) {
        setError('Not authenticated with Meta. Please connect your account.');
        setIsLoading(false);
        return null;
      }
      
      const result = await fetchFunction(token, id, options);
      setInsights(result);
      
      updateRateLimitStatus();
      
      return result;
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      let errorMessage = err.message || 'An error occurred while fetching insights data';
      
      const isRateLimitError = errorMessage.includes('rate limit') || 
                             errorMessage.includes('request limit') || 
                             err.code === 17 || err.code === 4;
      
      if (isRateLimitError) {
        updateRateLimitStatus();
        
        const rateLimitInfo = MetaApiService.getRateLimitInfo();
        const limitTypeText = rateLimitInfo.limitType === 'app' ? 'Application' : 
                            rateLimitInfo.limitType === 'user' ? 'User' :
                            rateLimitInfo.limitType === 'adaccount' ? 'Ad Account' : 'API';
                             
        errorMessage = `Meta ${limitTypeText} rate limit reached. Your request has been queued and will be processed when the rate limit expires.`;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error Fetching Insights",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [updateRateLimitStatus]);
  
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
  
  const clearRateLimit = useCallback(() => {
    MetaApiService.clearRateLimit();
    updateRateLimitStatus();
    resetErrorState();
  }, [updateRateLimitStatus, resetErrorState]);
  
  return {
    insights,
    isLoading,
    error,
    rateLimitStatus,
    fetchInsights,
    fetchCampaignInsights,
    fetchAccountInsights,
    fetchAdSetInsights,
    fetchAdInsights,
    clearRateLimit,
    resetErrorState
  };
}

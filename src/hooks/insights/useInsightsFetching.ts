
import { useState, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { InsightFilterOptions, InsightsResponse } from '@/services/api/MetaInsightsService';
import { useRateLimitStatus } from './useRateLimitStatus';
import { useErrorHandling } from './useErrorHandling';
import { toast } from '@/hooks/use-toast';

export function useInsightsFetching() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { rateLimitStatus, updateRateLimitStatus } = useRateLimitStatus();
  const { error, setError, handleError, resetErrorState } = useErrorHandling();
  
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
      updateRateLimitStatus();
      handleError(err, rateLimitStatus);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [updateRateLimitStatus, rateLimitStatus, setError, handleError]);
  
  return {
    insights,
    isLoading,
    error,
    handleInsightsFetch,
    resetErrorState
  };
}

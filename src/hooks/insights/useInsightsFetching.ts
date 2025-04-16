
import { useState, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { InsightFilterOptions, InsightsResponse } from '@/services/api/MetaInsightsService';
import { useRateLimitStatus } from './useRateLimitStatus';
import { useErrorHandling } from './useErrorHandling';
import { toast } from '@/hooks/use-toast';
import { isValidMetaDatePreset, mapToValidDatePreset, ValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

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
    
    // First validate date preset
    let validatedOptions = { ...options };
    
    if (options.datePreset) {
      // Use type assertion to ensure the returned value matches the expected type
      const validDatePreset = mapToValidDatePreset(options.datePreset) as ValidMetaDatePreset;
      
      if (validDatePreset !== options.datePreset) {
        console.log(`[INSIGHTS FETCHING] Converting invalid preset "${options.datePreset}" to "${validDatePreset}"`);
        validatedOptions.datePreset = validDatePreset;
      }
      
      if (options.timeRange) {
        console.warn('[INSIGHTS FETCHING] Both datePreset and timeRange specified, removing timeRange');
        validatedOptions.timeRange = undefined;
      }
    }
    
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
      
      const result = await fetchFunction(token, id, validatedOptions);
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

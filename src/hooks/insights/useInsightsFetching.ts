
import { useState, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { InsightFilterOptions, InsightsResponse } from '@/services/api/insights/types';
import { useRateLimitStatus } from './useRateLimitStatus';
import { useErrorHandling } from './useErrorHandling';
import { toast } from '@/hooks/use-toast';
import { isValidMetaDatePreset, mapToValidDatePreset, ValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';
import { CampaignBlockingService } from '@/services/api/insights/core/CampaignBlockingService';

export function useInsightsFetching() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { rateLimitStatus, updateRateLimitStatus } = useRateLimitStatus();
  const { error, setError, handleError, resetErrorState } = useErrorHandling();
  const BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';
  
  const handleInsightsFetch = useCallback(async (
    fetchFunction: (token: string, id: string, options: InsightFilterOptions) => Promise<InsightsResponse>,
    id: string, 
    options: InsightFilterOptions = {}
  ) => {
    setIsLoading(true);
    setError(null);
    
    // FIRST CHECK: Verify if this campaign ID is blocked due to 400 errors
    if (CampaignBlockingService.isCampaignBlocked(id)) {
      console.log(`🚫 Skipped ${id} – insights blocked after 400`);
      setIsLoading(false);
      return null;
    }
    
    // First validate date preset
    let validatedOptions = { ...options };
    
    if (options.datePreset) {
      // Use mapToValidDatePreset to ensure we get a valid preset
      const validDatePreset = mapToValidDatePreset(options.datePreset);
      
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
      
      // Special handling for 400 errors - mark campaign as blocked
      if (err.status === 400 || (err.response && err.response.status === 400)) {
        console.log(`[INSIGHTS FETCHING] ✅ Permanently blocking campaign due to 400 error: ${id}`);
        CampaignBlockingService.blockCampaign(id);
      }
      
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

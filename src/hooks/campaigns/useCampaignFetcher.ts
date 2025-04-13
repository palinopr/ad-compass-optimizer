
import { useCallback, useRef } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useToast } from '@/hooks/use-toast';
import {
  checkRateLimitStatus,
  notifyRateLimit,
  getCachedCampaigns,
  serveCachedDataWithNotification,
  storeCampaignsInCache,
  processFetchError,
  executeCampaignFetch,
  filterCampaignsByStatus,
  shouldThrottleFetch,
  getBackoffTime
} from './fetch-utils';

export function useCampaignFetcher() {
  const { toast } = useToast();
  // Add a reference to track in-flight requests
  const pendingRequestRef = useRef<boolean>(false);
  // Add a timestamp for the last successful fetch to avoid duplicate requests
  const lastFetchTimestampRef = useRef<number>(0);

  const fetchCampaignData = useCallback(async (
    token: string,
    adAccountId: string, 
    status?: string
  ): Promise<{ campaigns: MetaCampaign[], error: string | null, errorDetails?: any }> => {
    // Prevent duplicate requests within a short time window
    if (shouldThrottleFetch(lastFetchTimestampRef.current)) {
      console.log('Throttling campaign fetch - too soon after last fetch');
      
      // Try to return cached campaigns if available
      const { campaigns } = getCachedCampaigns();
      if (campaigns) {
        return serveCachedDataWithNotification('throttling protection');
      }
    }
    
    // Prevent concurrent requests
    if (pendingRequestRef.current) {
      console.log('Campaign fetch already in progress, preventing duplicate request');
      return { 
        campaigns: [], 
        error: 'A campaign fetch request is already in progress', 
        errorDetails: { concurrent: true } 
      };
    }
    
    pendingRequestRef.current = true;
    
    try {
      // Check if we've recently hit a rate limit
      const rateStatus = checkRateLimitStatus();
      
      if (rateStatus.isRateLimited) {
        console.log(`Rate limit detected ${rateStatus.timeRemaining} minutes ago. Advising to wait.`);
        
        notifyRateLimit(rateStatus.timeRemaining || undefined);
        
        // Try to use cached data if available
        const { campaigns } = getCachedCampaigns();
        if (campaigns) {
          return serveCachedDataWithNotification('API rate limiting');
        }
        
        return { 
          campaigns: [], 
          error: `Meta API rate limit reached. Please wait approximately ${rateStatus.timeRemaining} more minutes and try again.`,
          errorDetails: { 
            code: 4,
            isRateLimit: true,
            timeRemaining: rateStatus.timeRemaining
          }
        };
      }
      
      try {
        // Execute the campaign fetch
        const campaignsData = await executeCampaignFetch(token, adAccountId);
        
        // Store in cache for future use
        storeCampaignsInCache(campaignsData, adAccountId);
        
        // Update last fetch timestamp
        lastFetchTimestampRef.current = Date.now();
        
        // Filter by status if provided
        const filteredCampaigns = filterCampaignsByStatus(campaignsData, status);
        
        return { campaigns: filteredCampaigns, error: null };
      } catch (apiErr: any) {
        // Handle API errors
        const { campaigns } = getCachedCampaigns();
        if (campaigns && apiErr.isRateLimit) {
          return serveCachedDataWithNotification('API rate limiting');
        }
        
        throw apiErr;
      }
    } catch (err: any) {
      // Process any errors that occur during fetching
      const { error, errorDetails } = processFetchError(err);
      
      // If it's a rate limit error and we have cached data, serve it
      if (errorDetails?.isRateLimit) {
        const { campaigns } = getCachedCampaigns();
        if (campaigns) {
          return serveCachedDataWithNotification('API rate limiting');
        }
      }
      
      // Apply backoff strategy for future requests based on Meta best practices
      const lastFetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
      const rateLimitHistory = JSON.parse(localStorage.getItem('meta_rate_limit_history') || '[]');
      
      // Get usage data if available
      let callCount;
      try {
        const usageData = JSON.parse(localStorage.getItem('meta_api_last_usage') || '{}');
        if (usageData.appUsage) {
          const usage = JSON.parse(usageData.appUsage);
          callCount = usage.call_count;
        }
      } catch (e) {}
      
      // Calculate backoff time and apply a minimum delay before next fetch
      const backoffTime = getBackoffTime(lastFetchSuccess, rateLimitHistory, callCount);
      console.log(`Applying backoff strategy: ${backoffTime}ms before next request`);
      
      return { campaigns: [], error, errorDetails };
    } finally {
      pendingRequestRef.current = false;
    }
  }, [toast]);

  return { fetchCampaignData };
}

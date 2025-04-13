
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { handleApiError } from './errorHandler';

/**
 * Helper functions for fetching campaign data
 */
export const executeCampaignFetch = async (
  token: string, 
  adAccountId: string
): Promise<MetaCampaign[]> => {
  // Store attempt time for diagnostics
  localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
  
  try {
    // Format the ID correctly for the API call
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    console.log(`Executing campaign fetch for: ${formattedId}`);
    
    // Use our API service to fetch campaigns
    const MetaCampaignService = (await import('@/services/api/MetaCampaignService')).default;
    const campaigns = await MetaCampaignService.fetchCampaigns(token, formattedId);
    
    // Log rate limit usage data if available
    if (MetaCampaignService.lastResponseHeaders) {
      const appUsage = MetaCampaignService.lastResponseHeaders['x-app-usage'];
      const businessUsage = MetaCampaignService.lastResponseHeaders['x-business-use-case-usage'];
      
      if (appUsage || businessUsage) {
        console.log('Meta API usage data:', { appUsage, businessUsage });
        
        // Store usage data for diagnostics
        localStorage.setItem('meta_api_last_usage', JSON.stringify({ 
          appUsage, 
          businessUsage,
          timestamp: new Date().toISOString() 
        }));
        
        // Check if we're approaching rate limits (over 80%)
        try {
          if (appUsage) {
            const usage = JSON.parse(appUsage);
            if (usage.call_count > 80 || usage.total_cputime > 80 || usage.total_time > 80) {
              console.warn('Approaching Meta API rate limits:', usage);
            }
          }
          
          if (businessUsage) {
            const usage = JSON.parse(businessUsage);
            const businessId = Object.keys(usage)[0];
            if (businessId && usage[businessId][0]?.call_count > 80) {
              console.warn('Approaching Meta Business API rate limits:', usage[businessId]);
            }
          }
        } catch (e) {
          console.error('Error parsing API usage data:', e);
        }
      }
    }
    
    // Store results for diagnostics
    localStorage.setItem('last_campaign_fetch_success', 'true');
    localStorage.setItem('last_campaign_count', campaigns.length.toString());
    
    return campaigns;
  } catch (err: any) {
    // Use our API error handler
    const errorResult = await handleApiError(err);
    throw { ...errorResult, ...err };
  }
};

export const filterCampaignsByStatus = (
  campaigns: MetaCampaign[], 
  status?: string
): MetaCampaign[] => {
  if (!status || status === 'all') {
    return campaigns;
  }
  
  return campaigns.filter(campaign => {
    if (status === 'active') {
      return campaign.status === 'ACTIVE';
    } else if (status === 'draft') {
      return campaign.status === 'DRAFT' || 
             campaign.status === 'PAUSED' ||
             campaign.status === 'IN_PROCESS';
    } else if (status === 'archived') {
      return campaign.status === 'ARCHIVED' || 
             campaign.status === 'DELETED' ||
             campaign.status === 'COMPLETED';
    }
    return true;
  });
};

/**
 * Advanced throttling based on Meta's best practices
 * to spread out requests evenly and avoid traffic spikes
 */
export const getBackoffTime = (
  lastFetchSuccess: boolean, 
  rateLimitHistory: string[],
  callCount?: number
): number => {
  // If last request failed, use exponential backoff
  if (!lastFetchSuccess) {
    return 5000; // 5 seconds
  }
  
  // If we've hit rate limits recently, use larger spacing
  if (rateLimitHistory.length > 0) {
    const recentRateLimit = new Date(rateLimitHistory[rateLimitHistory.length - 1]).getTime();
    const timeSinceRateLimit = Date.now() - recentRateLimit;
    
    // If rate limited in the last 10 minutes, space requests further apart
    if (timeSinceRateLimit < 10 * 60 * 1000) {
      return 5000; // 5 seconds
    }
  }
  
  // If we're approaching rate limits (based on call_count from headers), increase spacing
  if (callCount && callCount > 70) {
    return 2000 + (callCount - 70) * 100; // 2-5 seconds based on call count
  }
  
  // Default spacing
  return 1000; // 1 second
};

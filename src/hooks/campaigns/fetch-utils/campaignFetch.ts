
/**
 * Campaign fetch utilities
 */

import { isRateLimitError } from './rateLimitDetection';
import { 
  checkRateLimitStatus,
  markRateLimited,
  notifyRateLimit
} from './rateLimitStatus';
import {
  getCachedCampaigns,
  serveCachedDataWithNotification,
  storeCampaignsInCache
} from './campaignCache';

/**
 * Process fetch errors and handle rate limits
 */
export const processFetchError = (error: any, accountId?: string) => {
  console.error(`Campaign fetch error for account ${accountId}:`, error);
  
  // Save the error for diagnostic purposes
  try {
    localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
      message: error?.message || String(error),
      code: error?.code || error?.details?.error?.code,
      time: new Date().toISOString(),
      accountId
    }));
  } catch (e) {
    console.error('Error saving campaign fetch error:', e);
  }
  
  // Handle rate limit errors specifically
  if (isRateLimitError(error)) {
    console.log(`Rate limit error detected for account ${accountId}:`, error);
    
    // Mark as rate limited for 10 minutes
    const { timeRemaining } = markRateLimited(10, accountId);
    
    // Show notification
    notifyRateLimit(timeRemaining);
    
    // Return error info
    return { 
      error: `Rate limit reached for account ${accountId}. Please try again later.`,
      errorDetails: { 
        isRateLimit: true, 
        message: error?.message || 'Rate limit error',
        accountId
      }
    };
  }
  
  // For other errors, return empty data with error
  return { 
    error: error?.message || 'Error fetching campaigns',
    errorDetails: error
  };
};

/**
 * Execute campaign fetch with rate limit handling and caching
 */
export const executeCampaignFetch = async (fetchFunction: Function, adAccountId: string) => {
  try {
    // Check if rate limited
    const rateStatus = checkRateLimitStatus(adAccountId);
    if (rateStatus.isRateLimited) {
      console.log(`Currently rate limited for account ${adAccountId}. ${rateStatus.timeRemaining} minutes remaining.`);
      return { 
        campaigns: [], 
        error: `Rate limited for account ${adAccountId}. ${rateStatus.timeRemaining} minutes remaining.` 
      };
    }
    
    // Record API fetch time for throttling
    localStorage.setItem(`last_api_fetch_time_${adAccountId}`, new Date().toISOString());
    
    // Execute the fetch
    localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
    const campaigns = await fetchFunction();
    
    // Store success info and cache the result
    localStorage.setItem('last_campaign_fetch_success', 'true');
    localStorage.setItem('last_campaign_count', String(campaigns.length));
    
    // Cache the campaigns for use during rate limiting
    storeCampaignsInCache(campaigns, adAccountId);
    
    return { campaigns, error: null, errorDetails: null };
  } catch (error: any) {
    localStorage.setItem('last_campaign_fetch_success', 'false');
    return { campaigns: [], ...processFetchError(error, adAccountId) };
  }
};

/**
 * Filter campaigns by status
 */
export const filterCampaignsByStatus = (campaigns: any[], status?: string) => {
  if (!status || status === 'all') {
    return campaigns;
  }
  
  return campaigns.filter(campaign => 
    campaign.status && campaign.status.toLowerCase() === status.toLowerCase()
  );
};

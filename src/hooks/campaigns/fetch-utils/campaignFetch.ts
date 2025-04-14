
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
export const processFetchError = (error: any) => {
  console.error('Campaign fetch error:', error);
  
  // Save the error for diagnostic purposes
  try {
    localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
      message: error?.message || String(error),
      code: error?.code || error?.details?.error?.code,
      time: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Error saving campaign fetch error:', e);
  }
  
  // Handle rate limit errors specifically
  if (isRateLimitError(error)) {
    console.log('Rate limit error detected:', error);
    
    // Mark as rate limited for 10 minutes
    const { timeRemaining } = markRateLimited(10);
    
    // Show notification
    notifyRateLimit(timeRemaining);
    
    // Return cached data if available
    return serveCachedDataWithNotification('rate limiting');
  }
  
  // For other errors, return empty data with error
  return { 
    campaigns: [],
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
    const rateStatus = checkRateLimitStatus();
    if (rateStatus.isRateLimited) {
      console.log(`Currently rate limited. ${rateStatus.timeRemaining} minutes remaining.`);
      return serveCachedDataWithNotification(`rate limiting (${rateStatus.timeRemaining} min remaining)`);
    }
    
    // Record API fetch time for throttling
    localStorage.setItem('last_api_fetch_time', new Date().toISOString());
    
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
    return processFetchError(error);
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

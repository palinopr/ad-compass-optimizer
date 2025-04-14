
/**
 * Campaign caching utilities
 */

import { toast } from '@/hooks/use-toast';

const CACHE_KEY = 'cached_campaign_data';
const CACHE_TIMESTAMP_KEY = 'campaign_cache_timestamp';
const CACHE_ACCOUNT_KEY = 'campaign_cache_account';

/**
 * Get cached campaigns if available
 */
export const getCachedCampaigns = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const cacheAccount = localStorage.getItem(CACHE_ACCOUNT_KEY);
    
    if (!cachedData || !cacheTimestamp || !cacheAccount) {
      return { campaigns: null, timestamp: null, adAccountId: null };
    }
    
    const campaigns = JSON.parse(cachedData);
    
    // Check cache freshness - consider cache valid for 30 minutes
    const cacheDateMs = new Date(cacheTimestamp).getTime();
    const now = new Date().getTime();
    const cacheAge = (now - cacheDateMs) / (1000 * 60); // age in minutes
    
    if (cacheAge > 30) {
      console.log(`Cache is stale (${Math.round(cacheAge)} minutes old)`);
      return { campaigns: null, timestamp: null, adAccountId: null };
    }
    
    console.log(`Using cached campaign data from ${new Date(cacheTimestamp).toLocaleTimeString()}`);
    
    return { 
      campaigns, 
      timestamp: cacheTimestamp,
      adAccountId: cacheAccount
    };
  } catch (e) {
    console.error('Error reading campaign cache:', e);
    return { campaigns: null, timestamp: null, adAccountId: null };
  }
};

/**
 * Store campaigns in cache for future use
 */
export const storeCampaignsInCache = (campaigns: any[], adAccountId: string) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(campaigns));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
    localStorage.setItem(CACHE_ACCOUNT_KEY, adAccountId);
    console.log(`Cached ${campaigns.length} campaigns for ad account ${adAccountId}`);
  } catch (e) {
    console.error('Error caching campaign data:', e);
  }
};

/**
 * Serve cached data with notification to user
 */
export const serveCachedDataWithNotification = (reason: string) => {
  const { campaigns, timestamp } = getCachedCampaigns();
  
  if (!campaigns || !timestamp) {
    return { 
      campaigns: [], 
      error: 'No cached campaign data available during ' + reason,
      errorDetails: { 
        noCachedData: true, 
        reason 
      }
    };
  }
  
  // Notify the user we're using cached data
  toast({
    title: "Using cached campaign data",
    description: `Due to ${reason}, showing data from ${new Date(timestamp).toLocaleTimeString()}`,
    variant: "default",
    duration: 5000,
  });
  
  return { 
    campaigns, 
    error: null, 
    fromCache: true, 
    cacheTimestamp: timestamp 
  };
};

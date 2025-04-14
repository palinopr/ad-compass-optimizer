
/**
 * Campaign caching utilities
 */

import { toast } from "@/hooks/use-toast";

const CAMPAIGN_CACHE_KEY_PREFIX = 'meta_campaign_cache_';
const CAMPAIGN_CACHE_TIMESTAMP_PREFIX = 'meta_campaign_cache_timestamp_';

/**
 * Get account-specific cache key
 */
const getAccountCacheKey = (accountId?: string) => {
  if (!accountId) return CAMPAIGN_CACHE_KEY_PREFIX;
  return `${CAMPAIGN_CACHE_KEY_PREFIX}${accountId}`;
};

/**
 * Get account-specific timestamp key
 */
const getAccountTimestampKey = (accountId?: string) => {
  if (!accountId) return CAMPAIGN_CACHE_TIMESTAMP_PREFIX;
  return `${CAMPAIGN_CACHE_TIMESTAMP_PREFIX}${accountId}`;
};

/**
 * Store campaigns in cache
 */
export const storeCampaignsInCache = (campaigns: any[], accountId?: string) => {
  try {
    // Store campaigns
    const cacheKey = getAccountCacheKey(accountId);
    localStorage.setItem(cacheKey, JSON.stringify(campaigns));
    
    // Store timestamp
    const timestampKey = getAccountTimestampKey(accountId);
    localStorage.setItem(timestampKey, new Date().toISOString());
    
    console.log(`Cached ${campaigns.length} campaigns for account ${accountId || 'default'}`);
  } catch (e) {
    console.error('Error caching campaigns:', e);
  }
};

/**
 * Get cached campaigns
 */
export const getCachedCampaigns = (accountId?: string) => {
  try {
    // Get campaigns
    const cacheKey = getAccountCacheKey(accountId);
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return { campaigns: null, timestamp: null };
    }
    
    // Get timestamp
    const timestampKey = getAccountTimestampKey(accountId);
    const timestamp = localStorage.getItem(timestampKey);
    
    return {
      campaigns: JSON.parse(cachedData),
      timestamp
    };
  } catch (e) {
    console.error('Error getting cached campaigns:', e);
    return { campaigns: null, timestamp: null };
  }
};

/**
 * Serve cached data with a notification
 */
export const serveCachedDataWithNotification = (reason: string, accountId?: string) => {
  const { campaigns, timestamp } = getCachedCampaigns(accountId);
  
  if (!campaigns) {
    return { campaigns: [], error: `No cached data available (${reason})` };
  }
  
  // Calculate how old the cache is
  let cacheAge = 'unknown';
  if (timestamp) {
    try {
      const cacheTime = new Date(timestamp).getTime();
      const currentTime = new Date().getTime();
      const diffMinutes = Math.floor((currentTime - cacheTime) / (1000 * 60));
      
      if (diffMinutes < 60) {
        cacheAge = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        cacheAge = `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      }
    } catch (e) {
      console.error('Error calculating cache age:', e);
    }
  }
  
  // Show toast notification
  toast({
    title: "Using Cached Data",
    description: `Due to ${reason}, showing cached data from ${cacheAge} ago.`,
    duration: 5000,
  });
  
  return { 
    campaigns,
    error: null,
    fromCache: true,
    cacheAge,
    reason
  };
};

/**
 * Clear cached campaigns
 */
export const clearCachedCampaigns = (accountId?: string) => {
  try {
    const cacheKey = getAccountCacheKey(accountId);
    const timestampKey = getAccountTimestampKey(accountId);
    
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timestampKey);
    
    console.log(`Cleared cached campaigns for account ${accountId || 'default'}`);
  } catch (e) {
    console.error('Error clearing cached campaigns:', e);
  }
};

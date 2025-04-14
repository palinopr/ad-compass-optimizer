
/**
 * Utility functions for campaign data fetching
 */

/**
 * Retrieves cached campaign data from localStorage
 */
export const getCachedCampaigns = () => {
  try {
    const cachedData = localStorage.getItem('cached_campaign_data');
    if (!cachedData) {
      return { campaigns: null };
    }
    
    const { campaigns, timestamp } = JSON.parse(cachedData);
    if (!campaigns || !timestamp) {
      return { campaigns: null };
    }
    
    const age = Date.now() - timestamp;
    const ageInMinutes = Math.floor(age / (1000 * 60));
    
    console.log(`Found cached campaign data (${campaigns.length} campaigns, ${ageInMinutes} minutes old)`);
    
    return { campaigns, timestamp, ageInMinutes };
  } catch (e) {
    console.error('Error retrieving cached campaigns:', e);
    return { campaigns: null };
  }
};

/**
 * Saves campaign data to cache
 */
export const cacheCampaigns = (campaigns) => {
  try {
    if (!campaigns || campaigns.length === 0) {
      console.log('No campaigns to cache');
      return false;
    }
    
    const cacheData = {
      campaigns,
      timestamp: Date.now()
    };
    
    localStorage.setItem('cached_campaign_data', JSON.stringify(cacheData));
    console.log(`Cached ${campaigns.length} campaigns`);
    return true;
  } catch (e) {
    console.error('Error caching campaigns:', e);
    return false;
  }
};

/**
 * Serves cached campaign data with a notification to the user
 */
export const serveCachedDataWithNotification = (reason) => {
  const cachedData = getCachedCampaigns();
  
  if (!cachedData.campaigns) {
    return {
      campaigns: [],
      error: null,
      errorDetails: {
        fromCache: false,
        reason
      }
    };
  }
  
  console.log(`Serving cached campaign data due to ${reason}`);
  
  return {
    campaigns: cachedData.campaigns,
    error: null,
    errorDetails: {
      fromCache: true,
      reason
    }
  };
};

/**
 * Determines if a fetch request should be throttled based on time since last fetch
 * Following Meta's best practice to spread requests evenly
 */
export const shouldThrottleFetch = (lastFetchTime) => {
  const now = Date.now();
  
  // Check if less than 2 seconds since last fetch
  if (now - lastFetchTime < 2000) {
    return true;
  }
  
  // Check if we've had multiple rate limits recently
  // If so, increase throttling time
  const rateLimitHistory = JSON.parse(localStorage.getItem('meta_rate_limit_history') || '[]');
  if (rateLimitHistory.length >= 3) {
    // If we've had 3+ rate limits, enforce stricter throttling
    // of 10 seconds between requests
    return now - lastFetchTime < 10000;
  }
  
  return false;
};

/**
 * Calculate backoff time based on recent API issues
 */
export const getBackoffTime = (lastFetchSuccess, rateLimitHistory, callCount) => {
  // Base backoff time
  let backoffTime = 2000; // 2 seconds minimum
  
  // If we've had failures, increase backoff
  if (!lastFetchSuccess) {
    backoffTime = 5000; // 5 seconds
  }
  
  // If we've had rate limits, increase further
  if (rateLimitHistory && rateLimitHistory.length > 0) {
    // Exponential backoff based on number of recent rate limits
    backoffTime = 5000 * Math.pow(1.5, Math.min(rateLimitHistory.length, 5));
  }
  
  // If we're close to API limits, be more conservative
  if (callCount && callCount > 80) {
    backoffTime = Math.max(backoffTime, 10000); // At least 10 seconds
  }
  
  // Cap at 60 seconds
  return Math.min(backoffTime, 60000);
};

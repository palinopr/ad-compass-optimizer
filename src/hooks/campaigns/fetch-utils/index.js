
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

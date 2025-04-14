
import { toast } from "@/hooks/use-toast";

/**
 * Get cached campaign data from localStorage
 */
export const getCachedCampaigns = () => {
  try {
    const cachedData = localStorage.getItem('cached_campaigns');
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (parsed.campaigns && Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0) {
        return {
          campaigns: parsed.campaigns,
          adAccountId: parsed.adAccountId,
          timestamp: parsed.timestamp
        };
      }
    }
  } catch (e) {
    console.error('Error retrieving cached campaigns:', e);
  }
  
  return { campaigns: null, adAccountId: null, timestamp: null };
};

/**
 * Store campaign data in cache
 */
export const storeCampaignsInCache = (campaigns: any[], adAccountId: string) => {
  if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
    return;
  }
  
  try {
    const cacheData = {
      campaigns,
      adAccountId,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cached_campaigns', JSON.stringify(cacheData));
    console.log(`Cached ${campaigns.length} campaigns for account ${adAccountId}`);
  } catch (e) {
    console.error('Error caching campaigns:', e);
  }
};

/**
 * Return cached data with a notification
 */
export const serveCachedDataWithNotification = (reason: string) => {
  const { campaigns, timestamp } = getCachedCampaigns();
  
  if (campaigns) {
    let timeAgo = 'unknown time';
    if (timestamp) {
      try {
        const cachedTime = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - cachedTime.getTime()) / (1000 * 60));
        
        if (diffMinutes < 60) {
          timeAgo = `${diffMinutes} minutes ago`;
        } else if (diffMinutes < 1440) {
          timeAgo = `${Math.floor(diffMinutes / 60)} hours ago`;
        } else {
          timeAgo = `${Math.floor(diffMinutes / 1440)} days ago`;
        }
      } catch (e) {}
    }
    
    toast({
      title: "Using Cached Campaign Data",
      description: `Due to ${reason}. Data from ${timeAgo}.`,
      duration: 5000,
    });
    
    return { campaigns, error: null };
  }
  
  return { campaigns: [], error: `No cached data available during ${reason}` };
};

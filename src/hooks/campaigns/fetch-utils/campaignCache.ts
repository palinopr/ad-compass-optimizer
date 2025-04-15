
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { toast } from '@/hooks/use-toast';

// Constants for caching
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CachedCampaignData {
  campaigns: MetaCampaign[];
  timestamp: number;
  adAccountId: string;
}

/**
 * Get cached campaigns if they exist and are fresh
 */
export const getCachedCampaigns = (adAccountId: string): { campaigns: MetaCampaign[] | null, isFresh: boolean } => {
  try {
    const cachedDataStr = localStorage.getItem(`campaign_cache_${adAccountId}`);
    if (!cachedDataStr) {
      return { campaigns: null, isFresh: false };
    }
    
    const cachedData: CachedCampaignData = JSON.parse(cachedDataStr);
    const now = Date.now();
    const isFresh = now - cachedData.timestamp < CACHE_EXPIRY_MS;
    
    if (isFresh) {
      console.log(`[CAMPAIGN CACHE] Using cached campaigns for account ${adAccountId}, age: ${Math.round((now - cachedData.timestamp) / 1000)}s`);
      return { campaigns: cachedData.campaigns, isFresh: true };
    } else {
      console.log(`[CAMPAIGN CACHE] Cache expired for account ${adAccountId}, age: ${Math.round((now - cachedData.timestamp) / 1000)}s`);
      return { campaigns: cachedData.campaigns, isFresh: false };
    }
  } catch (e) {
    console.error('[CAMPAIGN CACHE] Error retrieving cache:', e);
    return { campaigns: null, isFresh: false };
  }
};

/**
 * Store campaigns in cache for future use
 */
export const storeCampaignsInCache = (campaigns: MetaCampaign[], adAccountId: string): void => {
  try {
    const cacheData: CachedCampaignData = {
      campaigns,
      timestamp: Date.now(),
      adAccountId
    };
    localStorage.setItem(`campaign_cache_${adAccountId}`, JSON.stringify(cacheData));
    console.log(`[CAMPAIGN CACHE] Stored ${campaigns.length} campaigns for account ${adAccountId}`);
  } catch (e) {
    console.error('[CAMPAIGN CACHE] Error storing cache:', e);
  }
};

/**
 * Serve cached data with UI notification
 */
export const serveCachedDataWithNotification = (campaigns: MetaCampaign[], isStale: boolean = true): void => {
  if (isStale) {
    toast({
      title: "Using cached campaign data",
      description: "Fresh data couldn't be fetched. Showing most recent available data.",
      variant: "default",  // Changed from "secondary" to "default"
    });
  }
};

/**
 * Clear cache for an ad account
 */
export const clearCampaignCache = (adAccountId: string): void => {
  localStorage.removeItem(`campaign_cache_${adAccountId}`);
  console.log(`[CAMPAIGN CACHE] Cleared cache for account ${adAccountId}`);
};

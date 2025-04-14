
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { toast } from "@/hooks/use-toast";

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

// In-memory cache map
const campaignCache = new Map<string, { 
  data: MetaCampaign[]; 
  timestamp: number;
}>();

export const getCachedCampaigns = (adAccountId?: string): {
  campaigns: MetaCampaign[] | null;
  timestamp: string | null;
  isFresh: boolean;
} => {
  if (!adAccountId) return { campaigns: null, timestamp: null, isFresh: false };
  
  const cached = campaignCache.get(adAccountId);
  if (!cached) return { campaigns: null, timestamp: null, isFresh: false };
  
  const now = Date.now();
  const isFresh = (now - cached.timestamp) < CACHE_DURATION;
  
  return { 
    campaigns: cached.data,
    timestamp: new Date(cached.timestamp).toISOString(),
    isFresh
  };
};

export const storeCampaignsInCache = (
  campaigns: MetaCampaign[],
  adAccountId: string
): void => {
  if (!adAccountId) return;
  
  campaignCache.set(adAccountId, {
    data: campaigns,
    timestamp: Date.now()
  });
  
  console.log(`Cached ${campaigns.length} campaigns for account ${adAccountId}`);
};

export const serveCachedDataWithNotification = (
  reason: string,
  adAccountId?: string
): {
  campaigns: MetaCampaign[];
  error: string | null;
  fromCache: boolean;
} => {
  const { campaigns, timestamp, isFresh } = getCachedCampaigns(adAccountId);
  
  if (!campaigns) {
    return { campaigns: [], error: 'No cached data available', fromCache: false };
  }

  if (isFresh) {
    toast({
      title: "Using Cached Data",
      description: `Using cached campaign data from ${new Date(timestamp!).toLocaleTimeString()}`,
      duration: 3000,
    });
  }
  
  return { 
    campaigns,
    error: null,
    fromCache: true
  };
};

export const clearCacheForAccount = (adAccountId: string): void => {
  campaignCache.delete(adAccountId);
};

export const isCacheFresh = (adAccountId: string): boolean => {
  const { isFresh } = getCachedCampaigns(adAccountId);
  return isFresh;
};


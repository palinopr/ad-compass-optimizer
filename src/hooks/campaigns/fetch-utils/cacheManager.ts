
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { toast } from "@/hooks/use-toast";

/**
 * Cache management for campaign data
 */
export const getCachedCampaigns = (): {
  campaigns: MetaCampaign[] | null;
  timestamp: string | null;
  adAccountId: string | null;
} => {
  const cachedCampaignsJson = localStorage.getItem('cached_campaigns');
  
  if (!cachedCampaignsJson) {
    return { campaigns: null, timestamp: null, adAccountId: null };
  }
  
  try {
    const cachedData = JSON.parse(cachedCampaignsJson);
    return { 
      campaigns: cachedData.campaigns || [], 
      timestamp: cachedData.timestamp,
      adAccountId: cachedData.adAccountId
    };
  } catch (e) {
    console.error('Error parsing cached campaigns:', e);
    return { campaigns: null, timestamp: null, adAccountId: null };
  }
};

export const storeCampaignsInCache = (
  campaigns: MetaCampaign[],
  adAccountId: string
): void => {
  localStorage.setItem('cached_campaigns', JSON.stringify({
    campaigns,
    timestamp: new Date().toISOString(),
    adAccountId
  }));
};

export const serveCachedDataWithNotification = (reason: string): {
  campaigns: MetaCampaign[];
  error: null;
  errorDetails: { 
    fromCache: boolean;
    reason: string;
  }
} => {
  const { campaigns } = getCachedCampaigns();
  
  if (!campaigns) {
    return {
      campaigns: [],
      error: null,
      errorDetails: {
        fromCache: false,
        reason
      }
    };
  }
  
  toast({
    title: "Using Cached Data",
    description: `Using previously cached campaign data due to ${reason}.`,
    duration: 5000,
  });
  
  return {
    campaigns: campaigns,
    error: null,
    errorDetails: {
      fromCache: true,
      reason
    }
  };
};

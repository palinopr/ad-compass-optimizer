
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { handleApiError } from './errorHandler';

/**
 * Helper functions for fetching campaign data
 */
export const trackFetchAttempt = (): void => {
  localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
};

export const trackFetchSuccess = (campaignsCount: number): void => {
  localStorage.setItem('last_campaign_fetch_success', 'true');
  localStorage.setItem('last_campaign_count', String(campaignsCount));
};

export const executeCampaignFetch = async (
  token: string,
  adAccountId: string
): Promise<MetaCampaign[]> => {
  try {
    // Log the auth method being used
    const authMethod = metaAuthService.getTokenSource();
    console.log(`Using auth method: ${authMethod} for ad account: ${adAccountId}`);
    
    trackFetchAttempt();
    
    console.log(`Fetching campaigns for ad account: ${adAccountId}`);
    
    const campaignsData = await MetaApiService.fetchCampaigns(token, adAccountId);
    console.log('Campaigns data received:', campaignsData?.length || 0, 'campaigns');
    
    trackFetchSuccess(campaignsData?.length || 0);
    
    return campaignsData || [];
  } catch (apiErr: any) {
    const { message, details, isRateLimit } = await handleApiError(apiErr);
    
    throw { message, details, isRateLimit };
  }
};

export const filterCampaignsByStatus = (
  campaigns: MetaCampaign[],
  status?: string
): MetaCampaign[] => {
  if (!status || !campaigns) {
    return campaigns || [];
  }
  
  console.log(`Filtering campaigns by status: ${status}`);
  let filteredCampaigns = campaigns;
  
  if (status === 'active') {
    filteredCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
  } else if (status === 'draft') {
    filteredCampaigns = campaigns.filter(c => c.status === 'PAUSED');
  } else if (status === 'archived') {
    filteredCampaigns = campaigns.filter(c => c.status === 'ARCHIVED' || c.status === 'DELETED');
  }
  
  console.log(`After filtering: ${filteredCampaigns?.length || 0} campaigns`);
  return filteredCampaigns;
};

export const shouldThrottleFetch = (lastFetchTimestamp: number): boolean => {
  const now = Date.now();
  return now - lastFetchTimestamp < 2000;
};

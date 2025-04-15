
import { MockApiService } from '@/services/api/mock/MockApiService';
import { triggerCampaignRefresh } from './eventHandlers';
import { BaseMockService } from '@/services/meta/BaseMockService';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';

export const isMockMode = (): boolean => {
  try {
    // Safely check for browser environment first
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        return MockApiService.isMockMetaApiMode() || localStorage.getItem("USE_MOCK_MODE") === "true";
      } catch (storageError) {
        console.error("Error accessing localStorage:", storageError);
      }
    }
    
    // Check URL parameters as backup
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('mock') === 'true' || urlParams.get('mockMeta') === 'true';
    } catch (urlError) {
      console.error("Error checking URL parameters:", urlError);
    }
    
    return false;
  } catch (e) {
    console.error("Error checking mock mode:", e);
    return false;
  }
};

export const handleMockData = (mockData: any, adAccountId: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const mockCampaigns = mockData.campaigns.map((campaign: any) => ({
      ...campaign,
      ad_account_id: adAccountId || 'unknown_account'
    }));

    console.log(`🎭 [Enhanced Sync] Syncing ${mockCampaigns.length} mock campaigns for account: ${adAccountId}`);
    BaseMockService.syncMockCampaignsToState(mockCampaigns);

    setTimeout(() => {
      console.log('🎭 Triggering campaign refresh to ensure UI state consistency');
      triggerCampaignRefresh(false);
    }, 300);
  } catch (syncError) {
    console.error("Error during mock campaign sync:", syncError);
  }
};

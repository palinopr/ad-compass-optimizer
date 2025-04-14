
import { MetaBatchService } from './batch/MetaBatchService';
import { MetaFunnelBatchService } from './funnel/MetaFunnelBatchService';
import { FunnelData } from './types/funnelTypes';
import { InsightsThrottling } from './insights/throttling';
import { mockFunnelData } from './mock/mockCampaignData';
import { MockApiService } from './mock/MockApiService';
import { BaseMockService } from '../meta/BaseMockService';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

export class MetaFunnelService {
  public static isMockMode(): boolean {
    try {
      // Safely check for browser environment first
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Then safely check both mock mode conditions
      if (typeof localStorage !== 'undefined') {
        try {
          return MockApiService.isMockMetaApiMode() || localStorage.getItem("USE_MOCK_MODE") === "true";
        } catch (storageError) {
          console.error("Error accessing localStorage in MetaFunnelService:", storageError);
        }
      }
      
      // Check URL parameters as a backup
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
  }

  public static async fetchFunnelData(token: string, adAccountId: string): Promise<FunnelData> {
    try {
      if (this.isMockMode()) {
        console.log('🎭 Using mock funnel data');
        const mockData = MockApiService.getMockFunnelData();
        
        // Ensure we're using the correct ad account ID in the event data
        const mockCampaigns = mockData.campaigns.map(campaign => ({
          ...campaign,
          // Add the selected ad account ID to ensure proper syncing
          ad_account_id: adAccountId || 'act_mock_account'
        }));
        
        // Update the mockData with the updated campaigns
        mockData.campaigns = mockCampaigns;
        
        // Only attempt to sync in browser environment
        if (typeof window !== 'undefined') {
          try {
            // ENHANCED SYNC: Explicitly sync the mock campaigns with global state 
            console.log(`🎭 [Enhanced Sync] Syncing ${mockCampaigns.length} mock campaigns for account: ${adAccountId}`);
            BaseMockService.syncMockCampaignsToState(mockCampaigns);
            
            // Also trigger a refresh event to ensure components update
            setTimeout(() => {
              console.log('🎭 Triggering campaign refresh to ensure UI state consistency');
              triggerCampaignRefresh(false);
            }, 300);
          } catch (syncError) {
            console.error("Error during mock campaign sync:", syncError);
            // Proceed even if sync fails - don't break the app
          }
        }
        
        return mockData;
      }

      InsightsThrottling.checkThrottling(adAccountId);
      
      console.log('Fetching funnel data via batch request for account:', adAccountId);
      const batchRequests = MetaFunnelBatchService.buildBatchRequests(adAccountId);
      const batchResponses = await MetaBatchService.executeBatch(token, batchRequests);
      
      // Parse responses
      const [campaignsResponse, adsetsResponse, adsResponse] = batchResponses;
      
      const campaigns = MetaBatchService.parseBatchResponse(campaignsResponse)?.data || [];
      const adsets = MetaBatchService.parseBatchResponse(adsetsResponse)?.data || [];
      const ads = MetaBatchService.parseBatchResponse(adsResponse)?.data || [];
      
      console.log(`Batch response parsed: ${campaigns.length} campaigns, ${adsets.length} adsets, ${ads.length} ads`);
      
      return {
        campaigns: campaigns.map(campaign => ({
          ...campaign,
          spend: '$0.00',
          results: '0',
          budget: campaign.daily_budget ? 
            '$' + (parseInt(campaign.daily_budget) / 100).toFixed(2) + '/day' : 
            (campaign.lifetime_budget ? 
              '$' + (parseInt(campaign.lifetime_budget) / 100).toFixed(2) + ' total' : 
              '-'),
          insights: {
            cpa: '-',
            roas: '-',
            impressions: '0',
            clicks: '0'
          }
        })),
        adsets,
        ads
      };
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      throw error;
    }
  }
}

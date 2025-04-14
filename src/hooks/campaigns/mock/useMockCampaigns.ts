
import { useCallback, useState, useEffect } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from '../fetch-utils/eventHandlers';

export const useMockCampaigns = (status?: string) => {
  const [mockInitialized, setMockInitialized] = useState(false);
  const [mockCampaigns, setMockCampaigns] = useState<MetaCampaign[]>([]);

  const syncMockCampaigns = useCallback((campaigns: MetaCampaign[]) => {
    console.log('[MOCK DEBUG] Syncing mock campaigns to global state');
    if (campaigns.length > 0) {
      triggerCampaignRefresh(true);
      toast({
        title: "Mock Data Loaded",
        description: `${campaigns.length} mock campaigns loaded from funnel data`,
      });
    }
  }, []);

  // Improved fetch function that guarantees campaigns are returned
  const loadMockCampaigns = useCallback((forceRefresh = false) => {
    if (!forceRefresh && mockInitialized) {
      console.log('🎭 Mock mode: Using cached mock campaigns');
      console.log('[MOCK DEBUG] Returning cached mock campaigns:', mockCampaigns.length);
      return { campaigns: mockCampaigns };
    }

    console.log('🎭 Mock mode: Loading mock campaigns from source data');
    let campaigns = [...mockFunnelData.campaigns]; // Get a fresh copy
    console.log('[MOCK DEBUG] Source mock data has', campaigns.length, 'campaigns');
    
    if (status && status !== 'all') {
      campaigns = campaigns.filter(campaign => 
        campaign.status?.toLowerCase() === status.toLowerCase()
      );
      console.log(`🎭 Filtered ${campaigns.length} campaigns matching status: ${status}`);
    }
    
    setMockCampaigns(campaigns);
    setMockInitialized(true);
    
    // Sync campaigns to global state
    syncMockCampaigns(campaigns);
    
    console.log(`[MOCK DEBUG] Returning ${campaigns.length} mock campaigns for status: ${status || 'all'}`);
    return { campaigns };
  }, [status, mockCampaigns, mockInitialized, syncMockCampaigns]);

  return {
    mockCampaigns,
    loadMockCampaigns,
    mockInitialized,
    syncMockCampaigns
  };
};

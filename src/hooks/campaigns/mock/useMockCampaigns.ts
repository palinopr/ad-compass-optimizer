
import { useCallback, useState, useEffect } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';
import { toast } from '@/hooks/use-toast';

export const useMockCampaigns = (status?: string) => {
  const [mockInitialized, setMockInitialized] = useState(false);
  const [mockCampaigns, setMockCampaigns] = useState<MetaCampaign[]>([]);

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
    
    toast({
      title: "Mock Campaign Data Loaded",
      description: `Loaded ${campaigns.length} simulated campaigns.`,
    });
    
    console.log(`[MOCK DEBUG] Returning ${campaigns.length} mock campaigns for status: ${status || 'all'}`);
    return { campaigns };
  }, [status, mockCampaigns, mockInitialized]);

  return {
    mockCampaigns,
    loadMockCampaigns,
    mockInitialized
  };
};

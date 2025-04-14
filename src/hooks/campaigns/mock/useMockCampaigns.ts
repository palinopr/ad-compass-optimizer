
import { useCallback, useState, useEffect } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';
import { toast } from '@/hooks/use-toast';

export const useMockCampaigns = (status?: string) => {
  const [mockInitialized, setMockInitialized] = useState(false);
  const [mockCampaigns, setMockCampaigns] = useState<MetaCampaign[]>([]);

  const loadMockCampaigns = useCallback((forceRefresh = false) => {
    if (!forceRefresh && mockInitialized) return;

    console.log('🎭 Mock mode: Loading mock campaigns');
    let campaigns = [...mockFunnelData.campaigns];
    
    if (status && status !== 'all') {
      campaigns = campaigns.filter(campaign => 
        campaign.status?.toLowerCase() === status.toLowerCase()
      );
    }
    
    setMockCampaigns(campaigns);
    setMockInitialized(true);
    
    toast({
      title: "Mock Campaign Data Loaded",
      description: `Loaded ${campaigns.length} simulated campaigns.`,
    });
    
    console.log(`🎭 Loaded ${campaigns.length} mock campaigns for status: ${status || 'all'}`);
  }, [status]);

  return {
    mockCampaigns,
    loadMockCampaigns,
    mockInitialized
  };
};

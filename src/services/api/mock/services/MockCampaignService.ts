
import { MetaCampaign } from '../../MetaCampaignService';
import { mockFunnelData } from '../mockCampaignData';
import { MockRequestLogger } from '../logger/MockRequestLogger';

export class MockCampaignService {
  public static getMockCampaigns(filterStatus?: string): MetaCampaign[] {
    let campaigns = [...mockFunnelData.campaigns];
    
    if (filterStatus && filterStatus !== 'all') {
      campaigns = campaigns.filter(campaign => 
        campaign.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    MockRequestLogger.logRequest('/campaigns', campaigns);
    return campaigns;
  }
}


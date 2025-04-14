
import { BaseMockService } from './BaseMockService';
import { MetaCampaignService } from '../api/MetaCampaignService';
import { MockApiService } from '../api/mock/MockApiService';

export class MetaCampaignMockService extends BaseMockService {
  public static async fetchCampaigns(token: string, adAccountId: string) {
    if (this.checkMockMode('campaign fetch')) {
      const mockCampaigns = await MockApiService.getMockCampaigns();
      
      // Sync mock campaigns with global state
      this.syncMockCampaignsToState(mockCampaigns);
      
      return mockCampaigns;
    }
    return this.executeWithRateLimiting(() => 
      MetaCampaignService.fetchCampaigns(token, adAccountId)
    );
  }
}

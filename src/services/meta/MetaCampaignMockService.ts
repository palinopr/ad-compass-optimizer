
import { BaseMockService } from './BaseMockService';
import { MetaCampaignService } from '../api/MetaCampaignService';
import { MockApiService } from '../api/mock/MockApiService';

export class MetaCampaignMockService extends BaseMockService {
  public static async fetchCampaigns(token: string, adAccountId: string) {
    // Check if we should use mock data
    if (this.isMockMode()) {
      console.log('🎭 Using mock campaign data for:', adAccountId);
      return MockApiService.getMockCampaigns();
    }
    
    // Else use real API with rate limiting
    return BaseMockService.executeWithRateLimiting(() => 
      MetaCampaignService.fetchCampaigns(token, adAccountId)
    );
  }
}


import { BaseMockService } from './BaseMockService';
import { MetaCampaignService } from '../api/MetaCampaignService';
import { MockApiService } from '../api/mock/MockApiService';

export class MetaCampaignMockService extends BaseMockService {
  public static async fetchCampaigns(token: string, adAccountId: string) {
    if (this.checkMockMode('campaign fetch')) {
      return MockApiService.getMockCampaigns();
    }
    return this.executeWithRateLimiting(() => 
      MetaCampaignService.fetchCampaigns(token, adAccountId)
    );
  }
}

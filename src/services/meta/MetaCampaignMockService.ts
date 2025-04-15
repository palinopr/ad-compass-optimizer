
import { BaseMockService } from './BaseMockService';
import { MetaCampaignService } from '../api/MetaCampaignService';

export class MetaCampaignMockService extends BaseMockService {
  public static async fetchCampaigns(token: string, adAccountId: string) {
    return BaseMockService.executeWithRateLimiting(() => 
      MetaCampaignService.fetchCampaigns(token, adAccountId)
    );
  }
}


import { MetaCampaign } from '../api/MetaCampaignService';
import { BaseMockService } from './BaseMockService';

export class MetaCampaignMockService extends BaseMockService {
  public static async fetchCampaigns(): Promise<MetaCampaign[]> {
    return [];
  }
}


import { BaseApiService } from './BaseApiService';
import { CampaignFetchService } from './campaign/fetching/campaignFetchService';
import { MetaCampaign } from './types/metaCampaignTypes';

export type { MetaCampaign };

export class MetaCampaignService extends BaseApiService {
  public static fetchCampaigns(token: string, adAccountId: string, datePreset?: string): Promise<MetaCampaign[]> {
    return CampaignFetchService.fetchCampaigns(token, adAccountId, datePreset);
  }
}

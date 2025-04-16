
/**
 * Base functionality for Meta Insights API
 * Refactored into modular components
 */
import { BaseApiService } from '../BaseApiService';
import { InsightFilterOptions, InsightsResponse } from './types';
import { InsightsBaseService } from './core/InsightsBaseService';
import { CampaignBlockingService } from './core/CampaignBlockingService';

export class BaseInsightsService extends BaseApiService {
  private static readonly BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';

  /**
   * Fetches insights for a specific ad object (account, campaign, adset, or ad)
   */
  public static async fetchInsights(
    token: string,
    objectId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    return InsightsBaseService.fetchInsights(token, objectId, options);
  }

  /**
   * Add a campaign ID to the blocked campaigns list
   * @deprecated Use CampaignBlockingService.blockCampaign instead
   */
  private static addToBlockedCampaigns(campaignId: string): void {
    CampaignBlockingService.blockCampaign(campaignId);
  }
}

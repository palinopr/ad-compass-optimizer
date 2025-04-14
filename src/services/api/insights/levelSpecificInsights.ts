
/**
 * Level-specific insights fetching functionality
 */
import { BaseInsightsService } from './baseInsights';
import { InsightFilterOptions, InsightsResponse } from './types';
import { InsightsRequestBuilder } from './requestBuilder';

export class LevelSpecificInsightsService extends BaseInsightsService {
  /**
   * Fetch insights for a campaign
   */
  public static async fetchCampaignInsights(
    token: string,
    campaignId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set default fields for campaign level insights if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = InsightsRequestBuilder.getDefaultFields('campaign');
    }
    
    // Default level to campaign if not specified
    if (!options.level) {
      options.level = 'campaign';
    }
    
    return this.fetchInsights(token, campaignId, options);
  }
  
  /**
   * Fetch insights for an ad account
   */
  public static async fetchAccountInsights(
    token: string,
    accountId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Ensure adAccountId has the proper format with 'act_' prefix
    const formattedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    
    // Set default fields for account level insights if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = InsightsRequestBuilder.getDefaultFields('account');
    }
    
    // Default level to account if not specified
    if (!options.level) {
      options.level = 'account';
    }
    
    return this.fetchInsights(token, formattedAccountId, options);
  }
  
  /**
   * Fetch insights for an ad set
   */
  public static async fetchAdSetInsights(
    token: string,
    adSetId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set default fields for ad set level insights if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = InsightsRequestBuilder.getDefaultFields('adset');
    }
    
    // Default level to adset if not specified
    if (!options.level) {
      options.level = 'adset';
    }
    
    return this.fetchInsights(token, adSetId, options);
  }
  
  /**
   * Fetch insights for an ad
   */
  public static async fetchAdInsights(
    token: string,
    adId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set default fields for ad level insights if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = InsightsRequestBuilder.getDefaultFields('ad');
    }
    
    // Default level to ad if not specified
    if (!options.level) {
      options.level = 'ad';
    }
    
    return this.fetchInsights(token, adId, options);
  }
}

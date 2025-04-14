/**
 * Main entry point for Meta Insights API services
 */
import { InsightFilterOptions, InsightsResponse } from './types';
import { BaseInsightsService } from './baseInsights';
import { LevelSpecificInsightsService } from './levelSpecificInsights';
import { BreakdownInsightsService } from './breakdownInsights';
import { MockApiService } from '../mock/MockApiService';

/**
 * Service for retrieving Meta Ads insights data
 */
export class MetaInsightsService extends BaseInsightsService {
  private static isMockMode(): boolean {
    return MockApiService.isMockMetaApiMode() || localStorage.getItem("USE_MOCK_MODE") === "true";
  }

  public static async fetchInsights(
    token: string, 
    objectId: string, 
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    if (this.isMockMode()) {
      console.warn('🎭 Direct MetaInsightsService.fetchInsights call attempted in mock mode');
      throw new Error('Cannot make direct API calls in mock mode. Use MetaApiService instead.');
    }
    
    return super.fetchInsights(token, objectId, options);
  }

  // Re-export all methods from the specialized service classes
  
  // From LevelSpecificInsightsService
  public static fetchCampaignInsights = LevelSpecificInsightsService.fetchCampaignInsights;
  public static fetchAccountInsights = LevelSpecificInsightsService.fetchAccountInsights;
  public static fetchAdSetInsights = LevelSpecificInsightsService.fetchAdSetInsights;
  public static fetchAdInsights = LevelSpecificInsightsService.fetchAdInsights;
  
  // From BreakdownInsightsService  
  public static fetchDemographicInsights = BreakdownInsightsService.fetchDemographicInsights;
  public static fetchGeographicInsights = BreakdownInsightsService.fetchGeographicInsights;
}

// Re-export types for convenience
export type { InsightFilterOptions, InsightsResponse };

export default MetaInsightsService;

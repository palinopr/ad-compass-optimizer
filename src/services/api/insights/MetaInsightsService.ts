
/**
 * Main entry point for Meta Insights API services
 */
import { InsightFilterOptions, InsightsResponse } from './types';
import { BaseInsightsService } from './baseInsights';
import { LevelSpecificInsightsService } from './levelSpecificInsights';
import { BreakdownInsightsService } from './breakdownInsights';

/**
 * Service for retrieving Meta Ads insights data
 */
export class MetaInsightsService extends BaseInsightsService {
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

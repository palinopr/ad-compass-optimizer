
/**
 * Specialized insights fetching with breakdowns
 */
import { BaseInsightsService } from './baseInsights';
import { InsightFilterOptions, InsightsResponse } from './types';

export class BreakdownInsightsService extends BaseInsightsService {
  /**
   * Fetch insights with demographic breakdowns
   */
  public static async fetchDemographicInsights(
    token: string,
    objectId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set breakdowns for demographic data
    options.breakdowns = [...(options.breakdowns || []), 'age', 'gender'];
    
    // Set default fields if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = [
        'impressions',
        'reach',
        'clicks',
        'spend',
        'actions'
      ];
    }
    
    return this.fetchInsights(token, objectId, options);
  }
  
  /**
   * Fetch insights with geographic breakdowns
   */
  public static async fetchGeographicInsights(
    token: string,
    objectId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set breakdowns for geographic data
    options.breakdowns = [...(options.breakdowns || []), 'country'];
    
    // Set default fields if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = [
        'impressions',
        'reach',
        'clicks',
        'spend',
        'actions'
      ];
    }
    
    return this.fetchInsights(token, objectId, options);
  }
}

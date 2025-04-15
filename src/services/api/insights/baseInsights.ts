
/**
 * Base functionality for Meta Insights API
 */
import { BaseApiService } from '../BaseApiService';
import { InsightFilterOptions, InsightsResponse } from './types';
import { InsightsRequestBuilder } from './requestBuilder';
import { InsightsThrottling } from './throttling';

export class BaseInsightsService extends BaseApiService {
  /**
   * Fetches insights for a specific ad object (account, campaign, adset, or ad)
   */
  public static async fetchInsights(
    token: string,
    objectId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    try {
      console.log(`Fetching insights for object ${objectId}...`);
      this.validateToken(token, 'fetchInsights');
      
      // Apply throttling checks
      InsightsThrottling.checkThrottling();
      
      // Build query parameters
      const params = InsightsRequestBuilder.buildQueryParams(token, options);
      
      // Build URL
      const url = `${this.BASE_URL}/${this.API_VERSION}/${objectId}/insights?${params.toString()}`;
      
      // Log the final URL with the token redacted
      const maskedUrl = url.replace(token, 'REDACTED');
      console.log(`[INSIGHTS] Final request URL: ${maskedUrl}`);
      
      // Extract and log date preset for debugging
      const datePreset = options.datePreset || params.get('date_preset');
      if (datePreset) {
        console.log(`[INSIGHTS] Using date preset: ${datePreset}`);
      }
      
      // Make the request with appropriate headers to improve client identification
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'meta-marketing-dashboard/1.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Capture response headers for rate limit monitoring
      this.captureResponseHeaders(response);
      
      // Monitor for rate limit headers
      InsightsThrottling.monitorResponseHeaders(response);
      
      // Process response
      const insights = await this.processApiResponse(response, 'fetchInsights');
      console.log(`Successfully fetched insights for ${objectId}`);
      
      return insights;
    } catch (error) {
      console.error(`Error fetching insights for object ${objectId}:`, error);
      
      // Check if this is a rate limit error and mark accordingly
      InsightsThrottling.checkErrorForRateLimit(error);
      
      throw error;
    }
  }
}

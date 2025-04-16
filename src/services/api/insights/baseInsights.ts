/**
 * Base functionality for Meta Insights API
 */
import { BaseApiService } from '../BaseApiService';
import { InsightFilterOptions, InsightsResponse } from './types';
import { InsightsRequestBuilder } from './requestBuilder';
import { InsightsThrottling } from './throttling/InsightsThrottling';

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
      
      // Build query parameters with validated date preset
      const params = InsightsRequestBuilder.buildQueryParams(token, options);
      
      // Build URL
      const url = `${this.BASE_URL}/${this.API_VERSION}/${objectId}/insights?${params.toString()}`;
      
      // Log the final URL with the token redacted
      const maskedUrl = url.replace(token, 'REDACTED');
      console.log(`[INSIGHTS] Final request URL: ${maskedUrl}`);
      
      // Extract date preset/time range for debugging
      if (options.timeRange) {
        console.log(`[INSIGHTS] Using time_range: ${JSON.stringify(options.timeRange)}`);
      } else if (options.datePreset) {
        console.log(`[INSIGHTS] Using date_preset: ${options.datePreset}`);
      }
      
      // Make the request with appropriate headers to improve client identification
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'meta-marketing-dashboard/1.2.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Capture response headers for rate limit monitoring
      this.captureResponseHeaders(response);
      
      // Monitor for rate limit headers
      InsightsThrottling.monitorResponseHeaders(response);
      
      // Check for 400 errors specifically related to date_preset
      if (response.status === 400) {
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message && 
              errorData.error.message.includes('date_preset')) {
            console.error(`[INSIGHTS] Error with date_preset: ${errorData.error.message}`);
            
            // If we're already using a fallback, give up
            if (options.datePreset === 'last_28d' || options.datePreset === 'maximum') {
              throw new Error(`Failed with validated date_preset '${options.datePreset}': ${errorData.error.message}`);
            }
            
            // Otherwise, try again with last_28d
            console.log(`[INSIGHTS] Retrying with date_preset=last_28d`);
            return this.fetchInsights(token, objectId, {
              ...options,
              datePreset: 'last_28d',
              timeRange: undefined // Ensure we don't send both
            });
          }
        } catch (parseError) {
          console.error('[INSIGHTS] Error parsing API error response:', parseError);
        }
      }
      
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

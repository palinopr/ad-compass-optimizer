
/**
 * Base functionality for Meta Insights API
 */
import { BaseApiService } from '../BaseApiService';
import { InsightFilterOptions, InsightsResponse } from './types';
import { InsightsRequestBuilder } from './requestBuilder';
import { InsightsThrottling } from './throttling/InsightsThrottling';
import { DuplicateRequestChecker } from './throttling/duplicateChecker';

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
      
      // Generate a unique request signature to identify this exact request
      const requestSignature = DuplicateRequestChecker.generateRequestSignature(objectId, 'insights', options);
      
      // Check if this exact request previously failed with 400
      if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
        console.log(`[INSIGHTS] Skipped insights request due to permanent failure (400): ${objectId}`);
        // Create an error object with status code for proper handling
        const error = new Error('Request previously failed with 400 status');
        (error as any).status = 400;
        (error as any).skipped = true;
        throw error;
      }
      
      // Check for problematic date presets directly in base service and replace them
      if (options.datePreset === 'last_28d') {
        console.warn(`[INSIGHTS] Replacing problematic date_preset "last_28d" with "maximum" to avoid 400 errors`);
        options.datePreset = 'maximum';
      }
      
      InsightsThrottling.checkThrottling();
      
      const params = InsightsRequestBuilder.buildQueryParams(token, options);
      const url = `${this.BASE_URL}/${this.API_VERSION}/${objectId}/insights?${params.toString()}`;
      
      const maskedUrl = url.replace(token, 'REDACTED');
      console.log(`[INSIGHTS] Final request URL: ${maskedUrl}`);
      
      if (options.timeRange) {
        console.log(`[INSIGHTS] Using time_range: ${JSON.stringify(options.timeRange)}`);
      } else if (options.datePreset) {
        console.log(`[INSIGHTS] Using date_preset: ${options.datePreset}`);
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'meta-marketing-dashboard/1.2.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      this.captureResponseHeaders(response);
      InsightsThrottling.monitorResponseHeaders(response);
      
      if (response.status === 400) {
        const errorData = await response.json();
        console.error(`[INSIGHTS] 400 Error response:`, errorData);
        
        // Mark this request signature as permanently failed
        DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
        
        // Store this requestSignature in localStorage to persist across sessions
        try {
          const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
          if (!failedSignatures.includes(requestSignature)) {
            failedSignatures.push(requestSignature);
            localStorage.setItem('failed_insights_signatures', JSON.stringify(failedSignatures));
          }
        } catch (e) {
          console.error('[INSIGHTS] Error storing failed signature in localStorage:', e);
        }
        
        // Create an error object with status code for proper handling
        const error = new Error(errorData.error?.message || 'Bad Request');
        (error as any).status = 400;
        (error as any).response = response;
        throw error;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      const insights = await this.processApiResponse(response, 'fetchInsights');
      console.log(`Successfully fetched insights for ${objectId}`);
      
      return insights;
    } catch (error) {
      console.error(`Error fetching insights for object ${objectId}:`, error);
      
      // If we get a 400 error, properly handle it
      if ((error as any).status === 400) {
        console.log(`[INSIGHTS] Permanently flagging 400 error for object ${objectId}`);
        // Re-throw but ensure we don't retry
      }
      
      InsightsThrottling.checkErrorForRateLimit(error);
      throw error;
    }
  }
}

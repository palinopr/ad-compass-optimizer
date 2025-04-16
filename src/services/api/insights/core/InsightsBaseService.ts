
/**
 * Core functionality for Meta Insights API base service
 */
import { BaseApiService } from '../../BaseApiService';
import { InsightFilterOptions, InsightsResponse } from '../types';
import { InsightsRequestBuilder } from '../requestBuilder';
import { InsightsThrottling } from '../throttling/InsightsThrottling';
import { DuplicateRequestChecker } from '../throttling/duplicateChecker';
import { CampaignBlockingService } from './CampaignBlockingService';
import { InsightsResponseProcessor } from './InsightsResponseProcessor';

export class InsightsBaseService extends BaseApiService {
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
      
      // Check if this campaign is blocked
      if (CampaignBlockingService.isCampaignBlocked(objectId)) {
        throw CampaignBlockingService.createBlockedError(objectId);
      }
      
      // Generate a unique request signature to identify this exact request
      const requestSignature = DuplicateRequestChecker.generateRequestSignature(objectId, 'insights', options);
      
      // Check if this exact request previously failed with 400
      if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
        console.log(`[INSIGHTS] 🚫 Skipped ${objectId} – insights blocked after 400`);
        
        // Add to the blocked campaigns list for consistency
        CampaignBlockingService.blockCampaign(objectId);
        
        throw CampaignBlockingService.createBlockedError(objectId);
      }
      
      // Check for object-specific permanent failure signatures
      const objectFailSignature = `object-${objectId}-failed`;
      if (DuplicateRequestChecker.isPermanentlyFailed(objectFailSignature)) {
        console.log(`[INSIGHTS] 🚫 Skipped ${objectId} – insights blocked after 400`);
        
        // Add to the blocked campaigns list for consistency
        CampaignBlockingService.blockCampaign(objectId);
        
        throw CampaignBlockingService.createBlockedError(objectId);
      }
      
      // Check for problematic date presets directly in base service
      if (options.datePreset && options.datePreset.includes('28d')) {
        console.warn(`[INSIGHTS] Replacing problematic date_preset with "maximum" to avoid 400 errors`);
        options.datePreset = 'maximum';
      }
      
      InsightsThrottling.checkThrottling();
      
      const params = InsightsRequestBuilder.buildQueryParams(token, options);
      const url = `${this.BASE_URL}/${this.API_VERSION}/${objectId}/insights?${params.toString()}`;
      
      // Log the actual URL that will be used (with token redacted)
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
        return await InsightsResponseProcessor.handleErrorResponse(response, objectId, requestSignature);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      const insights = await this.processApiResponse(response, 'fetchInsights');
      console.log(`Successfully fetched insights for ${objectId}`);
      
      return insights;
    } catch (error) {
      return InsightsResponseProcessor.handleFetchError(error, objectId, options);
    }
  }
}

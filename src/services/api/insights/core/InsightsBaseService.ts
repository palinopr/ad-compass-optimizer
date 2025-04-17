
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

// Track failed request attempts to avoid retries
const failedRequests = new Set<string>();

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
      
      // Validate object ID
      if (!objectId || typeof objectId !== 'string' || objectId.trim() === '') {
        console.warn(`⚠️ Skipping insights fetch: Invalid object ID`);
        throw new Error('Invalid object ID');
      }
      
      // Check if this is a duplicate fetch attempt
      if (failedRequests.has(objectId)) {
        console.log(`⚠️ Skipping insights fetch for object ${objectId}: Previously failed`);
        throw CampaignBlockingService.createBlockedError(objectId);
      }
      
      // Check if this campaign is blocked
      if (CampaignBlockingService.isCampaignBlocked(objectId)) {
        console.log(`⚠️ Skipping insights fetch for object ${objectId}: 400 error or missing data.`);
        throw CampaignBlockingService.createBlockedError(objectId);
      }
      
      // Generate a unique request signature to identify this exact request
      const requestSignature = DuplicateRequestChecker.generateRequestSignature(objectId, 'insights', options);
      
      // Check if this exact request previously failed with 400
      if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
        console.log(`⚠️ Skipping insights fetch for object ${objectId}: 400 error or missing data.`);
        
        // Add to the blocked campaigns list for consistency
        CampaignBlockingService.blockCampaign(objectId);
        
        throw CampaignBlockingService.createBlockedError(objectId);
      }
      
      // Check for object-specific permanent failure signatures
      const objectFailSignature = `object-${objectId}-failed`;
      if (DuplicateRequestChecker.isPermanentlyFailed(objectFailSignature)) {
        console.log(`⚠️ Skipping insights fetch for object ${objectId}: 400 error or missing data.`);
        
        // Add to the blocked campaigns list for consistency
        CampaignBlockingService.blockCampaign(objectId);
        
        throw CampaignBlockingService.createBlockedError(objectId);
      }
      
      // Check campaign status if provided
      if (options.campaignStatus && options.campaignStatus !== 'ACTIVE') {
        console.log(`⚠️ Skipping insights fetch for object ${objectId}: Not active (status: ${options.campaignStatus})`);
        throw new Error(`Campaign is not ACTIVE: ${options.campaignStatus}`);
      }
      
      // CRITICAL: Ensure a date_preset is always set
      if (!options.datePreset && !options.timeRange) {
        console.warn(`[INSIGHTS] No date_preset or time_range provided for ${objectId}, forcing date_preset=last_30d`);
        options.datePreset = 'last_30d';
      }
      
      // Check for problematic date presets directly in base service
      if (options.datePreset && options.datePreset.includes('28d')) {
        console.warn(`[INSIGHTS] Replacing problematic date_preset with "last_30d" to avoid 400 errors`);
        options.datePreset = 'last_30d';
      }
      
      InsightsThrottling.checkThrottling();
      
      const params = InsightsRequestBuilder.buildQueryParams(token, options);
      let url = `${this.BASE_URL}/${this.API_VERSION}/${objectId}/insights?${params.toString()}`;
      
      // NEW: Double-check date_preset is in the URL; if not, force append it
      if (!url.includes('date_preset=') && !url.includes('time_range=')) {
        console.error(`[INSIGHTS] CRITICAL ERROR: URL is missing date parameter for object ${objectId}, force appending date_preset=last_30d`);
        url = `${url}&date_preset=last_30d`;
        console.log(`[INSIGHTS] Forced date_preset into URL`);
      }
      
      // Log the actual URL that will be used (with token redacted)
      const maskedUrl = url.replace(token, 'REDACTED');
      console.log(`[INSIGHTS] Final request URL: ${maskedUrl}`);
      
      // NEW: Log with checkmark to confirm date_preset is in URL
      console.log(`✅ Final insights URL: ${maskedUrl}`);
      
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
        // Add to failed requests set
        failedRequests.add(objectId);
        console.log(`⚠️ Skipping insights fetch for object ${objectId}: 400 error or missing data.`);
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
      // Add to failed requests set on error
      failedRequests.add(objectId);
      return InsightsResponseProcessor.handleFetchError(error, objectId, options);
    }
  }
}

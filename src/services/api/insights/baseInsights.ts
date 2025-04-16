
/**
 * Base functionality for Meta Insights API
 */
import { BaseApiService } from '../BaseApiService';
import { InsightFilterOptions, InsightsResponse } from './types';
import { InsightsRequestBuilder } from './requestBuilder';
import { InsightsThrottling } from './throttling/InsightsThrottling';
import { DuplicateRequestChecker } from './throttling/duplicateChecker';

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
    try {
      console.log(`Fetching insights for object ${objectId}...`);
      this.validateToken(token, 'fetchInsights');
      
      // First check if this campaign is in the blocked campaigns list
      try {
        const blockedCampaigns = JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
        if (blockedCampaigns.includes(objectId)) {
          console.log(`[INSIGHTS] 🚫 Skipped ${objectId} – insights blocked after 400`);
          const error = new Error(`Campaign ${objectId} is permanently blocked due to previous 400 error`);
          (error as any).status = 400;
          (error as any).skipped = true;
          throw error;
        }
      } catch (e) {
        // Ignore storage errors
      }
      
      // Generate a unique request signature to identify this exact request
      const requestSignature = DuplicateRequestChecker.generateRequestSignature(objectId, 'insights', options);
      
      // Check if this exact request previously failed with 400 - STOP IMMEDIATELY if so
      if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
        console.log(`[INSIGHTS] 🚫 Skipped ${objectId} – insights blocked after 400`);
        // Create an error object with status code for proper handling
        const error = new Error('Request previously failed with 400 status');
        (error as any).status = 400;
        (error as any).skipped = true;
        throw error;
      }
      
      // Check for object-specific permanent failure signatures
      const objectFailSignature = `object-${objectId}-failed`;
      if (DuplicateRequestChecker.isPermanentlyFailed(objectFailSignature)) {
        console.log(`[INSIGHTS] 🚫 Skipped ${objectId} – insights blocked after 400`);
        const error = new Error(`Campaign ${objectId} is permanently blocked due to previous 400 error`);
        (error as any).status = 400;
        (error as any).skipped = true;
        throw error;
      }
      
      // Check for problematic date presets directly in base service and replace them
      if (options.datePreset && options.datePreset.includes('28d')) {
        console.warn(`[INSIGHTS] Replacing problematic date_preset with "maximum" to avoid 400 errors`);
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
        
        // STRICT BLOCKING: Always mark 400 errors as permanent failures and block the campaign ID
        console.log(`[INSIGHTS] ✅ Permanently blocking campaign due to 400 error: ${objectId}`);
        DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
        
        // Also store object ID as permanently failed to catch similar requests
        const objectFailKey = `object-${objectId}-failed`;
        DuplicateRequestChecker.markAsPermanentlyFailed(objectFailKey);
        
        // Add to the blocked campaigns list
        this.addToBlockedCampaigns(objectId);
        
        // Store this requestSignature in localStorage to persist across sessions
        try {
          const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
          if (!failedSignatures.includes(requestSignature)) {
            failedSignatures.push(requestSignature);
            localStorage.setItem('failed_insights_signatures', JSON.stringify(failedSignatures));
          }
          
          // Also log basic info about this 400 error for diagnostics
          const error400Logs = JSON.parse(localStorage.getItem('insights_400_error_logs') || '[]');
          error400Logs.push({
            timestamp: new Date().toISOString(),
            objectId,
            errorMessage: errorData.error?.message || 'Unknown 400 error',
            errorCode: errorData.error?.code,
            options: JSON.stringify(options)
          });
          localStorage.setItem('insights_400_error_logs', JSON.stringify(error400Logs.slice(-30)));
        } catch (e) {
          console.error('[INSIGHTS] Error storing failed signature in localStorage:', e);
        }
        
        // Create an error object with status code for proper handling
        const error = new Error(errorData.error?.message || 'Bad Request');
        (error as any).status = 400;
        (error as any).response = response;
        (error as any).objectId = objectId;
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
      // ENHANCED ERROR HANDLING: Special handling for 400 errors and object not found errors
      if (error instanceof Error) {
        console.error(`Error fetching insights for object ${objectId}:`, error.message);
        
        // Check for "Object does not exist" errors specifically
        if (error.message.includes('does not exist') || error.message.includes('not found')) {
          console.log(`[INSIGHTS] ✅ Permanently blocking nonexistent object: ${objectId}`);
          const objSignature = `object-${objectId}-nonexistent`;
          DuplicateRequestChecker.markAsPermanentlyFailed(objSignature);
          
          // Add to blocked campaigns list
          this.addToBlockedCampaigns(objectId);
          
          // Also mark the specific request as permanently failed
          const specificSignature = DuplicateRequestChecker.generateRequestSignature(objectId, 'insights', options);
          DuplicateRequestChecker.markAsPermanentlyFailed(specificSignature);
        }
        
        // If we get a 400 error, properly handle it and ensure we mark it
        if ((error as any).status === 400) {
          console.log(`[INSIGHTS] ✅ Permanently blocking campaign due to 400 error: ${objectId}`);
          const specificSignature = DuplicateRequestChecker.generateRequestSignature(objectId, 'insights', options);
          DuplicateRequestChecker.markAsPermanentlyFailed(specificSignature);
          
          // Add to the blocked campaigns list
          this.addToBlockedCampaigns(objectId);
        }
      }
      
      InsightsThrottling.checkErrorForRateLimit(error);
      throw error;
    }
  }

  /**
   * Add a campaign ID to the blocked campaigns list
   */
  private static addToBlockedCampaigns(campaignId: string): void {
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
      if (!blockedCampaigns.includes(campaignId)) {
        blockedCampaigns.push(campaignId);
        localStorage.setItem(this.BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
        console.log(`[INSIGHTS] ✅ Permanently blocked campaign: ${campaignId}`);
      }
    } catch (e) {
      console.error('[INSIGHTS] Error adding to blocked campaigns:', e);
    }
  }
}


/**
 * Handles processing of API responses and errors for insights
 */
import { InsightFilterOptions } from '../types';
import { DuplicateRequestChecker } from '../throttling/duplicateChecker';
import { InsightsThrottling } from '../throttling/InsightsThrottling';
import { CampaignBlockingService } from './CampaignBlockingService';

export class InsightsResponseProcessor {
  /**
   * Handle error responses from the insights API
   */
  public static async handleErrorResponse(
    response: Response, 
    objectId: string, 
    requestSignature: string
  ): Promise<never> {
    const errorData = await response.json();
    console.error(`[INSIGHTS] 400 Error response:`, errorData);
    
    // STRICT BLOCKING: Always mark 400 errors as permanent failures and block the campaign ID
    console.log(`[INSIGHTS] ✅ Permanently blocking campaign due to 400 error: ${objectId}`);
    DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
    
    // Also store object ID as permanently failed to catch similar requests
    const objectFailKey = `object-${objectId}-failed`;
    DuplicateRequestChecker.markAsPermanentlyFailed(objectFailKey);
    
    // Add to the blocked campaigns list IMMEDIATELY
    CampaignBlockingService.blockCampaign(objectId);
    
    // Store this requestSignature in localStorage to persist across sessions
    try {
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      if (!failedSignatures.includes(requestSignature)) {
        failedSignatures.push(requestSignature);
        localStorage.setItem('failed_insights_signatures', JSON.stringify(failedSignatures));
      }
      
      // Also add the object failure key to failed signatures for easier checking
      if (!failedSignatures.includes(objectFailKey)) {
        failedSignatures.push(objectFailKey);
        localStorage.setItem('failed_insights_signatures', JSON.stringify(failedSignatures));
      }
      
      // Also log basic info about this 400 error for diagnostics
      try {
        const error400Logs = JSON.parse(localStorage.getItem('insights_400_error_logs') || '[]');
        error400Logs.push({
          timestamp: new Date().toISOString(),
          objectId,
          errorMessage: errorData.error?.message || 'Unknown 400 error',
          errorCode: errorData.error?.code,
        });
        localStorage.setItem('insights_400_error_logs', JSON.stringify(error400Logs.slice(-30)));
        
        // Also add to 400 failures log for cross-checking
        const failures400 = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
        failures400.push({
          timestamp: new Date().toISOString(),
          campaignId: objectId,
          error: errorData.error?.message || 'Unknown 400 error'
        });
        localStorage.setItem('insights_400_failures', JSON.stringify(failures400.slice(-30)));
      } catch (innerError) {
        console.error('[INSIGHTS] Error storing 400 error logs:', innerError);
      }
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
  
  /**
   * Handle fetch errors for insights API
   */
  public static handleFetchError(
    error: any, 
    objectId: string,
    options: InsightFilterOptions
  ): never {
    // ENHANCED ERROR HANDLING: Special handling for 400 errors and object not found errors
    if (error instanceof Error) {
      console.error(`Error fetching insights for object ${objectId}:`, error.message);
      
      // Check for "Object does not exist" errors specifically
      if (error.message.includes('does not exist') || error.message.includes('not found')) {
        console.log(`[INSIGHTS] ✅ Permanently blocking nonexistent object: ${objectId}`);
        const objSignature = `object-${objectId}-nonexistent`;
        DuplicateRequestChecker.markAsPermanentlyFailed(objSignature);
        
        // Add to blocked campaigns list IMMEDIATELY
        CampaignBlockingService.blockCampaign(objectId);
        
        // Also mark the specific request as permanently failed
        const specificSignature = DuplicateRequestChecker.generateRequestSignature(objectId, 'insights', options);
        DuplicateRequestChecker.markAsPermanentlyFailed(specificSignature);
      }
      
      // If we get a 400 error, properly handle it and ensure we mark it
      if ((error as any).status === 400) {
        console.log(`[INSIGHTS] ✅ Permanently blocking campaign due to 400 error: ${objectId}`);
        const specificSignature = DuplicateRequestChecker.generateRequestSignature(objectId, 'insights', options);
        DuplicateRequestChecker.markAsPermanentlyFailed(specificSignature);
        
        // Add to the blocked campaigns list IMMEDIATELY
        CampaignBlockingService.blockCampaign(objectId);
      }
    }
    
    InsightsThrottling.checkErrorForRateLimit(error);
    throw error;
  }
}

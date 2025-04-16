
import { ErrorHandler } from '../../../error/errorHandler';
import { ErrorStorage } from '../../../error/errorStorage';

export class ResponseHandler {
  /**
   * Process the API response and extract campaign data
   */
  public static async processCampaignResponse(response: Response): Promise<any[]> {
    if (!response.ok) {
      return ErrorHandler.handleErrorResponse(response);
    }
    
    try {
      // Get response text first to inspect and debug
      const responseText = await response.text();
      console.log('[CAMPAIGN RESPONSE] Response received, length:', responseText.length);
      
      let data;
      try {
        // Parse JSON from text - if this fails, we'll catch it
        data = JSON.parse(responseText);
        
        // Log the raw response data
        console.log('[CAMPAIGN RESPONSE] Raw response data:', data);
        
        // Store raw response for debugging
        ErrorStorage.storeRawSuccessResponse(data);
      } catch (parseError) {
        console.error('[CAMPAIGN RESPONSE] Failed to parse response as JSON:', parseError);
        throw new Error('Invalid JSON response from Meta API');
      }
      
      // Validate data structure, but don't throw errors - return empty array instead
      if (!data) {
        console.error('[CAMPAIGN RESPONSE] Response data is null or undefined');
        return [];
      }
      
      // Check if data.data exists before using it
      if (!data.data) {
        console.error('[CAMPAIGN RESPONSE] Response missing data array:', data);
        // Return empty array
        return [];
      }
      
      if (!Array.isArray(data.data)) {
        console.error('[CAMPAIGN RESPONSE] data.data is not an array:', data.data);
        // If data.data exists but isn't an array, try to convert it to an array
        if (data.data) {
          return [data.data];
        }
        return [];
      }
      
      // Check for empty campaign objects
      if (data.data.length > 0) {
        const emptyObjects = data.data.filter(item => 
          typeof item === 'object' && 
          item !== null && 
          Object.keys(item).length === 0
        ).length;
        
        if (emptyObjects > 0) {
          console.warn(`⚠️ Meta API returned ${emptyObjects}/${data.data.length} empty campaign objects. Possible permissions or token issue.`);
        }
      }
      
      // Always return the data array, even if empty
      return data.data;
    } catch (error) {
      console.error('[CAMPAIGN RESPONSE] Error processing response:', error);
      
      // Store error for debugging
      ErrorStorage.storeRawErrorResponse({
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Return empty array instead of throwing
      return [];
    }
  }
}

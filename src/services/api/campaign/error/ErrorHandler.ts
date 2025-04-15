
import { ErrorStorage } from './errorStorage';

export class ErrorHandler {
  /**
   * Handle error responses from Meta API
   */
  public static async handleErrorResponse(response: Response): Promise<never> {
    const errorText = await response.text();
    console.error(`[CAMPAIGN FETCH] API Error (${response.status}):`, errorText);
    
    let errorMessage: string;
    let errorDetails: any = {};
    
    try {
      // Try to parse as JSON
      const errorJson = JSON.parse(errorText);
      ErrorStorage.storeRawErrorResponse(errorJson);
      
      if (errorJson.error) {
        errorMessage = errorJson.error.message || `API Error: ${response.status}`;
        errorDetails = errorJson.error;
        
        // Check for specific error codes and provide better error messages
        if (errorJson.error.code === 190) {
          errorMessage = 'Your access token has expired or is invalid. Please reconnect your account.';
          // Clear invalid token
          localStorage.removeItem('meta_access_token');
        } else if (errorJson.error.code === 4 || errorJson.error.code === 17 || errorJson.error.code === 32) {
          errorMessage = `Rate limit reached: ${errorJson.error.message}. Please wait before trying again.`;
        }
      } else {
        errorMessage = `API Error: ${response.status}`;
        errorDetails = errorJson;
      }
    } catch (parseError) {
      // If not valid JSON, use the raw error text
      errorMessage = `API Error (${response.status}): ${errorText.substring(0, 100)}`;
      ErrorStorage.storeRawErrorResponse({ raw: errorText });
    }

    const error = new Error(errorMessage);
    (error as any).details = errorDetails;
    (error as any).status = response.status;
    throw error;
  }
}

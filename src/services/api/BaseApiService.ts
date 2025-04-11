
/**
 * Base service with common API functionality
 */
export class BaseApiService {
  protected static readonly API_VERSION = 'v17.0';
  protected static readonly BASE_URL = 'https://graph.facebook.com';

  /**
   * Handle API errors consistently
   */
  protected static handleApiError(error: any, context: string): never {
    console.error(`Error in ${context}:`, error);
    throw error instanceof Error 
      ? error 
      : new Error(`${context} failed: ${error}`);
  }

  /**
   * Process API response and handle common error patterns
   */
  protected static async processApiResponse(response: Response, context: string) {
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${context} Error:`, errorText);
      
      // Create detailed error message based on status code
      let detailedError = `Failed to ${context}: ${response.status} ${response.statusText}`;
      
      if (response.status === 400) {
        detailedError += ". This usually indicates an invalid token format or expired token.";
      } else if (response.status === 401 || response.status === 403) {
        detailedError += ". This indicates permission issues. Make sure your token has the required permissions.";
      }
      
      throw new Error(detailedError);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error(`${context} Error Response:`, data.error);
      
      // Provide more helpful error messages based on common error codes
      if (data.error.code === 190) {
        throw new Error('Token has expired or is invalid. Please generate a new token.');
      } else if (data.error.code === 200 || data.error.code === 10) {
        throw new Error('Permission error: Your token needs the required permissions.');
      } else {
        throw new Error(data.error.message || `Failed to ${context}`);
      }
    }
    
    return data;
  }

  /**
   * Validate token format before making requests
   */
  protected static validateToken(token: string, context: string): void {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error(`Invalid access token provided for ${context}`);
    }
    
    // Log token length to help identify token issues (without exposing the token)
    console.log(`Token validation for ${context}: ${token.length} characters, starts with ${token.substring(0, 4)}...`);
  }
}

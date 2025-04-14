/**
 * Base service with common API functionality
 */
export class BaseApiService {
  protected static readonly API_VERSION = 'v17.0';
  protected static readonly BASE_URL = 'https://graph.facebook.com';
  
  // Store the most recent response headers for rate limit monitoring
  public static lastResponseHeaders: Record<string, string> = {};

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
    // Store headers for rate limit monitoring
    this.captureResponseHeaders(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${context} Error:`, errorText);
      
      try {
        // Try to parse as JSON first to get detailed error info
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          const errorCode = errorJson.error.code;
          let detailedError = `Failed to ${context}: Error ${errorCode} - ${errorJson.error.message}`;
          
          // Add helpful information based on common error codes
          if (errorCode === 190) {
            // Token expired error
            localStorage.removeItem('meta_access_token'); // Clear invalid token
            detailedError += ". Your access token has expired. Please reconnect your account.";
          } else if (errorCode === 200 || errorCode === 10) {
            detailedError += ". This is a permissions issue. Your token needs ads_read and ads_management permissions.";
          } else if (errorCode === 294) {
            detailedError += ". You need to be an admin of the ad account to perform this action.";
          } else if (errorCode === 2601) {
            detailedError += ". This app has not completed App Review for the requested permissions.";
          } else if (response.status === 403) {
            detailedError += ". You don't have sufficient permissions to access this resource.";
          }
          
          throw new Error(detailedError);
        }
      } catch (parseError) {
        // If it's not valid JSON, use the raw error text
      }
      
      // Create detailed error message based on status code
      let detailedError = `Failed to ${context}: ${response.status} ${response.statusText}`;
      
      if (response.status === 400) {
        // Clear invalid token on 400 errors
        localStorage.removeItem('meta_access_token');
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
        // Clear invalid token
        localStorage.removeItem('meta_access_token');
        throw new Error('Token has expired or is invalid. Please generate a new token.');
      } else if (data.error.code === 200 || data.error.code === 10) {
        throw new Error('Permission error: Your token needs ads_read and ads_management permissions. Using a System User token is recommended for ad account access.');
      } else if (data.error.code === 294) {
        throw new Error('Permission error: You need to be an admin of the ad account to perform this action.');
      } else if (data.error.code === 2601) {
        throw new Error('This app has not completed App Review for the requested permissions. During development, use a System User token instead.');
      } else if (data.error.code === 4 || data.error.code === 17 || data.error.code === 32 ||
                (data.error.code >= 80000 && data.error.code <= 80014)) {
        // Rate limit errors
        throw new Error(`Rate limit reached: ${data.error.message || 'Too many requests'}. Please wait and try again later.`);
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
    if (!token || typeof token !== 'string') {
      throw new Error(`No access token provided for ${context}`);
    }
    
    // Clean the token
    const cleanedToken = token.trim();
    
    if (cleanedToken === '') {
      throw new Error(`Empty access token provided for ${context}`);
    }
    
    // Meta tokens are typically very long
    if (cleanedToken.length < 50) {
      throw new Error(`Token appears to be invalid (too short) for ${context}`);
    }
    
    // Check for common token format issues
    if (cleanedToken.includes(' ') || cleanedToken.includes('\n')) {
      throw new Error(`Token contains whitespace characters which may cause API errors for ${context}`);
    }
    
    // Log token length to help identify token issues (without exposing the token)
    console.log(`Token validation for ${context}: ${cleanedToken.length} characters, starts with ${cleanedToken.substring(0, 4)}...`);
  }
  
  /**
   * Capture response headers for rate limit monitoring
   */
  protected static captureResponseHeaders(response: Response): void {
    // Store important headers for rate limit monitoring
    const headersToCapture = [
      'x-app-usage',
      'x-business-use-case-usage',
      'x-ad-account-usage',
      'x-fb-debug',
      'x-fb-trace-id'
    ];
    
    this.lastResponseHeaders = {}; // Reset
    
    headersToCapture.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        this.lastResponseHeaders[header] = value;
      }
    });
    
    // Check for rate limit headers and log them
    if (this.lastResponseHeaders['x-app-usage'] || 
        this.lastResponseHeaders['x-business-use-case-usage'] || 
        this.lastResponseHeaders['x-ad-account-usage']) {
      console.log('Meta API rate limit headers:', this.lastResponseHeaders);
    }
  }
}

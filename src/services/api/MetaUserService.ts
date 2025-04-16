
import { BaseApiService } from './BaseApiService';

// Define return type for user data that accounts for both success and fallback cases
export interface MetaUserData {
  name: string;
  email?: string;
  picture?: string;
  isFallback?: boolean;
  error?: boolean;
  status?: number;
  message?: string;
}

export class MetaUserService extends BaseApiService {
  /**
   * Fetch user data using a Meta access token
   */
  public static async fetchUserData(token: string): Promise<MetaUserData> {
    try {
      console.log('Fetching Meta user data...');
      this.validateToken(token, 'fetchUserData');
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me?fields=id,name,email,picture&access_token=${token}`
      );
      
      const data = await this.processApiResponse(response, 'fetchUserData');

      console.log('Meta user data fetched successfully:', { name: data.name, email: data.email });
      
      return {
        name: data.name,
        email: data.email,
        picture: data.picture?.data.url
      };
    } catch (error) {
      return this.handleUserApiError(error, 'fetchUserData');
    }
  }
  
  /**
   * Process an API response, checking for errors
   */
  protected static async processApiResponse(response: Response, method: string) {
    if (!response.ok) {
      // Special handling for 403 errors which indicate permission issues
      if (response.status === 403) {
        console.warn(`[${method}] Got 403 Forbidden error - limited permissions`);
        const errorText = await response.text();
        console.error(`[${method}] Error response:`, errorText);
        
        // Return fallback data with error info
        return {
          isFallback: true,
          name: 'Meta User',
          error: true,
          status: 403,
          message: `Permission denied: ${errorText.substring(0, 100)}...`
        };
      }
      
      const errorText = await response.text();
      console.error(`[${method}] API Error (${response.status}):`, errorText);
      throw new Error(`API Error (${response.status}): ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
    }
    
    return data;
  }
  
  /**
   * Handle API errors and return fallback data
   * Using a different method name to avoid conflict with parent class
   */
  protected static handleUserApiError(error: unknown, method: string): MetaUserData {
    console.error(`[${method}] Error:`, error);
    
    return {
      isFallback: true,
      name: 'Meta User',
      error: true,
      message: error instanceof Error ? error.message : 'Failed to fetch user data'
    };
  }
  
  /**
   * Validate token format
   */
  private static validateToken(token: string, method: string) {
    if (!token || token.length < 20) {
      throw new Error('Invalid token format');
    }
  }
}

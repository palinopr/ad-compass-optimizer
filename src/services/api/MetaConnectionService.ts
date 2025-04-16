
import { BaseApiService } from './BaseApiService';

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: string;
  permissionsWarning?: string;
  userId?: string;
  userName?: string;
  hasAdAccess?: boolean;
  limitedProfile?: boolean;  // Added this field to the interface
  exception?: unknown;
}

export class MetaConnectionService extends BaseApiService {
  public static isMockMode(): boolean {
    return localStorage.getItem("USE_MOCK_MODE") === "true";
  }

  public static async testConnection(token: string): Promise<ConnectionTestResult> {
    try {
      console.log('Testing Meta API connection...');
      
      // Check for mock mode first
      if (this.isMockMode()) {
        console.log('🎭 Mock mode detected - returning simulated connection data');
        // Return a complete mock object that matches ConnectionTestResult interface
        // Including all properties that might be accessed in error scenarios
        return {
          success: true,
          userId: 'mock_user_123',
          userName: 'Mock User',
          hasAdAccess: true,
          limitedProfile: false,
          error: undefined,  // Add this to avoid TypeScript errors
          details: undefined, // Add this for completeness
          permissionsWarning: undefined // Add this for completeness
        };
      }
      
      // Perform a basic validation check on the token format
      if (!token || token.length < 20) {
        return {
          success: false,
          error: 'Token appears to be invalid or too short',
          details: 'Please check that you have pasted the entire token correctly. Meta tokens are typically long strings.'
        };
      }

      console.log(`Testing connection with token: ${token.substring(0, 4)}... (${token.length} chars)`);
      
      // First try a basic validation request to check if the token is valid at all
      console.log('[META CONNECTION] Making /me request to validate token');
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me?access_token=${token}`
      );
      
      // Store the token format for comparison debugging
      localStorage.setItem('last_token_format', JSON.stringify({
        length: token.length,
        prefix: token.substring(0, 4),
        suffix: token.substring(token.length - 4),
        timestamp: new Date().toISOString()
      }));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meta API Connection Test Failed on /me endpoint:', errorText);
        
        // Store the error response for diagnostics
        localStorage.setItem('last_me_request_error', errorText);
        
        let errorMessage = `Connection failed: ${response.status}`;
        let errorDetails = errorText;
        
        try {
          // Try to parse JSON error for better details
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error.message || errorMessage;
            
            // Specific error type checks
            if (errorJson.error.code === 190) {
              errorDetails = "Invalid or expired access token. Please generate a new token.";
            } else if (errorJson.error.code === 104) {
              errorDetails = "Unsupported request or API version issue.";
            }
          }
        } catch (e) {
          // If parsing fails, use the raw error text
        }
        
        // Special handling for 403 errors - try ad account access instead
        if (response.status === 403) {
          console.log('[META CONNECTION] Got 403 on /me, trying ad accounts as fallback...');
          
          try {
            const adAccountsResponse = await fetch(
              `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status&limit=1&access_token=${token}`
            );
            
            const adAccountsData = await adAccountsResponse.json();
            console.log('[META CONNECTION] Ad accounts test response:', adAccountsData);
            
            if (!adAccountsData.error && adAccountsData.data && adAccountsData.data.length > 0) {
              console.log('[META CONNECTION] Ad access OK but /me failed - proceeding with limited user data');
              
              // We can still use this token for ads but not for user data
              return {
                success: true,
                permissionsWarning: 'Token has ad account access but limited profile permissions. Some profile features will be restricted.',
                userId: 'restricted',
                userName: 'Meta User',
                hasAdAccess: true,
                limitedProfile: true
              };
            }
          } catch (adError) {
            console.error('[META CONNECTION] Error checking ad account access:', adError);
          }
        }
        
        // Provide more helpful guidance based on status code
        if (response.status === 400) {
          errorMessage = 'Invalid token format';
          errorDetails = 'The token appears to be malformed. Please ensure you copied the entire token correctly.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed';
          errorDetails = 'Your token has expired. Please generate a new System User token.';
        } else if (response.status === 403) {
          errorMessage = 'Permission denied';
          errorDetails = 'Your token may have insufficient permissions. Please generate a new token with ads_read and ads_management permissions.';
        }
        
        return {
          success: false,
          error: errorMessage,
          details: errorDetails
        };
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Meta API Connection Test Error:', data.error);
        return {
          success: false,
          error: data.error.message || 'Connection failed',
          details: JSON.stringify(data.error)
        };
      }
      
      console.log('Meta API Connection Test Successful:', data);
      
      // Now check if the token has the required permissions by testing ad account access
      try {
        const adAccountsResponse = await fetch(
          `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status,currency&limit=1&access_token=${token}`
        );
        
        const adAccountsData = await adAccountsResponse.json();
        console.log('Ad accounts test response:', adAccountsData);
        
        if (adAccountsData.error) {
          // Specifically check for permission related errors
          if (adAccountsData.error.code === 200 || 
              adAccountsData.error.code === 10 || 
              adAccountsData.error.code === 294) {
            return {
              success: true,
              permissionsWarning: 'Connected to Meta, but your token lacks required ad account permissions (ads_read, ads_management). For full access, you need a token with these permissions.',
              userId: data.id,
              userName: data.name,
              hasAdAccess: false,
              limitedProfile: false
            };
          }
          
          return {
            success: true,
            permissionsWarning: adAccountsData.error.message || 'Connected to Meta, but could not access ad accounts.',
            userId: data.id,
            userName: data.name,
            hasAdAccess: false,
            limitedProfile: false
          };
        }
        
        return {
          success: true,
          userId: data.id,
          userName: data.name,
          hasAdAccess: true,
          limitedProfile: false
        };
      } catch (permError) {
        console.error('Error checking permissions:', permError);
        // Still return success since the basic connection worked
        return {
          success: true,
          permissionsWarning: 'Connected to Meta, but could not verify ad account access due to a technical error.',
          userId: data.id,
          userName: data.name,
          hasAdAccess: false,
          limitedProfile: false
        };
      }
      
    } catch (error) {
      console.error('Meta API Connection Test Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        exception: error
      };
    }
  }
}

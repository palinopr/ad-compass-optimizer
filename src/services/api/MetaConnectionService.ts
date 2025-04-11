
import { BaseApiService } from './BaseApiService';

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: string;
  permissionsWarning?: string;
  userId?: string;
  userName?: string;
  hasAdAccess?: boolean;
  exception?: unknown;
}

export class MetaConnectionService extends BaseApiService {
  /**
   * Test Meta API connection with the provided token
   */
  public static async testConnection(token: string): Promise<ConnectionTestResult> {
    try {
      console.log('Testing Meta API connection...');
      
      // Perform a basic validation check on the token format
      if (!token || token.length < 10) {
        return {
          success: false,
          error: 'Token appears to be invalid or too short',
          details: 'Please check that you have pasted the entire token correctly'
        };
      }

      console.log(`Testing connection with token: ${token.substring(0, 4)}... (${token.length} chars)`);
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me?access_token=${token}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meta API Connection Test Failed:', errorText);
        
        let errorMessage = `Connection failed: ${response.status}`;
        let errorDetails = errorText;
        
        // Provide more helpful guidance based on status code
        if (response.status === 400) {
          errorMessage += ' - Invalid token format';
          errorDetails = 'The token appears to be malformed. Please ensure you copied the entire token correctly.';
        } else if (response.status === 401 || response.status === 403) {
          errorMessage += ' - Authentication failed';
          errorDetails = 'Your token may be expired or have insufficient permissions. Please generate a new System User token with ads_read and ads_management permissions.';
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
              hasAdAccess: false
            };
          }
          
          return {
            success: true,
            permissionsWarning: adAccountsData.error.message || 'Connected to Meta, but could not access ad accounts.',
            userId: data.id,
            userName: data.name,
            hasAdAccess: false
          };
        }
        
        return {
          success: true,
          userId: data.id,
          userName: data.name,
          hasAdAccess: true
        };
      } catch (permError) {
        console.error('Error checking permissions:', permError);
        // Still return success since the basic connection worked
        return {
          success: true,
          permissionsWarning: 'Connected to Meta, but could not verify ad account access due to a technical error.',
          userId: data.id,
          userName: data.name,
          hasAdAccess: false
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

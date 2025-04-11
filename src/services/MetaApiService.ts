
export class MetaApiService {
  /**
   * Fetch user data using a Meta access token
   */
  public static async fetchUserData(token: string) {
    try {
      console.log('Fetching Meta user data...');
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meta API Error (fetchUserData):', errorText);
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Meta API Error Response:', data.error);
        throw new Error(data.error.message || 'Failed to fetch user data');
      }

      console.log('Meta user data fetched successfully:', { name: data.name, email: data.email });
      
      return {
        name: data.name,
        email: data.email,
        picture: data.picture?.data.url
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  /**
   * Fetch ad accounts for the authenticated user
   */
  public static async fetchAdAccounts(token: string) {
    try {
      console.log('Fetching Meta ad accounts...');
      
      // Validate token before making request
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('Invalid access token provided');
      }
      
      // Debug: Log token length to help identify token issues (without exposing the token)
      console.log(`Token validation: ${token.length} characters, starts with ${token.substring(0, 4)}...`);
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meta API Error (fetchAdAccounts):', errorText);
        
        // Add more detailed error information
        let detailedError = `Failed to fetch ad accounts: ${response.status} ${response.statusText}`;
        
        // For common errors, provide more guidance
        if (response.status === 400) {
          detailedError += ". This usually indicates an invalid token format or expired token.";
        } else if (response.status === 401 || response.status === 403) {
          detailedError += ". This indicates permission issues. Make sure your token has ads_read and ads_management permissions.";
        }
        
        throw new Error(detailedError);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Meta API Error Response:', data.error);
        
        // Provide more helpful error messages based on common error codes
        if (data.error.code === 190) {
          throw new Error('Token has expired or is invalid. Please generate a new token.');
        } else if (data.error.code === 200 || data.error.code === 10) {
          throw new Error('Permission error: Your token needs ads_read and ads_management permissions.');
        } else {
          throw new Error(data.error.message || 'Failed to fetch ad accounts');
        }
      }

      // Log successful response
      console.log('Ad accounts fetched successfully:', data);
      console.log(`Found ${data.data?.length || 0} ad accounts`);
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      throw error;
    }
  }

  /**
   * Test Meta API connection with the provided token
   */
  public static async testConnection(token: string) {
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
        `https://graph.facebook.com/v18.0/me?access_token=${token}`
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
          `https://graph.facebook.com/v18.0/me/adaccounts?limit=1&access_token=${token}`
        );
        
        const adAccountsData = await adAccountsResponse.json();
        
        if (adAccountsData.error) {
          return {
            success: true,
            permissionsWarning: 'Connected to Meta, but your token may not have required ad account permissions.',
            userId: data.id,
            userName: data.name
          };
        }
        
        return {
          success: true,
          userId: data.id,
          userName: data.name,
          hasAdAccess: true
        };
      } catch (permError) {
        // Still return success since the basic connection worked
        return {
          success: true,
          permissionsWarning: 'Connected to Meta, but could not verify ad account access.',
          userId: data.id,
          userName: data.name
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

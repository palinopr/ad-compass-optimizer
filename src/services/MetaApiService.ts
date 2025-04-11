
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
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meta API Error (fetchAdAccounts):', errorText);
        throw new Error(`Failed to fetch ad accounts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Meta API Error Response:', data.error);
        throw new Error(data.error.message || 'Failed to fetch ad accounts');
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
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${token}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meta API Connection Test Failed:', errorText);
        return {
          success: false,
          error: `Connection failed: ${response.status} ${response.statusText}`,
          details: errorText
        };
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Meta API Connection Test Error:', data.error);
        return {
          success: false,
          error: data.error.message || 'Connection failed',
          details: data.error
        };
      }
      
      console.log('Meta API Connection Test Successful:', data);
      return {
        success: true,
        userId: data.id,
        userName: data.name
      };
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

import { validateTokenFormat } from '@/utils/tokenUtils';
import { MetaApiService } from '@/services/MetaApiService';

interface UseUserDataOptions {
  onError: (errorMessage: string) => void;
}

export function useUserData({ onError }: UseUserDataOptions) {
  const fetchUserData = async (token: string) => {
    try {
      const validation = validateTokenFormat(token);
      if (!validation.valid) {
        throw new Error(validation.reason || "Invalid token format");
      }
      
      console.log(`Testing token validity: ${token.substring(0, 4)}...${token.substring(token.length - 4)} (length: ${token.length})`);
      
      // First test the connection to check if the token is valid
      const connectionTest = await MetaApiService.testConnection(token);
      
      if (!connectionTest.success) {
        throw new Error(connectionTest.error || 'Failed to validate token');
      }
      
      if (connectionTest.userId && connectionTest.userName) {
        console.log('Using user data from connection test');
        return {
          id: connectionTest.userId,
          name: connectionTest.userName,
          hasAdAccess: connectionTest.hasAdAccess || false
        };
      }
      
      console.log('Token test passed, fetching user data');
      
      try {
        const response = await fetch(
          `https://graph.facebook.com/v17.0/me?fields=id,name,email,picture&access_token=${token}`
        );
        
        if (!response.ok) {
          // Special handling for 403 errors
          if (response.status === 403) {
            console.warn('Got 403 on /me endpoint but continuing with limited user data');
            
            // Log the error response for debugging
            const errorText = await response.text();
            console.error('Error fetching user data:', errorText);
            localStorage.setItem('last_me_request_error', errorText);
            
            // Use connection test data as fallback
            return {
              id: connectionTest.userId || 'unknown',
              name: connectionTest.userName || 'Meta User',
              limited: true,
              error: `Profile access limited (403). ${errorText.substring(0, 100)}...`
            };
          }
          
          const errorText = await response.text();
          console.error('Error fetching user data:', errorText);
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Failed to fetch user data');
        }
        
        console.log('Successfully fetched user data');
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          picture: data.picture?.data.url
        };
      } catch (meError) {
        console.error('Error in /me endpoint, using fallback data:', meError);
        
        // If we fail on the /me endpoint but have connection test data, use that as fallback
        if (connectionTest.userId) {
          return {
            id: connectionTest.userId,
            name: connectionTest.userName || 'Meta User',
            limited: true,
            error: meError instanceof Error ? meError.message : 'Unknown error'
          };
        }
        
        // Otherwise rethrow
        throw meError;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      const errorMsg = `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onError(errorMsg);
      throw error;
    }
  };

  return {
    fetchUserData
  };
}

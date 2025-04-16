
import { Meta } from '@/types/meta';
import { MetaConnectionService } from './api/MetaConnectionService';

export class MetaApiService {
  private static BASE_URL = 'https://graph.facebook.com';
  private static API_VERSION = 'v17.0'; // Should match the version in other services
  
  static async fetchUserData(token: string): Promise<any> {
    try {
      console.log('[MetaApiService] Fetching user data...');
      
      // Validate token before making request
      if (!token || token.length < 20) {
        console.warn('[MetaApiService] Invalid token format');
        return { 
          error: true, 
          message: 'Invalid token format',
          isFallback: true
        };
      }
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me?fields=id,name,email,picture&access_token=${token}`
      );
      
      if (!response.ok) {
        // Handle 403 gracefully
        if (response.status === 403) {
          console.warn('[MetaApiService] 403 Permission denied for /me endpoint');
          
          // Store the error for diagnostics
          try {
            const errorText = await response.text();
            localStorage.setItem('last_me_request_error', errorText);
            console.log('[MetaApiService] Error details:', errorText);
            
            // Return fallback user data with error flag
            return { 
              id: localStorage.getItem('meta_user_id') || 'unknown',
              name: localStorage.getItem('meta_user_name') || 'Meta User',
              error: true, 
              status: 403,
              message: 'Permission denied for user profile access',
              isFallback: true
            };
          } catch (parseError) {
            console.error('[MetaApiService] Error parsing 403 response:', parseError);
          }
        }
        
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch user data');
      }
      
      // Cache successful user data
      if (data.id) localStorage.setItem('meta_user_id', data.id);
      if (data.name) localStorage.setItem('meta_user_name', data.name);
      
      return data;
    } catch (error) {
      console.error('[MetaApiService] Error fetching user data:', error);
      
      // Important: Return fallback user data instead of throwing
      return {
        id: localStorage.getItem('meta_user_id') || 'unknown',
        name: localStorage.getItem('meta_user_name') || 'Meta User',
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error',
        isFallback: true
      };
    }
  }

  static async testConnection(token: string): Promise<any> {
    try {
      return await MetaConnectionService.testConnection(token);
    } catch (error) {
      console.error('[MetaApiService] Error testing connection:', error);
      throw error;
    }
  }
  
  static async fetchAdAccounts(token: string): Promise<any[]> {
    try {
      console.log('[MetaApiService] Fetching ad accounts...');
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ad accounts: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch ad accounts');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('[MetaApiService] Error fetching ad accounts:', error);
      throw error;
    }
  }
}

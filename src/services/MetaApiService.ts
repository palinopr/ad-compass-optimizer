import { BaseApiService } from './api/BaseApiService';
import { MetaAdAccount } from './api/MetaAdAccountService';
import { RateLimitManager } from './api/rate-limit/RateLimitManager';

export class MetaApiService extends BaseApiService {
  // Rate limit management - forwarding from RateLimitManager
  public static isRateLimited = RateLimitManager.isRateLimited;
  public static getRateLimitInfo = RateLimitManager.getRateLimitInfo;
  public static getRateLimitTimeRemaining = RateLimitManager.getRateLimitTimeRemaining;
  public static clearRateLimit = RateLimitManager.clearRateLimit;
  public static overrideRateLimit = RateLimitManager.overrideRateLimit;
  public static isRateLimitOverridden = RateLimitManager.isRateLimitOverridden;

  public static async testConnection(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.validateToken(token, 'testConnection');
      const response = await fetch(`${this.BASE_URL}/${this.API_VERSION}/me?access_token=${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        const error = errorData?.error || {};
        console.error('Meta API Connection Test Failed:', {
          message: error.message || 'Connection test failed',
          code: error.code,
          type: error.type,
          status: response.status
        });
        return { success: false, error: error.message || 'Connection test failed' };
      }

      const data = await response.json();
      console.log('Meta API Connection Test Successful:', data);
      return { success: true };
    } catch (error: any) {
      console.error('Error during Meta API connection test:', error);
      return { success: false, error: error.message || 'An error occurred during the connection test' };
    }
  }

  public static async fetchAdAccounts(token: string): Promise<MetaAdAccount[]> {
    try {
      this.validateToken(token, 'fetchAdAccounts');
      
      // Use GET request with proper fields
      const url = `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`;
      
      console.log('[AD ACCOUNT FETCH] Request URL:', url.replace(token, 'REDACTED'));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = errorData?.error || {};
        console.error('Meta API Error fetching ad accounts:', {
          message: error.message || `HTTP error ${response.status}`,
          code: error.code,
          type: error.type,
          status: response.status
        });
        throw new Error(error.message || 'Failed to fetch ad accounts');
      }

      const data = await response.json();
      const accounts: MetaAdAccount[] = data.data || [];

      console.log('[AD ACCOUNT FETCH] Total accounts fetched:', accounts.length);
      accounts.forEach((acct, i) => {
        console.log(`[AD ACCOUNT ${i}]`, acct.id, acct.name);
      });

      if (accounts.length === 0) {
        console.warn('[AD ACCOUNT FETCH] ⚠️ No ad accounts returned from Meta API');
      }

      return accounts;
    } catch (error: any) {
      console.error('[AD ACCOUNT FETCH] Error fetching ad accounts:', error);
      throw error;
    }
  }

  public static async fetchAdAccountDetails(token: string, accountId: string): Promise<MetaAdAccount> {
    try {
      this.validateToken(token, 'fetchAdAccountDetails');
      
      // Ensure accountId has act_ prefix
      const formattedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
      
      const url = `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}?fields=name,account_id,account_status,currency&access_token=${token}`;
      
      console.log('[AD ACCOUNT FETCH] Request URL for details:', url.replace(token, 'REDACTED'));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = errorData?.error || {};
        console.error(`Meta API Error fetching ad account details for ${accountId}:`, {
          message: error.message || `HTTP error ${response.status}`,
          code: error.code,
          type: error.type,
          status: response.status
        });
        throw new Error(error.message || `Failed to fetch ad account details for ${accountId}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`Error fetching ad account details for ${accountId}:`, error);
      throw error;
    }
  }

  public static async fetchBusinessManagers(token: string): Promise<any[]> {
    try {
      this.validateToken(token, 'fetchBusinessManagers');
      
      const url = `${this.BASE_URL}/${this.API_VERSION}/me/businesses?access_token=${token}`;
      
      console.log('[BUSINESS MANAGERS] Request URL:', url.replace(token, 'REDACTED'));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = errorData?.error || {};
        console.error('Meta API Error fetching business managers:', {
          message: error.message || `HTTP error ${response.status}`,
          code: error.code,
          type: error.type,
          status: response.status
        });
        throw new Error(error.message || 'Failed to fetch business managers');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      console.error('[BUSINESS MANAGERS] Error fetching business managers:', error);
      throw error;
    }
  }

  public static async fetchAdAccountsForBusiness(token: string, businessId: string): Promise<any[]> {
    try {
      this.validateToken(token, 'fetchAdAccountsForBusiness');
      
      const url = `${this.BASE_URL}/${this.API_VERSION}/${businessId}/client_ad_accounts?fields=name,account_id,account_status,currency&access_token=${token}`;
      
      console.log('[AD ACCOUNTS] Business Request URL:', url.replace(token, 'REDACTED'));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = errorData?.error || {};
        console.error('Meta API Error fetching business ad accounts:', {
          message: error.message || `HTTP error ${response.status}`,
          code: error.code,
          type: error.type,
          status: response.status
        });
        throw new Error(error.message || `Failed to fetch ad accounts for business ${businessId}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      console.error(`[AD ACCOUNTS] Error fetching ad accounts for business ${businessId}:`, error);
      throw error;
    }
  }

  // Change from private to protected to match parent class
  protected static validateToken(token: string, method: string) {
    if (!token || token.length < 50) {
      console.warn(`[META API ${method}] Invalid token:`, token);
      throw new Error('Invalid Meta access token');
    }
  }
}

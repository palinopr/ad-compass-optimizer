
import { BaseApiService } from './BaseApiService';
import { MetaAdAccount } from './MetaAdAccountService';

export class MetaApiService extends BaseApiService {
  public static async testConnection(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.validateToken(token, 'testConnection');
      const response = await fetch(`${this.BASE_URL}/${this.API_VERSION}/me?access_token=${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Meta API Connection Test Failed:', errorData);
        return { success: false, error: errorData?.error?.message || 'Connection test failed' };
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
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Meta API Error fetching ad accounts:', errorData);
        throw new Error(errorData?.error?.message || 'Failed to fetch ad accounts');
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
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${accountId}?fields=name,account_id,account_status,currency&access_token=${token}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Meta API Error fetching ad account details for ${accountId}:`, errorData);
        throw new Error(errorData?.error?.message || `Failed to fetch ad account details for ${accountId}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`Error fetching ad account details for ${accountId}:`, error);
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

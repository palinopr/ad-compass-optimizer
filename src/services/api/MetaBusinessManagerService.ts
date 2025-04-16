
import { BaseApiService } from './BaseApiService';

export class MetaBusinessManagerService extends BaseApiService {
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
}

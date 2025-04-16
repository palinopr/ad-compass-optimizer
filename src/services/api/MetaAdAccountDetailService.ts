
import { BaseApiService } from './BaseApiService';
import { MetaAdAccount } from './MetaAdAccountService';

export class MetaAdAccountDetailService extends BaseApiService {
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
}

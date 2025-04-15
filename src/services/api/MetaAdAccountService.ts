
import { BaseApiService } from './BaseApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { displayApiError } from './meta-accounts/errorHandling';
import { validateAdAccountPermissions } from './meta-accounts/permissionChecker';

export interface MetaAdAccount {
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  id: string;
}

export class MetaAdAccountService extends BaseApiService {
  private static logFetchStart(token: string) {
    console.log('[AD ACCOUNT FETCH] Starting fetch...');
    console.log('[AD ACCOUNT FETCH] Endpoint:', `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts`);
  }

  public static async fetchAdAccounts(token: string): Promise<MetaAdAccount[]> {
    try {
      this.logFetchStart(token);
      this.validateToken(token, 'fetchAdAccounts');
      validateAdAccountPermissions();
      
      // Consistent use of v17.0 for Meta API
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      console.log('[AD ACCOUNT FETCH] Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorJson = await response.json();
        const errorMsg = errorJson?.error?.message || `HTTP error ${response.status}`;
        displayApiError(errorMsg, JSON.stringify(errorJson?.error || errorJson, null, 2));
        throw new Error(errorMsg);
      }
      
      const json = await response.json();
      console.log('[AD ACCOUNT FETCH] Raw Response:', json);
      
      if (!json.data || !Array.isArray(json.data)) {
        throw new Error('Invalid response format from Meta API');
      }
      
      // Map the response to our MetaAdAccount format
      return json.data.map((account: any) => ({
        name: account.name || 'Unnamed Account',
        account_id: account.account_id,
        account_status: account.account_status || 0,
        currency: account.currency,
        id: account.id
      }));
    } catch (error) {
      return this.handleApiError(error, 'fetchAdAccounts');
    }
  }

  public static async fetchAdAccountDetails(token: string, accountId: string): Promise<MetaAdAccount> {
    try {
      this.validateToken(token, 'fetchAdAccountDetails');
      
      // Ensure accountId has act_ prefix
      const formattedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      if (!response.ok) {
        const errorJson = await response.json();
        throw {
          message: errorJson?.error?.message || `HTTP error ${response.status}`,
          status: response.status,
          data: errorJson
        };
      }
      
      const data = await response.json();
      return {
        name: data.name || 'Unnamed Account',
        account_id: data.account_id,
        account_status: data.account_status || 0,
        currency: data.currency,
        id: data.id
      };
    } catch (error) {
      return this.handleApiError(error, 'fetchAdAccountDetails');
    }
  }
}


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
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      console.log('[AD ACCOUNT FETCH] Status:', response.status, response.statusText);
      
      const json = await response.json();
      console.log('[AD ACCOUNT FETCH] Raw Response:', json);
      
      if (!response.ok) {
        const errorMsg = json?.error?.message || 'Unknown error while fetching ad accounts';
        displayApiError(errorMsg, JSON.stringify(json?.error || json, null, 2));
        throw new Error(errorMsg);
      }
      
      return json?.data || [];
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
      
      const data = await this.processApiResponse(response, 'fetchAdAccountDetails');
      return data;
    } catch (error) {
      return this.handleApiError(error, 'fetchAdAccountDetails');
    }
  }
}

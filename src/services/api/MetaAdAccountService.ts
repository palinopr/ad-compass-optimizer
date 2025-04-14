
import { BaseApiService } from './BaseApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { displayApiError } from './meta-accounts/errorHandling';
import { validateAdAccountPermissions, validateBusinessPermissions } from './meta-accounts/permissionChecker';
import { parseApiResponse } from './meta-accounts/responseParser';

export interface MetaAdAccount {
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  id: string;
}

export class MetaAdAccountService extends BaseApiService {
  private static logFetchStart(token: string) {
    console.log('[AD ACCOUNT FETCH] Token:', token ? token.substring(0, 10) + '...' : '❌ NOT FOUND');
    console.log('[AD ACCOUNT FETCH] Starting fetch with token:', token?.substring(0, 8) + '...');
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
      
      const json = await parseApiResponse(response);
      console.log('[AD ACCOUNT FETCH] Parsed JSON:', json);
      
      if (!response.ok) {
        const errorMsg = json?.error?.message || 'Unknown error while fetching ad accounts';
        const errorDetails = JSON.stringify(json?.error || json, null, 2);
        displayApiError(errorMsg, errorDetails);
        throw new Error(errorMsg);
      }
      
      console.log('Ad accounts fetched successfully:', json);
      console.log(`Found ${json?.data?.length || 0} ad accounts`);
      
      return json?.data || [];
    } catch (error) {
      return this.handleApiError(error, 'fetchAdAccounts');
    }
  }

  public static async fetchAdAccountDetails(token: string, accountId: string): Promise<MetaAdAccount> {
    try {
      console.log(`Fetching details for ad account ${accountId}...`);
      this.validateToken(token, 'fetchAdAccountDetails');
      validateAdAccountPermissions();
      
      const formattedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${accountId}?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      const data = await this.processApiResponse(response, 'fetchAdAccountDetails');
      console.log('Ad account details fetched successfully:', data);
      
      return data;
    } catch (error) {
      return this.handleApiError(error, `fetchAdAccountDetails for ${accountId}`);
    }
  }

  public static async fetchAdAccountsForBusiness(token: string, businessId: string): Promise<MetaAdAccount[]> {
    try {
      console.log(`Fetching ad accounts for business ${businessId}...`);
      this.validateToken(token, 'fetchAdAccountsForBusiness');
      validateBusinessPermissions();
      
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${businessId}/owned_ad_accounts?fields=id,name,account_id,account_status,currency,timezone_name&access_token=${token}`
      );
      
      const data = await this.processApiResponse(response, 'fetchAdAccountsForBusiness');
      
      console.log('Business ad accounts fetched successfully:', data);
      console.log(`Found ${data.data?.length || 0} ad accounts for business ${businessId}`);
      
      return data.data || [];
    } catch (error) {
      return this.handleApiError(error, `fetchAdAccountsForBusiness for ${businessId}`);
    }
  }
}


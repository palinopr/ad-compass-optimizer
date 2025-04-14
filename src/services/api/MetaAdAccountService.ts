import { BaseApiService } from './BaseApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { META_API_CONFIG } from '@/config/socialAuth';

export interface MetaAdAccount {
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  id: string;
}

export class MetaAdAccountService extends BaseApiService {
  public static async fetchAdAccounts(token: string): Promise<MetaAdAccount[]> {
    try {
      // Verify token existence before proceeding
      console.log('[AD ACCOUNT FETCH] Token:', token ? token.substring(0, 10) + '...' : '❌ NOT FOUND');
      console.log('[AD ACCOUNT FETCH] Starting fetch with token:', token?.substring(0, 8) + '...');
      console.log('[AD ACCOUNT FETCH] Endpoint:', `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts`);
      
      this.validateToken(token, 'fetchAdAccounts');
      
      // Add permission verification
      const requiredPermissions = META_API_CONFIG.adPermissions;
      const storedPermissions = metaAuthService.getPermissions();
      
      const missingPermissions = requiredPermissions.filter(
        perm => !storedPermissions.includes(perm)
      );
      
      if (missingPermissions.length > 0) {
        console.warn(`Token lacks required permissions: ${missingPermissions.join(', ')}`);
        throw new Error(
          `Your token lacks the required permissions (${missingPermissions.join(', ')}) to access ad accounts. ` +
          `Please reconnect with the necessary permissions or use a System User Token.`
        );
      }
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      console.log('[AD ACCOUNT FETCH] Raw Response:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('[AD ACCOUNT FETCH] Response Body:', responseText);

      try {
        const json = JSON.parse(responseText);
        console.log('[AD ACCOUNT FETCH] Parsed JSON:', json);
        
        // Log successful response
        console.log('Ad accounts fetched successfully:', json);
        console.log(`Found ${json?.data?.length || 0} ad accounts`);
        
        return json?.data || [];
      } catch (err) {
        console.error('[AD ACCOUNT FETCH] ❌ Failed to parse JSON:', err);
        throw err;
      }
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      
      // Check if this is a permissions error and provide more helpful information
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('permission') || errorMessage.includes('403')) {
        console.error('This appears to be a permissions error. For ad account access, your token needs ads_read and ads_management permissions.');
        console.error('Consider using a System User token with the right permissions. Regular user tokens require app review.');
      }
      
      return this.handleApiError(error, 'fetchAdAccounts');
    }
  }

  /**
   * Fetch details for a specific ad account by ID
   */
  public static async fetchAdAccountDetails(token: string, accountId: string): Promise<MetaAdAccount> {
    try {
      console.log(`Fetching details for ad account ${accountId}...`);
      this.validateToken(token, 'fetchAdAccountDetails');
      
      // Add permission verification
      if (!metaAuthService.hasAdAccountPermissions()) {
        throw new Error(
          `Your token lacks the required permissions (ads_read, ads_management) to access ad account details. ` +
          `Please reconnect with the necessary permissions or use a System User Token.`
        );
      }
      
      // Ensure account ID has the proper format
      const formattedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${accountId}?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      const data = await this.processApiResponse(response, 'fetchAdAccountDetails');
      
      console.log('Ad account details fetched successfully:', data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching details for ad account ${accountId}:`, error);
      return this.handleApiError(error, `fetchAdAccountDetails for ${accountId}`);
    }
  }

  /**
   * Fetch ad accounts for a specific business manager
   */
  public static async fetchAdAccountsForBusiness(token: string, businessId: string): Promise<MetaAdAccount[]> {
    try {
      console.log(`Fetching ad accounts for business ${businessId}...`);
      this.validateToken(token, 'fetchAdAccountsForBusiness');
      
      // Add permission verification
      if (!metaAuthService.hasBusinessManagerPermissions()) {
        throw new Error(
          `Your token lacks the required permission (business_management) to access business manager data. ` +
          `Please reconnect with the necessary permissions or use a System User Token.`
        );
      }
      
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${businessId}/owned_ad_accounts?fields=id,name,account_id,account_status,currency,timezone_name&access_token=${token}`
      );
      
      const data = await this.processApiResponse(response, 'fetchAdAccountsForBusiness');

      // Log successful response
      console.log('Business ad accounts fetched successfully:', data);
      console.log(`Found ${data.data?.length || 0} ad accounts for business ${businessId}`);
      
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching ad accounts for business ${businessId}:`, error);
      
      // Check if this is a permissions error and provide more helpful information
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('permission') || errorMessage.includes('403')) {
        console.error('This appears to be a permissions error. For business manager access, your token needs business_management permission.');
        console.error('Consider using a System User token with the right permissions. Regular user tokens require app review.');
      }
      
      return this.handleApiError(error, `fetchAdAccountsForBusiness for ${businessId}`);
    }
  }
}

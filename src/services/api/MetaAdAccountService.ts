
import { BaseApiService } from './BaseApiService';

export interface MetaAdAccount {
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  id: string;
}

export class MetaAdAccountService extends BaseApiService {
  /**
   * Fetch ad accounts for the authenticated user
   */
  public static async fetchAdAccounts(token: string): Promise<MetaAdAccount[]> {
    try {
      console.log('Fetching Meta ad accounts...');
      this.validateToken(token, 'fetchAdAccounts');
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      
      const data = await this.processApiResponse(response, 'fetchAdAccounts');
      
      // Log successful response
      console.log('Ad accounts fetched successfully:', data);
      console.log(`Found ${data.data?.length || 0} ad accounts`);
      
      return data.data || [];
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

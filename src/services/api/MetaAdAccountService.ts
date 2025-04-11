
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
      return this.handleApiError(error, 'fetchAdAccounts');
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
      return this.handleApiError(error, `fetchAdAccountsForBusiness for ${businessId}`);
    }
  }
}

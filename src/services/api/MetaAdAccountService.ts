
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
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
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
}

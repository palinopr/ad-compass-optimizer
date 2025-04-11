
import { BaseApiService } from './BaseApiService';

export interface MetaBusinessManager {
  id: string;
  name: string;
  verification_status?: string;
  created_time?: string;
}

export class MetaBusinessService extends BaseApiService {
  /**
   * Fetch business managers for the authenticated user
   */
  public static async fetchBusinessManagers(token: string): Promise<MetaBusinessManager[]> {
    try {
      console.log('Fetching Meta business managers...');
      this.validateToken(token, 'fetchBusinessManagers');
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/me/businesses?fields=id,name,verification_status,created_time&access_token=${token}`
      );
      
      const data = await this.processApiResponse(response, 'fetchBusinessManagers');

      // Log successful response
      console.log('Business managers fetched successfully:', data);
      console.log(`Found ${data.data?.length || 0} business managers`);
      
      return data.data || [];
    } catch (error) {
      return this.handleApiError(error, 'fetchBusinessManagers');
    }
  }
}

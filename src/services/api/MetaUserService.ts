
import { BaseApiService } from './BaseApiService';

export interface MetaUserData {
  name?: string;
  email?: string;
  picture?: string;
}

export class MetaUserService extends BaseApiService {
  /**
   * Fetch user data using a Meta access token
   */
  public static async fetchUserData(token: string): Promise<MetaUserData> {
    try {
      console.log('Fetching Meta user data...');
      this.validateToken(token, 'fetchUserData');
      
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );
      
      const data = await this.processApiResponse(response, 'fetchUserData');
      
      console.log('Meta user data fetched successfully:', { name: data.name, email: data.email });
      
      return {
        name: data.name,
        email: data.email,
        picture: data.picture?.data.url
      };
    } catch (error) {
      return this.handleApiError(error, 'fetchUserData');
    }
  }
}

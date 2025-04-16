
import { BaseApiService } from './BaseApiService';

export class MetaConnectionTestService extends BaseApiService {
  public static async testConnection(token: string): Promise<{
    success: boolean;
    error?: string;
    userId?: string;
    userName?: string;
    hasAdAccess?: boolean;
  }> {
    try {
      this.validateToken(token, 'testConnection');
      const response = await fetch(`${this.BASE_URL}/${this.API_VERSION}/me?access_token=${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        const error = errorData?.error || {};
        console.error('Meta API Connection Test Failed:', {
          message: error.message || 'Connection test failed',
          code: error.code,
          type: error.type,
          status: response.status
        });
        return { success: false, error: error.message || 'Connection test failed' };
      }

      const data = await response.json();
      console.log('Meta API Connection Test Successful:', data);
      return { 
        success: true,
        userId: data.id,
        userName: data.name,
        hasAdAccess: true
      };
    } catch (error: any) {
      console.error('Error during Meta API connection test:', error);
      return { success: false, error: error.message || 'An error occurred during the connection test' };
    }
  }
}

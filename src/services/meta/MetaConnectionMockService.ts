
import { BaseMockService } from './BaseMockService';

export class MetaConnectionMockService extends BaseMockService {
  public static async fetchUserData(): Promise<any> {
    return {};
  }
  
  public static async fetchAdAccounts(): Promise<any[]> {
    return [];
  }
  
  public static async fetchAdAccountDetails(): Promise<any> {
    return {};
  }
  
  public static async testConnection(): Promise<any> {
    return { success: false, error: 'Mock mode is disabled' };
  }
  
  public static async fetchBusinessManagers(): Promise<any[]> {
    return [];
  }
  
  public static async fetchAdAccountsForBusiness(): Promise<any[]> {
    return [];
  }
}

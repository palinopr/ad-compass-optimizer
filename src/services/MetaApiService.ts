
import { MetaUserService } from './api/MetaUserService';
import { MetaAdAccountService } from './api/MetaAdAccountService';
import { MetaBusinessService } from './api/MetaBusinessService';
import { MetaConnectionService } from './api/MetaConnectionService';
import type { ConnectionTestResult } from './api/MetaConnectionService';

/**
 * Meta API Service
 * This class delegates to specialized service classes for different API operations
 */
export class MetaApiService {
  private static readonly API_VERSION = 'v17.0';
  private static readonly BASE_URL = 'https://graph.facebook.com';

  /**
   * Fetch user data using a Meta access token
   */
  public static async fetchUserData(token: string) {
    return MetaUserService.fetchUserData(token);
  }

  /**
   * Fetch ad accounts for the authenticated user
   */
  public static async fetchAdAccounts(token: string) {
    return MetaAdAccountService.fetchAdAccounts(token);
  }

  /**
   * Test Meta API connection with the provided token
   */
  public static async testConnection(token: string): Promise<ConnectionTestResult> {
    return MetaConnectionService.testConnection(token);
  }

  /**
   * Fetch business managers for the authenticated user
   */
  public static async fetchBusinessManagers(token: string) {
    return MetaBusinessService.fetchBusinessManagers(token);
  }

  /**
   * Fetch ad accounts for a specific business manager
   */
  public static async fetchAdAccountsForBusiness(token: string, businessId: string) {
    return MetaAdAccountService.fetchAdAccountsForBusiness(token, businessId);
  }
}

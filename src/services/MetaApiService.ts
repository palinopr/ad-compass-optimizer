
import { BaseApiService } from './api/BaseApiService';
import { MetaAdAccount, MetaAdAccountService } from './api/MetaAdAccountService';
import { MetaAdAccountDetailService } from './api/MetaAdAccountDetailService';
import { MetaRateLimitService } from './api/MetaRateLimitService';
import { MetaUserService, MetaUserData } from './api/MetaUserService';
import { MetaConnectionTestService } from './api/MetaConnectionTestService';
import { MetaBusinessManagerService } from './api/MetaBusinessManagerService';

export class MetaApiService extends BaseApiService {
  // Rate limit management - forwarded from MetaRateLimitService
  public static isRateLimited = MetaRateLimitService.isRateLimited;
  public static getRateLimitInfo = MetaRateLimitService.getRateLimitInfo;
  public static getRateLimitTimeRemaining = MetaRateLimitService.getRateLimitTimeRemaining;
  public static clearRateLimit = MetaRateLimitService.clearRateLimit;
  public static overrideRateLimit = MetaRateLimitService.overrideRateLimit;
  public static isRateLimitOverridden = MetaRateLimitService.isRateLimitOverridden;

  // User data fetch - forwarding from MetaUserService with correct return type
  public static fetchUserData(token: string): Promise<MetaUserData> {
    return MetaUserService.fetchUserData(token);
  }

  // Connection test - forwarded from MetaConnectionTestService
  public static testConnection(token: string) {
    return MetaConnectionTestService.testConnection(token);
  }

  // Business managers - forwarded from MetaBusinessManagerService
  public static fetchBusinessManagers(token: string) {
    return MetaBusinessManagerService.fetchBusinessManagers(token);
  }

  public static fetchAdAccountsForBusiness(token: string, businessId: string) {
    return MetaBusinessManagerService.fetchAdAccountsForBusiness(token, businessId);
  }

  // Ad accounts - forwarded from MetaAdAccountService
  public static fetchAdAccounts(token: string): Promise<MetaAdAccount[]> {
    return MetaAdAccountService.fetchAdAccounts(token);
  }

  // Ad account details - forwarded from MetaAdAccountDetailService
  public static fetchAdAccountDetails(token: string, accountId: string): Promise<MetaAdAccount> {
    return MetaAdAccountDetailService.fetchAdAccountDetails(token, accountId);
  }

  // Protected method used by the API service
  protected static validateToken(token: string, method: string) {
    if (!token || token.length < 50) {
      console.warn(`[META API ${method}] Invalid token:`, token);
      throw new Error('Invalid Meta access token');
    }
  }
}

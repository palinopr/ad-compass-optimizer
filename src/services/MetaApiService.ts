
import { RateLimitManager } from './api/rate-limit/RateLimitManager';
import { MetaConnectionService, ConnectionTestResult } from './api/MetaConnectionService';
import { MetaUserService } from './api/MetaUserService';
import { MetaAdAccountService, MetaAdAccount } from './api/MetaAdAccountService';
import { MetaBusinessService, MetaBusinessManager } from './api/MetaBusinessService';
import { MetaCampaignService, MetaCampaign } from './api/MetaCampaignService';

export class MetaApiService {
  public static isMockMode(): boolean {
    return false;
  }

  // Rate limit management methods
  public static isRateLimited(): boolean {
    return RateLimitManager.isRateLimited();
  }

  public static getRateLimitTimeRemaining(): number | null {
    return RateLimitManager.getRateLimitTimeRemaining();
  }

  public static getRateLimitInfo(): any {
    return RateLimitManager.getRateLimitInfo();
  }

  public static clearRateLimit(): void {
    RateLimitManager.clearRateLimit();
  }

  public static overrideRateLimit(override: boolean = true): void {
    RateLimitManager.overrideRateLimit(override);
  }

  public static isRateLimitOverridden(): boolean {
    return RateLimitManager.isRateLimitOverridden();
  }

  // Connection methods
  public static async testConnection(token: string): Promise<ConnectionTestResult> {
    return MetaConnectionService.testConnection(token);
  }

  // User methods
  public static async fetchUserData(token: string): Promise<any> {
    return MetaUserService.fetchUserData(token);
  }

  // Ad Account methods
  public static async fetchAdAccounts(token: string): Promise<MetaAdAccount[]> {
    return MetaAdAccountService.fetchAdAccounts(token);
  }

  public static async fetchAdAccountDetails(token: string, accountId: string): Promise<MetaAdAccount> {
    return MetaAdAccountService.fetchAdAccountDetails(token, accountId);
  }

  // Business methods
  public static async fetchBusinessManagers(token: string): Promise<MetaBusinessManager[]> {
    return MetaBusinessService.fetchBusinessManagers(token);
  }

  public static async fetchAdAccountsForBusiness(token: string, businessId: string): Promise<MetaAdAccount[]> {
    // For now, this simply calls through to the AdAccountService
    // In a real implementation, we would filter by business ID
    return MetaAdAccountService.fetchAdAccounts(token);
  }

  // Campaign methods
  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    return MetaCampaignService.fetchCampaigns(token, adAccountId);
  }
}

RateLimitManager.initRateLimitState();


import { MetaCampaignMockService } from './meta/MetaCampaignMockService';
import { MetaInsightsMockService } from './meta/MetaInsightsMockService';
import { MetaConnectionMockService } from './meta/MetaConnectionMockService';
import { RateLimitManager } from './api/rate-limit/RateLimitManager';
import { MockApiService } from './api/mock/MockApiService';

export class MetaApiService {
  public static isMockMode(): boolean {
    return MockApiService.isMockMetaApiMode() || localStorage.getItem("USE_MOCK_MODE") === "true";
  }

  // Re-export connection methods
  public static fetchUserData = MetaConnectionMockService.fetchUserData;
  public static fetchAdAccounts = MetaConnectionMockService.fetchAdAccounts;
  public static fetchAdAccountDetails = MetaConnectionMockService.fetchAdAccountDetails;
  public static testConnection = MetaConnectionMockService.testConnection;
  public static fetchBusinessManagers = MetaConnectionMockService.fetchBusinessManagers;
  public static fetchAdAccountsForBusiness = MetaConnectionMockService.fetchAdAccountsForBusiness;

  // Re-export campaign methods
  public static fetchCampaigns = MetaCampaignMockService.fetchCampaigns;

  // Re-export insights methods
  public static fetchInsights = MetaInsightsMockService.fetchInsights;
  public static fetchCampaignInsights = MetaInsightsMockService.fetchCampaignInsights;
  public static fetchAccountInsights = MetaInsightsMockService.fetchAccountInsights;
  public static fetchDemographicInsights = MetaInsightsMockService.fetchDemographicInsights;
  public static fetchGeographicInsights = MetaInsightsMockService.fetchGeographicInsights;

  // Rate limit management methods
  public static isRateLimited(): boolean {
    return this.isMockMode() ? false : RateLimitManager.isRateLimited();
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
}

RateLimitManager.initRateLimitState();

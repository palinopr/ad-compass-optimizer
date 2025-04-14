import { MetaUserService } from './api/MetaUserService';
import { MetaAdAccountService } from './api/MetaAdAccountService';
import { MetaBusinessService } from './api/MetaBusinessService';
import { MetaConnectionService, ConnectionTestResult } from './api/MetaConnectionService';
import MetaCampaignService from './api/MetaCampaignService';
import MetaInsightsService from './api/MetaInsightsService';
import { RateLimitManager } from './api/rate-limit/RateLimitManager';
import { RequestQueueManager } from './api/queue/RequestQueueManager';
import { ErrorUtils } from './api/errors/ErrorUtils';
import { mockFunnelData } from './api/mock/mockCampaignData';
import { MockApiService } from './api/mock/MockApiService';

export class MetaApiService {
  private static readonly API_VERSION = 'v17.0';
  private static readonly BASE_URL = 'https://graph.facebook.com';

  public static isMockMode(): boolean {
    // Use global mock mode detection from MockApiService
    return MockApiService.isMockMetaApiMode() || localStorage.getItem("USE_MOCK_MODE") === "true";
  }

  public static async executeWithRateLimiting<T>(
    requestFn: () => Promise<T>, 
    options: { bypassQueue?: boolean, skipRateLimitCheck?: boolean } = {}
  ): Promise<T> {
    if (this.isMockMode()) {
      console.log('🎭 Bypassing API call in mock mode');
      return Promise.resolve({} as T);
    }

    if (!options.skipRateLimitCheck && RateLimitManager.isRateLimited() && !RateLimitManager.isRateLimitOverridden()) {
      const remainingTime = RateLimitManager.getRateLimitTimeRemaining();
      console.log(`API is rate limited. Remaining time: ${remainingTime} seconds`);
      
      if (options.bypassQueue) {
        throw new Error(`API rate limit in effect. Please retry after ${remainingTime} seconds.`);
      }
      
      return RequestQueueManager.addToQueue(requestFn);
    }
    
    try {
      return await requestFn();
    } catch (error: any) {
      if (ErrorUtils.isRateLimitError(error)) {
        const { retryAfter, code, message } = ErrorUtils.handleRateLimitError(error);
        RateLimitManager.setRateLimit(retryAfter, { code, message });
        
        if (options.bypassQueue) {
          throw error;
        }
        
        return RequestQueueManager.addToQueue(requestFn);
      }
      
      throw error;
    }
  }

  private static getMockAdAccounts() {
    return [{
      id: 'act_123456789',
      name: 'Mock Ad Account 1',
      account_id: '123456789',
      account_status: 1,
      currency: 'USD'
    }];
  }

  private static getMockUserData() {
    return {
      id: 'mock_user_123',
      name: 'Mock User',
      email: 'mock@example.com',
      picture: 'https://via.placeholder.com/50x50'
    };
  }

  private static getMockBusinessManagers() {
    return [{
      id: 'mock_business_123',
      name: 'Mock Business',
      verification_status: 'verified',
      created_time: '2023-01-01T00:00:00Z'
    }];
  }

  private static getMockConnectionTest(): ConnectionTestResult {
    return {
      success: true,
      userId: 'mock_user_123',
      userName: 'Mock User',
      hasAdAccess: true,
      error: undefined,
      details: undefined,
      permissionsWarning: undefined
    };
  }

  public static async fetchUserData(token: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock user data');
      return this.getMockUserData();
    }
    return this.executeWithRateLimiting(() => 
      MetaUserService.fetchUserData(token)
    );
  }

  public static async fetchAdAccounts(token: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock ad accounts');
      return this.getMockAdAccounts();
    }
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccounts(token)
    );
  }

  public static async fetchAdAccountDetails(token: string, accountId: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock ad account details');
      return this.getMockAdAccounts()[0];
    }
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccountDetails(token, accountId)
    );
  }

  public static async testConnection(token: string): Promise<ConnectionTestResult> {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock connection test');
      return this.getMockConnectionTest();
    }
    return this.executeWithRateLimiting(() => 
      MetaConnectionService.testConnection(token)
    , { bypassQueue: true });
  }

  public static async fetchBusinessManagers(token: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock business managers');
      return this.getMockBusinessManagers();
    }
    return this.executeWithRateLimiting(() => 
      MetaBusinessService.fetchBusinessManagers(token)
    );
  }

  public static async fetchAdAccountsForBusiness(token: string, businessId: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock ad accounts for business');
      return this.getMockAdAccounts();
    }
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccountsForBusiness(token, businessId)
    );
  }
  
  public static async fetchCampaigns(token: string, adAccountId: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock campaigns');
      return MockApiService.getMockCampaigns();
    }
    return this.executeWithRateLimiting(() => 
      MetaCampaignService.fetchCampaigns(token, adAccountId)
    );
  }

  public static async fetchInsights(token: string, objectId: string, options = {}) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock insights');
      return MockApiService.getMockInsights(objectId);
    }
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchInsights(token, objectId, options)
    );
  }

  public static async fetchCampaignInsights(token: string, campaignId: string, options = {}) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock campaign insights');
      return MockApiService.getMockInsights(campaignId);
    }
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchCampaignInsights(token, campaignId, options)
    );
  }

  public static async fetchAccountInsights(token: string, accountId: string, options = {}) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock account insights');
      return MockApiService.getMockInsights(accountId);
    }
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchAccountInsights(token, accountId, options)
    );
  }

  public static async fetchDemographicInsights(token: string, objectId: string, options = {}) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock demographic insights');
      return { data: [] };
    }
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchDemographicInsights(token, objectId, options)
    );
  }

  public static async fetchGeographicInsights(token: string, objectId: string, options = {}) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock geographic insights');
      return { data: [] };
    }
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchGeographicInsights(token, objectId, options)
    );
  }

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

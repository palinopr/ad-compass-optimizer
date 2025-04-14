
import { MetaUserService } from './api/MetaUserService';
import { MetaAdAccountService } from './api/MetaAdAccountService';
import { MetaBusinessService } from './api/MetaBusinessService';
import { MetaConnectionService } from './api/MetaConnectionService';
import MetaCampaignService from './api/MetaCampaignService';
import MetaInsightsService from './api/MetaInsightsService';
import { RateLimitManager } from './api/rate-limit/RateLimitManager';
import { RequestQueueManager } from './api/queue/RequestQueueManager';
import { ErrorUtils } from './api/errors/ErrorUtils';

export class MetaApiService {
  private static readonly API_VERSION = 'v17.0';
  private static readonly BASE_URL = 'https://graph.facebook.com';

  public static async executeWithRateLimiting<T>(
    requestFn: () => Promise<T>, 
    options: { bypassQueue?: boolean, skipRateLimitCheck?: boolean } = {}
  ): Promise<T> {
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

  // API Methods
  public static async fetchUserData(token: string) {
    return this.executeWithRateLimiting(() => 
      MetaUserService.fetchUserData(token)
    );
  }

  public static async fetchAdAccounts(token: string) {
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccounts(token)
    );
  }

  public static async fetchAdAccountDetails(token: string, accountId: string) {
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccountDetails(token, accountId)
    );
  }

  public static async testConnection(token: string) {
    return this.executeWithRateLimiting(() => 
      MetaConnectionService.testConnection(token)
    , { bypassQueue: true });
  }

  public static async fetchBusinessManagers(token: string) {
    return this.executeWithRateLimiting(() => 
      MetaBusinessService.fetchBusinessManagers(token)
    );
  }

  public static async fetchAdAccountsForBusiness(token: string, businessId: string) {
    return this.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccountsForBusiness(token, businessId)
    );
  }
  
  public static async fetchCampaigns(token: string, adAccountId: string) {
    return this.executeWithRateLimiting(() => 
      MetaCampaignService.fetchCampaigns(token, adAccountId)
    );
  }

  public static async fetchInsights(token: string, objectId: string, options = {}) {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchInsights(token, objectId, options)
    );
  }

  public static async fetchCampaignInsights(token: string, campaignId: string, options = {}) {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchCampaignInsights(token, campaignId, options)
    );
  }

  public static async fetchAccountInsights(token: string, accountId: string, options = {}) {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchAccountInsights(token, accountId, options)
    );
  }

  public static async fetchDemographicInsights(token: string, objectId: string, options = {}) {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchDemographicInsights(token, objectId, options)
    );
  }

  public static async fetchGeographicInsights(token: string, objectId: string, options = {}) {
    return this.executeWithRateLimiting(() => 
      MetaInsightsService.fetchGeographicInsights(token, objectId, options)
    );
  }
}

// Initialize rate limit state
RateLimitManager.initRateLimitState();

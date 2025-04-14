
import { BaseMockService } from './BaseMockService';
import { MetaInsightsService } from '../api/insights/MetaInsightsService';
import { MockApiService } from '../api/mock/MockApiService';

export class MetaInsightsMockService extends BaseMockService {
  public static async fetchInsights(token: string, objectId: string, options = {}) {
    if (this.checkMockMode('insights fetch')) {
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
}


import { MockConfig } from './config/mockConfig';
import { MockRequestLogger, MockedRequest } from './logger/MockRequestLogger';
import { MockCampaignService } from './services/MockCampaignService';
import { MockFunnelService } from './services/MockFunnelService';
import { MockInsightsService } from './services/MockInsightsService';

export class MockApiService {
  /**
   * Check if mock Meta API mode is active
   */
  public static isMockMetaApiMode = MockConfig.isMockMetaApiMode;

  /**
   * Disable mock Meta API mode
   */
  public static disableMockMetaApiMode = MockConfig.disableMockMode;

  /**
   * Get recent mock API calls for diagnostics
   */
  public static getRecentMockCalls(): MockedRequest[] {
    return MockRequestLogger.getRecentCalls();
  }

  /**
   * Generate mock campaign response
   */
  public static getMockCampaigns = MockCampaignService.getMockCampaigns;

  /**
   * Generate mock funnel data response
   */
  public static getMockFunnelData = MockFunnelService.getMockFunnelData;

  /**
   * Generate mock insights response
   */
  public static getMockInsights = MockInsightsService.getMockInsights;

  /**
   * Check if a specific service is being mocked
   */
  public static isServiceMocked(serviceName: 'campaigns' | 'funnel' | 'insights' | 'creative'): boolean {
    if (!this.isMockMetaApiMode()) return false;
    // Currently all services are mocked when mock mode is enabled
    return true;
  }
}


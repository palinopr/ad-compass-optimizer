
import { MockConfig } from './config/mockConfig';
import { MockRequestLogger, MockedRequest } from './logger/MockRequestLogger';
import { MockCampaignService } from './services/MockCampaignService';
import { MockFunnelService } from './services/MockFunnelService';
import { MockInsightsService } from './services/MockInsightsService';

export class MockApiService {
  /**
   * Check if mock Meta API mode is active
   */
  public static isMockMetaApiMode(): boolean {
    try {
      return MockConfig.isMockMetaApiMode();
    } catch (e) {
      console.error("Error checking mock Meta API mode:", e);
      return false;
    }
  }

  /**
   * Disable mock Meta API mode
   */
  public static disableMockMetaApiMode(): void {
    try {
      MockConfig.disableMockMode();
    } catch (e) {
      console.error("Error disabling mock Meta API mode:", e);
    }
  }

  /**
   * Get recent mock API calls for diagnostics
   */
  public static getRecentMockCalls(): MockedRequest[] {
    try {
      return MockRequestLogger.getRecentCalls();
    } catch (e) {
      console.error("Error getting recent mock calls:", e);
      return [];
    }
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
    try {
      if (!this.isMockMetaApiMode()) return false;
      // Currently all services are mocked when mock mode is enabled
      return true;
    } catch (e) {
      console.error("Error checking if service is mocked:", e);
      return false;
    }
  }
}


/**
 * Central service for managing mock API responses
 * This allows us to test UI and data flows without hitting real Meta API endpoints
 */
import { mockFunnelData } from './mockCampaignData';
import { MetaCampaign } from '../MetaCampaignService';
import { FunnelData } from '../types/funnelTypes';
import { InsightsResponse } from '../insights/types';
import { generateMockInsights } from './mockInsightsData';

export class MockApiService {
  private static readonly MOCK_FLAG = 'mockMeta';
  private static readonly MOCK_STORAGE_KEY = 'USE_MOCK_META_API';

  /**
   * Check if mock Meta API mode is active
   */
  public static isMockMetaApiMode(): boolean {
    // Check URL parameter for immediate activation
    const urlParams = new URLSearchParams(window.location.search);
    const mockEnabled = urlParams.get(this.MOCK_FLAG) === 'true';
    
    // Store the setting in localStorage if URL param is set
    if (mockEnabled) {
      localStorage.setItem(this.MOCK_STORAGE_KEY, 'true');
      console.log('🎭 Meta API Mock Mode activated via URL parameter');
    }
    
    // Check localStorage for persistent setting
    return mockEnabled || localStorage.getItem(this.MOCK_STORAGE_KEY) === 'true';
  }

  /**
   * Disable mock Meta API mode
   */
  public static disableMockMetaApiMode(): void {
    localStorage.removeItem(this.MOCK_STORAGE_KEY);
    console.log('🎭 Meta API Mock Mode disabled');
  }

  /**
   * Generate mock campaign response
   */
  public static getMockCampaigns(filterStatus?: string): MetaCampaign[] {
    console.log('🎭 Returning mock campaigns from MockApiService');
    
    let campaigns = [...mockFunnelData.campaigns];
    
    // Apply status filter if provided
    if (filterStatus && filterStatus !== 'all') {
      campaigns = campaigns.filter(campaign => 
        campaign.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    return campaigns;
  }

  /**
   * Generate mock funnel data response
   */
  public static getMockFunnelData(): FunnelData {
    console.log('🎭 Returning mock funnel data from MockApiService');
    return mockFunnelData;
  }

  /**
   * Generate mock insights response with full data
   */
  public static getMockInsights(objectId: string): InsightsResponse {
    console.log(`🎭 Returning mock insights for ${objectId} from MockApiService`);
    return generateMockInsights(objectId);
  }
}

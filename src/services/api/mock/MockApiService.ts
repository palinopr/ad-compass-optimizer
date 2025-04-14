/**
 * Central service for managing mock API responses
 * This allows us to test UI and data flows without hitting real Meta API endpoints
 */
import { mockFunnelData } from './mockCampaignData';
import { MetaCampaign } from '../MetaCampaignService';
import { FunnelData } from '../types/funnelTypes';
import { InsightsResponse } from '../insights/types';
import { generateMockInsights } from './mockInsightsData';

interface MockedRequest {
  endpoint: string;
  timestamp: string;
  response: any;
}

export class MockApiService {
  private static readonly MOCK_FLAG = 'mockMeta';
  private static readonly MOCK_STORAGE_KEY = 'USE_MOCK_META_API';
  private static recentMockCalls: MockedRequest[] = [];

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

  private static logMockRequest(endpoint: string, response: any) {
    console.log(`✅ Mocking Meta API call: ${endpoint}`);
    console.log('  → Using mocked response data');
    
    this.recentMockCalls.unshift({
      endpoint,
      timestamp: new Date().toISOString(),
      response
    });

    // Keep only last 10 calls
    if (this.recentMockCalls.length > 10) {
      this.recentMockCalls.pop();
    }
  }

  /**
   * Get recent mock API calls for diagnostics
   */
  public static getRecentMockCalls(): MockedRequest[] {
    return this.recentMockCalls;
  }

  /**
   * Generate mock campaign response
   */
  public static getMockCampaigns(filterStatus?: string): MetaCampaign[] {
    this.logMockRequest('/campaigns', mockFunnelData.campaigns);
    
    let campaigns = [...mockFunnelData.campaigns];
    
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
    this.logMockRequest('/funnel', mockFunnelData);
    return mockFunnelData;
  }

  /**
   * Generate mock insights response with full data
   */
  public static getMockInsights(objectId: string): InsightsResponse {
    const insights = generateMockInsights(objectId);
    this.logMockRequest(`/insights/${objectId}`, insights);
    return insights;
  }

  /**
   * Check if a specific service is being mocked
   */
  public static isServiceMocked(serviceName: 'campaigns' | 'funnel' | 'insights' | 'creative'): boolean {
    if (!this.isMockMetaApiMode()) return false;

    // Currently all services are mocked when mock mode is enabled
    return true;
  }
}

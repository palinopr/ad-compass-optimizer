
import { FunnelData } from '../../types/funnelTypes';
import { mockFunnelData } from '../mockCampaignData';
import { MockRequestLogger } from '../logger/MockRequestLogger';

export class MockFunnelService {
  public static getMockFunnelData(): FunnelData {
    MockRequestLogger.logRequest('/funnel', mockFunnelData);
    return mockFunnelData;
  }
}


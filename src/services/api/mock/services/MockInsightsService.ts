
import { InsightsResponse } from '../../insights/types';
import { generateMockInsights } from '../mockInsightsData';
import { MockRequestLogger } from '../logger/MockRequestLogger';

export class MockInsightsService {
  public static getMockInsights(objectId: string): InsightsResponse {
    const insights = generateMockInsights(objectId);
    MockRequestLogger.logRequest(`/insights/${objectId}`, insights);
    return insights;
  }
}



import { InsightsRequestThrottler } from '@/services/api/insights/requestThrottling';
import { insightsThrottlingState, insightsQueueState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/hooks/use-toast');
jest.mock('@/hooks/campaigns/fetch-utils/insights/batchConfig', () => ({
  insightsThrottlingState: {
    isActiveThrottling: jest.fn(),
    startThrottling: jest.fn(),
    stopThrottling: jest.fn(),
  },
  insightsQueueState: {
    isActiveLock: jest.fn(),
    lock: jest.fn(),
    unlock: jest.fn(),
  },
  BATCH_CONFIG: {
    MAX_QUEUE_SIZE: 50,
    BATCH_SIZE: 2,
    MIN_REQUEST_INTERVAL: 750,
    BATCH_INTERVAL: 3500,
  },
  delay: (ms: number) => Promise.resolve(),
  requestedCampaignIds: new Set(),
}));

describe('InsightsRequestThrottler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    InsightsRequestThrottler.reset();
    (insightsThrottlingState.isActiveThrottling as jest.Mock).mockReturnValue(false);
    (insightsQueueState.isActiveLock as jest.Mock).mockReturnValue(false);
  });

  describe('throttleRequests', () => {
    it('should prevent requests when global throttling is active', async () => {
      (insightsThrottlingState.isActiveThrottling as jest.Mock).mockReturnValue(true);
      
      const result = await InsightsRequestThrottler.throttleRequests([() => Promise.resolve()]);
      
      expect(result).toEqual([]);
      expect(insightsThrottlingState.isActiveThrottling).toHaveBeenCalled();
    });

    it('should prevent requests when queue is locked', async () => {
      (insightsQueueState.isActiveLock as jest.Mock).mockReturnValue(true);
      
      const result = await InsightsRequestThrottler.throttleRequests([() => Promise.resolve()]);
      
      expect(result).toEqual([]);
      expect(insightsQueueState.isActiveLock).toHaveBeenCalled();
    });

    it('should reject requests exceeding MAX_QUEUE_SIZE', async () => {
      const requests = Array(51).fill(() => Promise.resolve());
      
      const result = await InsightsRequestThrottler.throttleRequests(requests);
      
      expect(result).toEqual([]);
    });

    it('should process requests in batches', async () => {
      const mockResults = ['result1', 'result2', 'result3'];
      const requests = mockResults.map((result) => jest.fn().mockResolvedValue(result));
      
      const results = await InsightsRequestThrottler.throttleRequests(requests);
      
      expect(results).toEqual(mockResults);
      requests.forEach(request => expect(request).toHaveBeenCalled());
    });

    it('should handle failed requests gracefully', async () => {
      const successRequest = jest.fn().mockResolvedValue('success');
      const failedRequest = jest.fn().mockRejectedValue(new Error('API Error'));
      
      const results = await InsightsRequestThrottler.throttleRequests([successRequest, failedRequest]);
      
      expect(results).toContain('success');
      expect(results).toContain(null);
    });

    it('should respect rate limiting on error code 4', async () => {
      const successRequest = jest.fn().mockResolvedValue('success');
      const rateLimitError = new Error('Rate limit');
      (rateLimitError as any).code = 4;
      const failedRequest = jest.fn().mockRejectedValue(rateLimitError);
      
      const results = await InsightsRequestThrottler.throttleRequests([successRequest, failedRequest]);
      
      expect(results.length).toBeLessThanOrEqual(2);
      expect(toast).toHaveBeenCalled();
    });
  });
});

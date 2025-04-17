
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { QueueItem } from './types/QueueTypes';
import { insightsQueueState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

export class QueueProcessor {
  private lastRequestTime = 0;

  async processQueueItems<T>(
    items: QueueItem<T>[],
    removeItem: () => void,
    onProcessingComplete: () => void
  ): Promise<void> {
    while (items.length > 0) {
      await this.enforceRequestDelay();
      
      const item = items[0];
      if (!item) break;
      
      this.lastRequestTime = Date.now();
      console.log(`🔄 [STRICT QUEUE] Processing request ${item.id}`);
      
      try {
        const result = await item.request();
        removeItem();
        item.resolve(result);
      } catch (error) {
        removeItem();
        console.error(`❌ [STRICT QUEUE] Request ${item.id} failed:`, error);
        item.reject(error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    onProcessingComplete();
  }

  private async enforceRequestDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (this.lastRequestTime > 0 && timeSinceLastRequest < THROTTLING_CONFIG.MIN_REQUEST_INTERVAL) {
      const waitTime = THROTTLING_CONFIG.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ [STRICT QUEUE] Waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  reset(): void {
    this.lastRequestTime = 0;
  }
}

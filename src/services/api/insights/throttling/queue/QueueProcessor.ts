
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { QueueItem } from './types/QueueTypes';

export class QueueProcessor {
  private lastRequestTime = 0;
  private activeRequest = false;

  async processQueueItems<T>(
    items: QueueItem<T>[],
    removeItem: () => void,
    onProcessingComplete: () => void
  ): Promise<void> {
    if (this.activeRequest) {
      console.warn('⚠️ [QUEUE] Queue processor already active, aborting duplicate process attempt');
      return;
    }
    
    this.activeRequest = true;
    
    try {
      while (items.length > 0) {
        await this.enforceRequestDelay();
        
        const item = items[0];
        if (!item) break;
        
        this.lastRequestTime = Date.now();
        console.log(`🔄 [QUEUE] Processing request ${item.id}`);
        
        try {
          const result = await item.request();
          removeItem();
          item.resolve(result);
        } catch (error) {
          removeItem();
          console.error(`❌ [QUEUE] Request ${item.id} failed:`, error);
          item.reject(error);
        }
        
        // Add a small delay between requests for safety
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    } finally {
      this.activeRequest = false;
      onProcessingComplete();
    }
  }

  private async enforceRequestDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (this.lastRequestTime > 0 && timeSinceLastRequest < THROTTLING_CONFIG.MIN_REQUEST_INTERVAL) {
      const waitTime = THROTTLING_CONFIG.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ [QUEUE] Waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  reset(): void {
    this.lastRequestTime = 0;
    this.activeRequest = false;
  }
}

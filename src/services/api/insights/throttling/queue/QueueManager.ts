
import { QueueItem, QueueStats } from './types/QueueTypes';
import { QueueProcessor } from './QueueProcessor';
import { insightsQueueState, insightsThrottlingState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

export class QueueManager {
  private static instance: QueueManager;
  private isProcessing = false;
  private processingLock = false;
  private requestQueue: QueueItem[] = [];
  private processor: QueueProcessor;
  private lastRequestTime = 0;
  private processedRequests = new Set<string>();

  private constructor() {
    this.processor = new QueueProcessor();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.reset());
    }
    console.log('🔒 [STRICT QUEUE] Singleton instance created');
  }

  static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  async enqueueRequest<T>(
    request: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    // Check for duplicates using Set for O(1) lookup
    if (this.processedRequests.has(requestId)) {
      console.log(`🔄 [QUEUE] Skipping duplicate request ${requestId}`);
      return Promise.reject(new Error('Duplicate request'));
    }

    if (insightsThrottlingState.isActiveThrottling()) {
      console.warn('⛔ [QUEUE] Global throttling active - rejecting request');
      return Promise.reject(new Error('Global throttling active'));
    }

    if (insightsQueueState.isActiveLock()) {
      console.warn('⛔ [QUEUE] Queue is locked - rejecting request');
      return Promise.reject(new Error('Queue is locked'));
    }

    console.log(`📝 [QUEUE] Enqueueing request: ${requestId}`);
    
    return new Promise<T>((resolve, reject) => {
      const queueItem: QueueItem<T> = {
        id: requestId,
        request,
        resolve,
        reject,
        startTime: Date.now()
      };

      this.requestQueue.push(queueItem);
      this.processedRequests.add(requestId);
      this.attemptProcessQueue();
    });
  }

  private attemptProcessQueue(): void {
    if (this.processingLock || this.requestQueue.length === 0) {
      return;
    }
    
    this.processingLock = true;
    
    try {
      if (this.isProcessing) {
        console.log(`⏱️ [QUEUE] Already processing (${this.requestQueue.length} items waiting)`);
        return;
      }
      
      this.processQueue();
    } finally {
      this.processingLock = false;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.warn('⚠️ [QUEUE] Attempted to process queue while already processing!');
      return;
    }

    this.isProcessing = true;
    console.log(`🚀 [QUEUE] Starting to process ${this.requestQueue.length} items`);
    insightsQueueState.lock();

    try {
      await this.processor.processQueueItems(
        this.requestQueue,
        () => this.requestQueue.shift(),
        () => {
          this.isProcessing = false;
          insightsQueueState.unlock();
        }
      );
    } catch (error) {
      console.error('❌ [QUEUE] Fatal error processing queue:', error);
      this.isProcessing = false;
      insightsQueueState.unlock();
    }
  }

  isActive(): boolean {
    return this.isProcessing || this.requestQueue.length > 0;
  }

  getStats(): QueueStats {
    return {
      queueSize: this.requestQueue.length,
      isProcessing: this.isProcessing,
      activeRequests: this.requestQueue.length
    };
  }

  reset(): void {
    for (const item of this.requestQueue) {
      item.reject(new Error('Queue was reset'));
    }
    
    this.requestQueue = [];
    this.isProcessing = false;
    this.processingLock = false;
    this.processor.reset();
    this.processedRequests.clear();
    console.log('🧹 [QUEUE] Queue cleared');
  }
}

// Export the singleton instance
export const strictSequentialQueue = QueueManager.getInstance();
